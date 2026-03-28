import rateLimit from 'express-rate-limit';

export const infoLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Too many requests. Please wait a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const downloadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many download requests. Please wait a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});