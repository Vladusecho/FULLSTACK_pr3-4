const express = require("express");
const { authenticateToken, checkRole } = require("../middleware/auth");

const router = express.Router();

let users = require("../data/users");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *         isBlocked:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Недостаточно прав
 */
router.get("/", authenticateToken, checkRole("admin"), (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       403:
 *         description: Недостаточно прав
 */
router.get("/:id", authenticateToken, checkRole("admin"), (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *               isBlocked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       403:
 *         description: Недостаточно прав
 */
router.put("/:id", authenticateToken, checkRole("admin"), (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { first_name, last_name, role, isBlocked } = req.body;

  if (first_name !== undefined) user.first_name = first_name.trim();
  if (last_name !== undefined) user.last_name = last_name.trim();
  if (role !== undefined && ['user', 'seller', 'admin'].includes(role)) user.role = role;
  if (isBlocked !== undefined) user.isBlocked = isBlocked;

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       404:
 *         description: Пользователь не найден
 *       403:
 *         description: Недостаточно прав
 */
router.delete("/:id", authenticateToken, checkRole("admin"), (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.isBlocked = true;
  res.json({ message: "User blocked" });
});

module.exports = router;