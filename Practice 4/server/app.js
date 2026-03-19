const express = require('express');
const { nanoid } = require('nanoid');
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

// GET-запрос на вывод всех товаров
app.get('/products', (req, res) => {
    res.send(products);
});

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

// GET-запрос на вывод товара по id
app.get('/products/:id', (req, res) => {
    let product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.send(product);
});

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