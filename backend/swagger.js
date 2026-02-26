const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products API',
      version: '1.0.0',
      description: 'API для управления товарами с Swagger документацией',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор пользователя',
              example: 'abc123',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'Иван Иванов',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
              description: 'Роль пользователя',
              example: 'user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата обновления',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['title', 'price'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор товара',
              example: 'abc123',
            },
            title: {
              type: 'string',
              description: 'Название товара',
              example: 'Смартфон iPhone 13',
            },
            price: {
              type: 'number',
              description: 'Цена товара',
              example: 999.99,
            },
            category: {
              type: 'string',
              description: 'Категория товара',
              example: 'Электроника',
            },
            description: {
              type: 'string',
              description: 'Описание товара',
              example: 'Новый смартфон от Apple',
            },
            stock: {
              type: 'integer',
              description: 'Количество на складе',
              example: 50,
            },
            rating: {
              type: 'number',
              description: 'Рейтинг товара',
              example: 4.5,
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL изображения',
              example: 'https://example.com/image.jpg',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке',
              example: 'Product not found',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.js', './models/*.js'], // Пути к файлам с аннотациями
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Products API Documentation',
  }));
  
  // Добавляем JSON спецификацию для скачивания
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('📚 Swagger документация доступна по адресу: http://localhost:3000/api-docs');
};