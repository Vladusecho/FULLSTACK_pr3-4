const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log("Redis: Too many reconnection attempts");
        return new Error("Redis max retries exceeded");
      }
      return Math.min(retries * 50, 2000);
    },
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

redisClient.on("ready", () => {
  console.log("Redis Client Ready");
});

redisClient.on("end", () => {
  console.log("Redis Client Disconnected");
});

redisClient.connect().catch((err) => {
  console.log("Redis connection failed:", err);
});

function isRedisAvailable() {
  return redisClient.isOpen;
}

/**
 * Middleware для кэширования GET запросов
 * @param {number} ttl - время жизни кэша в секундах
 * @returns {Function} middleware функция
 */
function cacheMiddleware(ttl) {
  return async (req, res, next) => {
    if (req.method !== "GET" || !isRedisAvailable()) {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`[Cache MISS] ${cacheKey}`);
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        if (isRedisAvailable()) {
          redisClient.setEx(cacheKey, ttl, JSON.stringify(data)).catch((err) => {
            console.log(`[Cache SET ERROR] ${cacheKey}:`, err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.log("[Cache ERROR]:", error);
      next();
    }
  };
}

/**
 * Middleware для инвалидации кэша при изменении данных
 * @param {string[]} patterns - массив паттернов кэшей для удаления
 * @returns {Function} middleware функция
 */
function invalidateCacheMiddleware(patterns) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && isRedisAvailable()) {
        patterns.forEach((pattern) => {
          redisClient
            .keys(pattern)
            .then((keys) => {
              if (keys && keys.length > 0) {
                return redisClient.del(keys);
              }
            })
            .then(() => {
              console.log(`[Cache INVALIDATED] Pattern: ${pattern}`);
            })
            .catch((err) => {
              console.log(`[Cache INVALIDATION ERROR]:`, err);
            });
        });
      }

      return originalJson(data);
    };

    next();
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware,
  redisClient,
};
