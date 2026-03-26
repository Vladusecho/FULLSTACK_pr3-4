/**
 * Начальные данные пользователей.
 * В практиках 3–4 мы используем in-memory массив (без БД).
 * 
 * Тестовые пользователи для разработки:
 * - Email: user@test.com, seller@test.com, admin@test.com
 * - Пароль для всех: 123456
 */
module.exports = [
  {
    id: "user_dev1",
    email: "user@test.com",
    first_name: "Иван",
    last_name: "Пользователь",
    password: "$2b$10$MXOZZmWxmCO0G9AlH1TPNeedtxEw9/L3XE56VFXPRQgXH1vIjPpQ6",
    role: "user",
    isBlocked: false,
  },
  {
    id: "seller_dev1",
    email: "seller@test.com",
    first_name: "Петр",
    last_name: "Продавец",
    password: "$2b$10$MXOZZmWxmCO0G9AlH1TPNeedtxEw9/L3XE56VFXPRQgXH1vIjPpQ6",
    role: "seller",
    isBlocked: false,
  },
  {
    id: "admin_dev1",
    email: "admin@test.com",
    first_name: "Сергей",
    last_name: "Администратор",
    password: "$2b$10$MXOZZmWxmCO0G9AlH1TPNeedtxEw9/L3XE56VFXPRQgXH1vIjPpQ6",
    role: "admin",
    isBlocked: false,
  },
];