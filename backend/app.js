const express = require("express");
const cors = require("cors");

const logger = require("./middleware/logger");
const { redisClient } = require("./middleware/cache");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const setupSwagger = require("./swagger");

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Конвейер обработки запроса (pipeline) в Express:
 * 1) middleware (app.use(...)) выполняются сверху вниз
 * 2) затем роуты (app.use('/api/...', router))
 * 3) если никто не ответил — можно отдать 404
 */

// 1) Разрешаем запросы с фронта (React dev server)
// Если у вас другой порт фронта — поменяйте origin.
app.use(
  cors({
    origin: true,
  })
);

// 2) Парсим JSON из тела запроса -> req.body
app.use(express.json());

// 3) Наш логгер (для наглядности)
app.use(logger);

// Healthcheck / главная
app.get("/", (req, res) => {
  res.send("Express API is running. Try /api/products or /api-docs for Swagger documentation");
});

// 4) Роуты API (все пути /api/products/... обрабатывает productsRouter)
app.use("/api/products", productsRouter);

// Роуты аутентификации
app.use("/api/auth", authRouter);

// Роуты пользователей
app.use("/api/users", usersRouter);

setupSwagger(app);

// 5) Если не совпало ни с одним роутом — 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📡 API: http://localhost:${PORT}/api/products`);
  console.log(`🔓 CORS enabled for: http://localhost:3001`);
  console.log(`💾 Redis cache enabled for: /api/users (1min), /api/products (10min)`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await redisClient.quit();
  process.exit(0);
});
