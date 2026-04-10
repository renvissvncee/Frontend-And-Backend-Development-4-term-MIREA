const express = require('express');
const { nanoid } = require('nanoid');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

const cors = require("cors");

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], 
}));

// Массив товаров:
let products = [
    {
        id: nanoid(6), 
        title: 'Музыкальная пластинка', 
        price: 5000, 
        category: 'Музыкальные товары',
        description: 'Крутится и звучит',
        amount: 150
    },
    {
        id: nanoid(6), 
        title: 'Сигара', 
        price: 1000, 
        category: 'Табак',
        description: 'Курится и дымит',
        amount: 150
    },
    {
        id: nanoid(6), 
        title: 'Духи', 
        price: 10000, 
        category: 'Парфюмерия',
        description: 'Пшыкаются и пахнут',
        amount: 150
    },
];

// Логирование
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`\n[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
            console.log('   Body: ', req.body);
        }
    });
    next();
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API управления товарами',
      version: '1.0.0',
      description: 'Простое API для управления товарами',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер',
      },
    ],
  },
  // Путь к файлам, в которых мы будем писать JSDoc-комментарии (наш текущий файл)
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - category
 *         - description
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID товара
 *         title:
 *           type: string
 *           description: Название товара
 *         price:
 *           type: integer
 *           description: Цена товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описаните товара
 *         amount:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "abc123"
 *         name: "Магний"
 *         price: 250
 *         category: БАДы
 *         description: Антистресс
 *         amount: 20000
 */

// Функция-помощник
function findProductOr404(id, res) {
    let product = products.find(p => p.id = id);
    if (!product) {
        res.status(404).json({error: "Product not found"});
        return null;
    }
    return product;
}

// GET-запрос на корневую страницу
app.get('/', (req, res) => {
    res.send('Главная страница');
})

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Возвращает список всех товаров
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
// GET-запрос на вывод всех товаров
app.get('/products', (req, res) => {
    res.send(products);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - category
 *               - description
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: integer
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка в теле запроса
 */
// POST-запрос с добавлением товара
app.post('/products', (req, res) => {
    const { title, price, category, description, amount } = req.body;

    const newProduct = {
        id: Date.now(),
        title: title,
        price: price,
        category: category,
        description: description,
        amount: amount
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получает товар по ID
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
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
// GET-запрос на вывод товара по id
app.get('/products/:id', (req, res) => {
    let product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.send(product);
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Обновляет данные товара
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
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: integer
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
// PATCH-запрос на обновление данных товара
app.patch('/products/:id', (req, res) => {
    let product = findProductOr404(req.params.id, res);
    if (!product) return;

    // Нельзя PATCH без полей
    if (req.body.title === undefined && req.body.price == undefined && req.body.category == undefined
        && req.body.description == undefined && req.body.amount == undefined) {
        return res.status(400).json({
            error: "Nothing to update"
        });
    }

    const { title, price, category, description, amount } = req.body;

    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (amount !== undefined) product.amount = amount;

    res.send(product);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 */
// DELETE-запрос на удаление товара
app.delete('/products/:id', (req, res) => {
    const id = req.params.id; 
    
    if (!products.some(p => p.id == id)) {
        return res.status(404).json({error: "Product is not found"});
    }
    
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// Код 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({error: "Not found"});
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({error: "Internal server error"});
});

app.listen(port, () => {
    console.log('Сервер запущен')
});