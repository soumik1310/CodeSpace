const { createClient }  = require('redis');

// Prefer a full connection URL (copy it from Redis Cloud > Connect) to avoid typos.
// Falls back to separate host / port / password variables.
const redisClient = process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL })
    : createClient({
        username: 'default',
        password: process.env.REDIS_PASS,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT)
        }
    });

module.exports = redisClient;
