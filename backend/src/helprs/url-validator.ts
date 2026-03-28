const SUPPORTED_PLATFORMS = [
    'youtube.com', 'youtu.be',
    'instagram.com', 'instagr.am'
];

export function validateUrl(url: string): { valid: boolean; platform?: string } {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.replace('www.', '');
        const platform = SUPPORTED_PLATFORMS.find(p => hostname.includes(p));
        if (!platform) return { valid: false };
        return { valid: true, platform };
    } catch {
        return { valid: false };
    }
}