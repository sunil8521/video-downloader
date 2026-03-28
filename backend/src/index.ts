import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { unlink, mkdir, readdir, stat, access } from 'fs/promises';
import { createReadStream } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { infoLimiter, downloadLimiter } from './middleware/ratelimiter';
import {validateUrl} from "./helprs/url-validator"
import {getVideoInfo} from "./helprs/get-video-information"
import {runYouTubeDownload, runInstagramDownload} from "./helprs/video-downloader"
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3002","http://localhost:3001"],
    methods: ["GET", "POST"],
}));
app.use(express.json());



// ─── Temp Directory ──────────────────────────────────────────────────────────

const TEMP_DIR = '/tmp/video-downloads';
await mkdir(TEMP_DIR, { recursive: true }).catch(() => {});



// Cleanup old temp files on startup (older than 10 minutes)
async function cleanupTempFiles() {
    try {
        const files = await readdir(TEMP_DIR);
        const now = Date.now();
        for (const file of files) {
            const filePath = join(TEMP_DIR, file);
            const fileStat = await stat(filePath).catch(() => null);
            if (fileStat && now - fileStat.mtimeMs > 10 * 60 * 1000) {
                await unlink(filePath).catch(() => {});
            }
        }
    } catch { /* ignore */ }
}
cleanupTempFiles();
// Run cleanup every 5 minutes
setInterval(cleanupTempFiles, 5 * 60 * 1000);



// ─── Download Job Tracker ────────────────────────────────────────────────────

interface DownloadJob {
    status: 'downloading' | 'merging' | 'done' | 'error';
    progress: number;
    speed: string;
    eta: string;
    filePath: string;
    filename: string;
    filesize: number;
    error?: string;
    isAudio: boolean;
}

export const downloadJobs = new Map<string, DownloadJob>();

// Clean up stale jobs every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of downloadJobs) {
        // Remove completed/errored jobs after 10 minutes
        if (job.status === 'done' || job.status === 'error') {
            // We can't track creation time on the job directly, so check the file
            stat(job.filePath).then(s => {
                if (now - s.mtimeMs > 10 * 60 * 1000) {
                    downloadJobs.delete(id);
                    unlink(job.filePath).catch(() => {});
                }
            }).catch(() => {
                downloadJobs.delete(id);
            });
        }
    }
}, 5 * 60 * 1000);







// Health check
app.get('/health', (_req, res) => {
    res.json({ 
        status: 'ok', 
        platforms: ['youtube', 'instagram'],
        activeJobs: downloadJobs.size,
        timestamp: new Date().toISOString() 
    });
});

// Get video info
app.post('/api/info', infoLimiter, async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const validation = validateUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ 
            error: 'Unsupported platform. Only YouTube and Instagram are supported.' 
        });
    }

    try {
        const info = await getVideoInfo(url, validation.platform!);
        res.json(info);
    } catch (error: any) {
        console.error('Info extraction error:', error.message);
        res.status(400).json({ 
            error: 'Failed to extract video info',
            platform: validation.platform,
            message: error.message 
        });
    }
});

// ─── NEW: Proxy Image to bypass CORS (Instagram thumbnails) ─────────────────

app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        return res.status(400).send('URL required');
    }
    try {
        const response = await fetch(url, {
            headers: {
                // Mimic a browser to avoid Facebook/Instagram blocking
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }
        });
        if (!response.ok) throw new Error('Failed to fetch image');
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Override Helmet to allow frontend display
        res.send(Buffer.from(buffer));
    } catch {
        res.status(500).send('Error proxying image');
    }
});

// ─── NEW: Start Download (returns downloadId immediately) ────────────────────

