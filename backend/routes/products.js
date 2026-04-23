const express = require("express");
const { nanoid } = require("nanoid");
const { authenticateToken, checkRole } = require("../middleware/auth");
const { cacheMiddleware, invalidateCacheMiddleware } = require("../middleware/cache");

const router = express.Router();

let products = require("../data/products");

// Время кэша - 10 минут (600 секунд)
const CACHE_TTL_PRODUCTS = 600;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *         title:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", authenticateToken, checkRole("user"), cacheMiddleware(CACHE_TTL_PRODUCTS), (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Информация о товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", authenticateToken, checkRole("user"), cacheMiddleware(CACHE_TTL_PRODUCTS), (req, res) => {
  const product = findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название товара
 *               category:
 *                 type: string
 *                 description: Категория товара
 *               description:
 *                 type: string
 *                 description: Описание товара
 *               price:
 *                 type: number
 *                 description: Цена товара
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", authenticateToken, checkRole("seller"), invalidateCacheMiddleware(["cache:/api/products*"]), (req, res) => {
  const { title, category, description, price } = req.body;

  if (typeof title !== "string" || title.trim() === "" ||
      typeof category !== "string" || category.trim() === "" ||
      typeof description !== "string" || description.trim() === "" ||
      typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "All fields are required and must be valid" });
  }

  const newProduct = {
    id: nanoid(8),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: price,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить параметры товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Новое название
 *               category:
 *                 type: string
 *                 description: Новая категория
 *               description:
 *                 type: string
 *                 description: Новое описание
 *               price:
 *                 type: number
 *                 description: Новая цена
 *     responses:
 *       200:
 *         description: Товар обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", authenticateToken, checkRole("seller"), invalidateCacheMiddleware(["cache:/api/products*"]), (req, res) => {
  const product = findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { title, category, description, price } = req.body;

  if (typeof title !== "string" || title.trim() === "" ||
      typeof category !== "string" || category.trim() === "" ||
      typeof description !== "string" || description.trim() === "" ||
      typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "All fields are required and must be valid" });
  }

  product.title = title.trim();
  product.category = category.trim();
  product.description = description.trim();
  product.price = price;

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", authenticateToken, checkRole("admin"), invalidateCacheMiddleware(["cache:/api/products*"]), (req, res) => {
  const id = req.params.id;
  const before = products.length;
  products = products.filter((p) => p.id !== id);

  if (products.length === before) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ ok: true });
});

/**
 * Вспомогательная функция: найти товар по id
 */
function findById(id) {
  return products.find((p) => p.id === id) || null;
}

module.exports = router;