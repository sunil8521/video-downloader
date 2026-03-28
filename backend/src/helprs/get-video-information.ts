import { spawn } from 'child_process';
import { getCommonFlags, getCookieArgs } from './common-setting';




function getQualityLabel(height: number): string {
    if (height >= 2160) return '4K Ultra HD';
    if (height >= 1440) return 'QHD';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    if (height >= 480) return 'SD';
    if (height >= 360) return 'Low';
    if (height >= 240) return 'Very Low';
    return 'Lowest';
}

function getAudioLabel(abr: number): string {
    if (abr >= 256) return 'High Quality';
    if (abr >= 128) return 'Standard';
    if (abr >= 64) return 'Compressed';
    return 'Low Quality';
}

function getCodecLabel(vcodec: string): string {
    if (!vcodec) return '';
    if (vcodec.includes('avc1')) return 'H.264';
    if (vcodec.includes('av01')) return 'AV1';
    if (vcodec.includes('vp9') || vcodec.includes('vp09')) return 'VP9';
    return (vcodec.split('.')[0] || vcodec).toUpperCase();
}

async function getYouTubeInfo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const ytdlp = spawn('yt-dlp', [
            '-j',
            '--no-download',
            ...getCommonFlags(),
            ...getCookieArgs('youtube'),
            url
        ]);
        //yt-dlp -j --no-download --js-runtimes bun --no-playlist --max-filesize 2048m "YOUR_URL_HERE"
        let output = '';
        let errorOutput = '';

        ytdlp.stdout.on('data', (data) => output += data.toString());
        ytdlp.stderr.on('data', (data) => errorOutput += data.toString());

        ytdlp.on('close', (code) => {
            if (code !== 0) {
                if (errorOutput.includes('Sign in to confirm')) {
                    return reject(new Error('Age-restricted content. Cookies required.'));
                }
                if (errorOutput.includes('Private video')) {
                    return reject(new Error('This video is private.'));
                }
                if (errorOutput.includes('is not a valid URL')) {
                    return reject(new Error('Invalid video URL.'));
                }
                return reject(new Error(errorOutput || 'Failed to extract info'));
            }

            try {
                const info = JSON.parse(output);

                // ── Video formats: include mp4 AND webm (not just mp4) ───────
                const videoFormats = info.formats?.filter((f: any) =>
                    f.vcodec !== 'none' &&
                    ['mp4', 'webm'].includes(f.ext) &&
                    !f.format_note?.includes('storyboard') &&
                    f.height && f.height >= 144 &&
                    // IMPORTANT: Exclude m3u8/HLS streams — they have no filesize
                    // and cause merge issues. Only keep DASH/https formats.
                    f.protocol !== 'm3u8_native' && f.protocol !== 'm3u8'
                ) || [];

                // Deduplicate by resolution, prefer: DASH with filesize > others
                // Priority: H.264 (most compatible) > AV1 (modern) > VP9
                const qualityMap = new Map();
                videoFormats.forEach((f: any) => {
                    const height = f.height || 0;
                    const key = `${height}p`;
                    const isH264 = f.vcodec?.includes('avc1');
                    const isAV1 = f.vcodec?.includes('av01');
                    const existing = qualityMap.get(key);

                    // Codec priority: H.264 (most compatible) > VP9 > AV1
                    const isVP9 = f.vcodec?.includes('vp9') || f.vcodec?.includes('vp09');
                    const priority = isH264 ? 3 : isVP9 ? 2 : (isAV1 ? 1 : 0);
                    
                    const existingVcodec = existing?.vcodec || '';
                    const existingPriority = existing
                        ? (existingVcodec.includes('avc1') ? 3 : (existingVcodec.includes('vp9') || existingVcodec.includes('vp09')) ? 2 : existingVcodec.includes('av01') ? 1 : 0)
                        : 0;

                    // Also prefer formats that have known filesize
                    const hasSize = !!(f.filesize || f.filesize_approx);
                    const existingHasSize = existing ? !!existing.filesize : false;

                    // Replace if: no existing, OR higher codec priority with filesize,
                    // OR same priority but this one has filesize and existing doesn't
                    const shouldReplace = !existing
                        || (priority > existingPriority)
                        || (priority === existingPriority && hasSize && !existingHasSize);

                    if (shouldReplace) {
                        qualityMap.set(key, {
                            format_id: f.format_id,
                            quality: key,
                            label: getQualityLabel(height),
                            ext: f.ext,
                            resolution: f.resolution,
                            filesize: f.filesize || f.filesize_approx,
                            vcodec: f.vcodec,
                            acodec: f.acodec,
                            has_audio: f.acodec !== 'none',
                            codec_label: getCodecLabel(f.vcodec),
                        });
                    }
                });

                const sortedVideoFormats = Array.from(qualityMap.values())
                    .sort((a: any, b: any) => {
                        const heightA = parseInt(a.quality) || 0;
                        const heightB = parseInt(b.quality) || 0;
                        return heightB - heightA;
                    });

                // Find the best audio filesize to estimate combined download size
                const bestAudioFormat = info.formats?.find((f: any) =>
                    f.format_id === '140' || (f.ext === 'm4a' && f.acodec !== 'none')
                );
                const bestAudioSize = bestAudioFormat?.filesize || bestAudioFormat?.filesize_approx || 0;

                // For video-only formats, add audio size to get estimated total
                sortedVideoFormats.forEach((fmt: any) => {
                    if (!fmt.has_audio && fmt.filesize && bestAudioSize) {
                        fmt.filesize = fmt.filesize + bestAudioSize;
                    }
                });

                // ── Audio formats ────────────────────────────────────────
                const audioFormats = info.formats?.filter((f: any) =>
                    f.vcodec === 'none' && f.acodec !== 'none'
                ) || [];

                // Deduplicate audio by bitrate, prefer m4a
                const audioMap = new Map();
                audioFormats.forEach((f: any) => {
                    const abr = f.abr || 0;
                    const key = `${Math.round(abr)}kbps`;
                    const isM4a = f.ext === 'm4a';
                    const existing = audioMap.get(key);

                    if (!existing || (isM4a && existing.ext !== 'm4a')) {
                        audioMap.set(key, {
                            format_id: f.format_id,
                            quality: key,
                            label: getAudioLabel(abr),
                            ext: f.ext,
                            filesize: f.filesize || f.filesize_approx,
                            acodec: f.acodec,
                            abr: abr,
                        });
                    }
                });

                const sortedAudioFormats = Array.from(audioMap.values())
                    .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));

                resolve({
                    platform: 'youtube',
                    id: info.id,
                    title: info.title,
                    thumbnail: info.thumbnail,
                    duration: info.duration,
                    uploader: info.uploader,
                    webpage_url: info.webpage_url,
                    formats: sortedVideoFormats,
                    audio_formats: sortedAudioFormats,
                    best_format: info.format_id,
                });
            } catch (e) {
                reject(new Error('Failed to parse video info'));
            }
        });
    });
}

