export  function getCommonFlags(): string[] {
    return [
        '--js-runtimes', 'bun',       // Use Bun as JS runtime (fixes missing formats)
        '--no-playlist',               // Never download playlists
        '--max-filesize', '2048m',     // CRITICAL: Protect server from downloading impossibly large files (like 10 hour videos)
    ];
}

export function getCookieArgs(platform: string): string[] {
    if (platform.includes('instagram') && process.env.IG_COOKIES_FILE) {

        console.log(process.env.IG_COOKIES_FILE);
        return ['--cookies', process.env.IG_COOKIES_FILE];
    }
    if (process.env.YT_COOKIES_FILE) {
        console.log(process.env.YT_COOKIES_FILE);
        return ['--cookies', process.env.YT_COOKIES_FILE];
    }
    return [];
}