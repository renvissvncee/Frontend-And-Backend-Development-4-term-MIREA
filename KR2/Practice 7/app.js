const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt')

const app = express();
const port = 3000;

// Логирование
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`\n[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`)
        if (req.method == 'PATCH' || req.method == 'PUT' || req.method == 'POST') {
            console.log('Body:', req.body);
        }
    });
    next();
})

app.use(express.json());

let users = [];

let products = [];

function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hashSync(password, rounds);
}

function verifyPassword(newPassword, user) {
    if (!bcrypt.compareSync(newPassword, user.hashedPassword)) {
        return false;
    }
    return true;
}

function findUser(login) {
    return users.find(u => u.email === login);
}

app.post('/api/auth/register', (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    trimmedEmail = email.trim();
    trimmedFirstName = first_name.trim();
    trimmedLastName = last_name.trim();

    if (!trimmedEmail || !trimmedFirstName || !trimmedLastName) {
        return res.status(400).json({ error: "Fields cannot be empty" });
    }

    if (findUser(trimmedEmail)) {
        return res.status(409).json({ error: "User already exists"});
    }

    let newUser = {
        id: nanoid(5),
        email: trimmedEmail,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        hashedPassword: hashPassword(password)
    };

    users.push(newUser);

    res.status(201).json(newUser);
});

app.post('/api/auth/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({error: 'Email and password are required'});
    }

    let user = findUser(login);
    if (!user) {
        return res.status(404).json({ error: "User not found"});
    }
    else if (!verifyPassword(password, user)) {
        return res.status(401).json({ error: "Not authorized"});
    }

    res.status(200).json({ message: "Succes authorized"});
});





app.post('/api/products', (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const parsedPrice = Number(price);

    if (!trimmedTitle || !trimmedCategory || !trimmedDescription || isNaN(parsedPrice)) {
        return res.status(400).json({ error: "Fields cannot be empty" });
    }

    if (products.find(p => p.title === trimmedTitle)) {
        return res.status(409).json({ error: "Product already exists" });
    }

    let newProduct = {
        id: nanoid(5),
        title: trimmedTitle,
        category: trimmedCategory,
        description: trimmedDescription,
        price: parsedPrice
    }

    products.push(newProduct);

    res.status(201).json(newProduct);

});

app.get('/api/products', (req, res) => {
    res.status(200).json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
});

app.get('/api', (req, res) => {
    res.status(200).send('Главная страница');
});

function updateStringField(product, field, value, res) {
    if (value !== undefined) {
        const trimmed = value.trim();
        if (!trimmed) {
            res.status(400).json({ error: `${field} cannot be empty` });
            return false;
        }
        product[field] = trimmed;
    }
    return true;
}
function updatePrice(product, price, res) {
    if (price !== undefined) {
        const parsed = Number(price);
        if (isNaN(parsed)) {
            res.status(400).json({ error: "Price must be a number" });
            return false;
        }
        product.price = parsed;
    }
    return true;
}

app.put('/api/products/:id', (req, res) => {
    const { title, category, description, price } = req.body;

    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    if (!updateStringField(product, 'title', title, res)) return;
    if (!updateStringField(product, 'category', category, res)) return;
    if (!updateStringField(product, 'description', description, res)) return;
    if (!updatePrice(product, price, res)) return;
    
    res.status(200).json(product);
}); 

app.delete('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});