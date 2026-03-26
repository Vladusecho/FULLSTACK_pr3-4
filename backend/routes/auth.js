const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  removeRefreshToken,
} = require("../middleware/auth");

const router = express.Router();

let users = require("../data/users");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя (используется как логин)
 *         first_name:
 *           type: string
 *           description: Имя пользователя
 *         last_name:
 *           type: string
 *           description: Фамилия пользователя
 *         password:
 *           type: string
 *           description: Хешированный пароль
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация пользователей
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               first_name:
 *                 type: string
 *                 description: Имя
 *               last_name:
 *                 type: string
 *                 description: Фамилия
 *               password:
 *                 type: string
 *                 description: Пароль (будет хеширован)
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *       400:
 *         description: Ошибка валидации или email уже занят
 */
router.post("/register", async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: nanoid(8),
      email: email.trim().toLowerCase(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      password: hashedPassword,
    };

    users.push(newUser);

    // Не возвращаем пароль
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 description: Пароль
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Неверные учетные данные
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Успешный вход
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ accessToken, refreshToken, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Текущий аутентифицированный пользователь
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пользователь успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Неавторизован
 */
router.get("/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить токены с помощью refresh-токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh-токен
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Неверный или истекший refresh-токен
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  const user = verifyRefreshToken(refreshToken);
  if (!user) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  // Удаляем старый refresh-токен
  removeRefreshToken(refreshToken);

  // Генерируем новую пару
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

module.exports = router;