app.post('/api/download', downloadLimiter, async (req, res) => {
    const { url, formatId, quality, isAudio } = req.body;
    
    if (!url || (!formatId && !quality)) {
        return res.status(400).json({ error: 'URL and quality (or formatId) are required' });
    }

    const validation = validateUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    // FIX: Safely parse isAudio to prevent string "false" from becoming true
    const isAudioBool = isAudio === true || isAudio === 'true';
    const downloadId = randomUUID();
    const ext = isAudioBool ? 'mp3' : 'mp4';
    const filename = `${downloadId}.${ext}`;
    const filePath = join(TEMP_DIR, filename);

    const job: DownloadJob = {
        status: 'downloading',
        progress: 0,
        speed: '',
        eta: '',
        filePath,
        filename,
        filesize: 0,
        isAudio: isAudioBool,
    };
    downloadJobs.set(downloadId, job);

    res.json({ downloadId });

    const height = quality ? parseInt(String(quality).replace('p', ''), 10) : 0;

    try {
        if (validation.platform!.includes('instagram')) {
            await runInstagramDownload(url, formatId || 'best', downloadId);
        } else {
            // FIX: Pass formatIdrunInstagramDownload to the YouTube function
            console.log(formatId,height,isAudioBool,downloadId)
            await runYouTubeDownload(url, height, formatId, isAudioBool, downloadId);
        }
    } catch (error: any) {
        const existingJob = downloadJobs.get(downloadId);
        if (existingJob) {
            existingJob.status = 'error';
            existingJob.error = error.message;
        }
    }
});

// ─── NEW: SSE Progress Stream ────────────────────────────────────────────────

app.get('/api/progress/:downloadId', (req, res) => {
    const { downloadId } = req.params;
    
    const job = downloadJobs.get(downloadId);
    if (!job) {
        return res.status(404).json({ error: 'Download job not found' });
    }

    // Set up SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send progress updates every 500ms
    const interval = setInterval(() => {
        const currentJob = downloadJobs.get(downloadId);
        if (!currentJob) {
            res.write(`data: ${JSON.stringify({ status: 'error', error: 'Job not found' })}\n\n`);
            clearInterval(interval);
            res.end();
            return;
        }

        const data = {
            status: currentJob.status,
            progress: currentJob.progress,
            speed: currentJob.speed,
            eta: currentJob.eta,
            error: currentJob.error,
        };

        res.write(`data: ${JSON.stringify(data)}\n\n`);

        // If done or error, stop sending
        if (currentJob.status === 'done' || currentJob.status === 'error') {
            clearInterval(interval);
            res.end();
        }
    }, 500);

    // Client disconnected
    req.on('close', () => {
        clearInterval(interval);
    });
});

// ─── NEW: Serve Downloaded File (native browser download) ────────────────────

app.get('/api/file/:downloadId', async (req, res) => {
    const { downloadId } = req.params;
    
    const job = downloadJobs.get(downloadId);
    if (!job) {
        return res.status(404).json({ error: 'Download not found' });
    }

    if (job.status !== 'done') {
        return res.status(400).json({ error: 'Download not ready yet', status: job.status });
    }

    // Check file exists
    try {
        await access(job.filePath);
    } catch {
        return res.status(404).json({ error: 'File not found. It may have been cleaned up.' });
    }

    const fileStat = await stat(job.filePath);
    // FIX: Get the ACTUAL extension from the file that yt-dlp created, instead of hardcoding 'mp4'
    // If yt-dlp created an .mkv or .webm, serving it as .mp4 will break the video track!
    const actualExt = job.filePath.split('.').pop() || (job.isAudio ? 'mp3' : 'mp4');
    const safeFilename = `snapload-${downloadId.slice(0, 8)}.${actualExt}`;

    // Set headers for native browser download
    let contentType = 'video/mp4';
    if (job.isAudio) contentType = 'audio/mpeg';
    else if (actualExt === 'webm') contentType = 'video/webm';
    else if (actualExt === 'mkv') contentType = 'video/x-matroska';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', fileStat.size);

    // Stream the file to the client (direct disk write in browser)
    const stream = createReadStream(job.filePath);
    stream.pipe(res);

    stream.on('end', () => {
        // Cleanup file after 2 minutes (give time for slow connections)
        setTimeout(() => {
            unlink(job.filePath).catch(() => {});
            downloadJobs.delete(downloadId);
        }, 2 * 60 * 1000);
    });

    stream.on('error', (err) => {
        console.error('File stream error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream file' });
        }
    });
});


// ─── Download Functions (Background) ─────────────────────────────────────────






// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 SnapLoad backend running on port ${PORT}`);
    // console.log(`📺 Supported: YouTube, Instagram`);
    console.log(`🔒 Rate limiting: /api/info (30/min), /api/download (10/min)`);
    // console.log(`⚡ Using --js-runtimes bun, -N 4 concurrent fragments`);
    // console.log(`📁 Temp dir: ${TEMP_DIR}`);
});