// ─── Instagram Info ──────────────────────────────────────────────────────────

async function getInstagramInfo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const ytdlp = spawn('yt-dlp', [
            '-j',
            '--no-download',
            ...getCommonFlags(),
            ...getCookieArgs('instagram'),
            url
        ]);

        let output = '';
        let errorOutput = '';

        ytdlp.stdout.on('data', (data) => output += data.toString());
        ytdlp.stderr.on('data', (data) => errorOutput += data.toString());

        ytdlp.on('close', (code) => {
            if (code !== 0) {
                if (errorOutput.includes('login') || errorOutput.includes('cookie')) {
                    return reject(new Error('Instagram requires authentication. Please provide cookies.'));
                }
                return reject(new Error(errorOutput || 'Failed to extract Instagram info'));
            }

            try {
                const info = JSON.parse(output);

                // Instagram formats are usually fragmented DASH streams which confuse users.
                // It's much simpler and more reliable to just offer a single "Best Video" option
                // which yt-dlp automatically merges and handles correctly behind the scenes.
                const formats = [
                    {
                        format_id: 'best',
                        quality: 'best',
                        label: 'High Quality',
                        ext: 'mp4',
                        resolution: 'HD',
                        filesize: info.filesize_approx || info.filesize || 0,
                        has_audio: true,
                        has_video: true,
                        codec_label: 'Best'
                    }
                ];

                resolve({
                    platform: 'instagram',
                    id: info.id,
                    title: info.title || 'Instagram Video',
                    thumbnail: info.thumbnail,
                    duration: info.duration,
                    uploader: info.uploader || info.channel,
                    webpage_url: info.webpage_url,
                    formats: formats,
                    audio_formats: [],
                    is_reel: url.includes('/reel/'),
                    is_story: url.includes('/stories/'),
                    is_post: url.includes('/p/')
                });
            } catch (e) {
                reject(new Error('Failed to parse Instagram info'));
            }
        });
    });
}



export function getVideoInfo(url: string, platform: string): Promise<any> {
    if (platform.includes('instagram')) {
        return getInstagramInfo(url);
    }
    return getYouTubeInfo(url);
}
