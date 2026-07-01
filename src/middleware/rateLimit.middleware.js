const rateLimitStore = new Map(); // key: ip:route → { timestamps: number[] }

export const rateLimiter = (maxRequests, windowMs) => (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { timestamps: [] });
  }
  
  const entry = rateLimitStore.get(key);
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
  
  if (entry.timestamps.length >= maxRequests) {
    const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many requests',
      message: 'कृपया काही सेकंदांनी पुन्हा प्रयत्न करा',
      retryAfterSeconds: retryAfter
    });
  }
  
  entry.timestamps.push(now);
  next();
};

export default rateLimiter;
