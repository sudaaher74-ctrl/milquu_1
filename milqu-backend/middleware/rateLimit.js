const buckets = new Map();

function cleanupExpiredBuckets() {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }
}

setInterval(cleanupExpiredBuckets, 5 * 60 * 1000).unref();

function getClientIp(req) {
    return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
}

function createRateLimiter(options = {}) {
    const windowMs = options.windowMs || 60 * 1000;
    const max = options.max || 60;
    const namespace = options.namespace || 'global';
    const message = options.message || 'Too many requests. Please try again in a moment.';
    const keyGenerator = options.keyGenerator || ((req) => getClientIp(req));

    return function rateLimit(req, res, next) {
        const now = Date.now();
        const key = `${namespace}:${keyGenerator(req)}`;
        let bucket = buckets.get(key);

        if (!bucket || bucket.resetAt <= now) {
            bucket = {
                count: 0,
                resetAt: now + windowMs
            };
        }

        bucket.count += 1;
        buckets.set(key, bucket);

        const remaining = Math.max(0, max - bucket.count);
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

        if (bucket.count > max) {
            const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({ success: false, message });
        }

        next();
    };
}

module.exports = {
    createRateLimiter
};
