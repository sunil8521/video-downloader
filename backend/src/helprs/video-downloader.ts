import { spawn } from 'child_process';
import { unlink, mkdir, readdir, stat, access } from 'fs/promises';
import { join } from 'path';
import { getCommonFlags, getCookieArgs } from './common-setting';
import {downloadJobs} from "../index"
const TEMP_DIR = '/tmp/video-downloads';
await mkdir(TEMP_DIR, { recursive: true }).catch(() => {});




function parseProgress(line: string): { percent: number; speed: string; eta: string } | null {
    // Parse yt-dlp progress lines like:
    // [download]  45.3% of ~77.16MiB at 2.50MiB/s ETA 00:15
    const match = line.match(/(\d+\.?\d*)%.*?at\s+(\S+).*?ETA\s+(\S+)/);
    if (match) {
        return {
            percent: parseFloat(match[1] || '0'),
            speed: match[2] || '',
            eta: match[3] || '',
        };
    }
    // Also handle lines with just percentage
    const percentMatch = line.match(/(\d+\.?\d*)%/);
    if (percentMatch) {
        return {
            percent: parseFloat(percentMatch[1] || '0'),
            speed: '',
            eta: '',
        };
    }
    return null;
}


export async function runYouTubeDownload(url: string, height: number, formatId: string, isAudio: boolean, downloadId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const job = downloadJobs.get(downloadId);
        if (!job) return reject(new Error('Job not found'));

        const args: string[] = [];

        if (isAudio) {
            args.push(
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '-o', job.filePath,
                ...getCommonFlags(),
                ...getCookieArgs('youtube'),
                '--newline',
                '--progress',
                '--restrict-filenames',
                url
            );
        } else {
            let formatSelector: string;

            // FIX: Prioritize specific formatId, otherwise use ytdlp.online's exact compatible selector
            if (formatId && formatId !== 'best') {
                formatSelector = `${formatId}+bestaudio[ext=m4a]/best`;
            } else if (height > 0) {
                // Exact ytdlp.online compatible selector for height
                formatSelector = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`;
            } else {
                formatSelector = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
            }

            args.push(
                '-f', formatSelector,
                '-S', 'vcodec:h264,res,acodec:m4a', // Force H.264 for maximum compatibility to avoid "audio only" playback on Windows

                '--merge-output-format', 'mp4',
                '-N', '4',
                '--throttled-rate', '100K',
                '--no-part',
                '--restrict-filenames',
                '-o', job.filePath,
                ...getCommonFlags(),
                ...getCookieArgs('youtube'),
                '--newline',
                '--progress',
                url
            );
        }

        const ytdlp = spawn('yt-dlp', args);
        let lastError = '';

        ytdlp.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                const progress = parseProgress(line);
                if (progress && job) {
                    job.progress = progress.percent;
                    job.speed = progress.speed;
                    job.eta = progress.eta;
                }
                if (line.includes('[Merger]') || line.includes('Merging')) {
                    job.status = 'merging';
                    job.progress = 99;
                }
            }
        });

        ytdlp.stderr.on('data', (data) => {
            const text = data.toString();
            lastError += text;
            const lines = text.split('\n');
            for (const line of lines) {
                const progress = parseProgress(line);
                if (progress && job) {
                    job.progress = progress.percent;
                    job.speed = progress.speed;
                    job.eta = progress.eta;
                }
            }
        });

        ytdlp.on('close', async (code) => {
            if (code !== 0) {
                job.status = 'error';
                job.error = lastError || 'YouTube download failed';
                unlink(job.filePath).catch(() => {});
                return reject(new Error(job.error));
            }

            try {
                await access(job.filePath);
            } catch {
                // FIX: Ensure we don't accidentally grab the unmerged audio file when expecting video
                const files = await readdir(TEMP_DIR);
                // FIX: Support .mkv fallback if FFmpeg merges AV1 into mkv!
                const found = files.find(f => {
                    if (!f.startsWith(downloadId)) return false;
                    return isAudio 
                        ? (f.endsWith('.mp3') || f.endsWith('.m4a')) 
                        : (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv'));
                });
                
                if (found) {
                    job.filePath = join(TEMP_DIR, found);
                } else {
                    job.status = 'error';
                    job.error = 'Merge failed. FFmpeg might not be installed.';
                    return reject(new Error(job.error));
                }
            }

            job.status = 'done';
            job.progress = 100;
            try {
                const fileStat = await stat(job.filePath);
                job.filesize = fileStat.size;
            } catch { /* ignore */ }
            
            resolve();
        });
    });
}

export async function runInstagramDownload(url: string, formatId: string, downloadId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const job = downloadJobs.get(downloadId);
        if (!job) return reject(new Error('Job not found'));

        const ytdlp = spawn('yt-dlp', [
            '-f', formatId === 'best' ? 'best' : formatId,
            '-o', job.filePath,
            ...getCommonFlags(),
            ...getCookieArgs('instagram'),
            '--newline',
            '--progress',
            url
        ]);

        let lastError = '';

        ytdlp.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                const progress = parseProgress(line);
                if (progress && job) {
                    job.progress = progress.percent;
                    job.speed = progress.speed;
                    job.eta = progress.eta;
                }
            }
        });

        ytdlp.stderr.on('data', (data) => {
            const text = data.toString();
            lastError += text;
            const lines = text.split('\n');
            for (const line of lines) {
                const progress = parseProgress(line);
                if (progress && job) {
                    job.progress = progress.percent;
                    job.speed = progress.speed;
                    job.eta = progress.eta;
                }
            }
        });

        ytdlp.on('close', (code) => {
            if (code !== 0) {
                job.status = 'error';
                job.error = lastError || 'Instagram download failed';
                unlink(job.filePath).catch(() => {});
                return reject(new Error(lastError || 'Instagram download failed'));
            }
            job.status = 'done';
            job.progress = 100;
            resolve();
        });
    });
}