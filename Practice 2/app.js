const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Массив товаров:
let products = [
    {id: 1, title: 'Муызыкальная пластинка', price: 5000},
    {id: 2, title: 'Сигара', price: 1000},
    {id: 3, title: 'Духи', price: 10000},
];

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
    const { title, price } = req.body;

    const newProduct = {
        id: Date.now(),
        title: title,
        price: price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// GET-запрос на вывод товара по id
app.get('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    res.send(product);
});

// PATCH-запрос на обновление данных товара
app.patch('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    const { title, price } = req.body;

    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;

    res.send(product);
});

// DELETE-запрос на удаление товара
app.delete('/products/:id', (req, res) => {
    products.filter(p => p.id !== req.params.id);
    res.send('Ок');
});

app.listen(port, () => {
    console.log('Сервер запущен')
});