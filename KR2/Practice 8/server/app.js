const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


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

const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

const refreshTokens = new Set();

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            login: user.email,
            role: user.role
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            login: user.email,
            role: user.role
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN
        }
    );
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    const [ scheme, token ] = header.split(" ");
    
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header"});
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token"});
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }
        next();
    };
}


app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;

    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found"});
    }

    res.json(user);
});

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

testPassword = hashPassword("123");
let testUser = {
    id: 0,
    email: "123@mail.ru",
    first_name: "Artem",
    last_name: "Renv",
    hashedPassword: testPassword,
    role: "user"
};

let users = [testUser];

testProduct1 = {
    id: nanoid(5),
    title: "Арбуз",
    category: "Фрукты",
    description: "Очень вкусный",
    price: 100
}

testProduct2 = {
    id: nanoid(5),
    title: "Банан",
    category: "Фрукты",
    description: "Очень сладкий",
    price: 200
}
let products = [testProduct1, testProduct2];



app.post('/api/auth/register', (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    trimmedEmail = email.trim();
    trimmedFirstName = first_name.trim();
    trimmedLastName = last_name.trim();

    if (!trimmedEmail || !trimmedFirstName || !trimmedLastName) {
        return res.status(400).json({ error: "Fields cannot be empty" });
    }

    if (users.find(u => u.email === trimmedEmail)) {
        return res.status(409).json({ error: "User already exists"});
    }

    const newUser = {
        id: users.length + 1,
        email: trimmedEmail,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        hashedPassword: hashPassword(password),
        role: role || "user"
    };

    users.push(newUser);

    res.status(201).json(newUser);
});

app.post('/api/auth/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({error: 'Email and password are required'});
    }

    let user = users.find(u => u.email === login);
    if (!user) {
        return res.status(404).json({ error: "User not found"});
    }
    else if (!verifyPassword(password, user)) {
        return res.status(401).json({ error: "Not authorized"});
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({ accessToken, refreshToken });
});


app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(400).json({ error: "refresh token is required"});
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token"});
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find(u => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({ error: "User not found"});
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token"});
    }
});

// GET /api/users - список всех пользователей (только админ)
app.get('/api/users', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const usersWithoutPassword = users.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role
    }));
    res.status(200).json(usersWithoutPassword);
});

// GET /api/users/:id - получить пользователя по id (только админ)
app.get('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
    });
});

// PUT /api/users/:id - обновить пользователя (только админ)
app.put('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const userId = parseInt(req.params.id);
    const { email, first_name, last_name, role } = req.body;
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    if (email !== undefined) {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return res.status(400).json({ error: "Email cannot be empty" });
        }
        // Проверка, что email не занят другим пользователем
        const emailExists = users.find(u => u.email === trimmedEmail && u.id !== userId);
        if (emailExists) {
            return res.status(409).json({ error: "Email already in use" });
        }
        user.email = trimmedEmail;
    }
    
    if (first_name !== undefined) {
        const trimmed = first_name.trim();
        if (!trimmed) return res.status(400).json({ error: "First name cannot be empty" });
        user.first_name = trimmed;
    }
    
    if (last_name !== undefined) {
        const trimmed = last_name.trim();
        if (!trimmed) return res.status(400).json({ error: "Last name cannot be empty" });
        user.last_name = trimmed;
    }
    
    if (role !== undefined) {
        if (!["user", "seller", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }
        user.role = role;
    }
    
    res.status(200).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
    });
});

// DELETE /api/users/:id - заблокировать пользователя (только админ)
app.delete('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const userId = parseInt(req.params.id);
    
    // Не даём удалить самого себя
    if (req.user.sub === userId) {
        return res.status(403).json({ error: "Cannot delete yourself" });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
    
    // Помечаем пользователя как заблокированный (удаляем из массива)
    users.splice(userIndex, 1);
    res.status(204).send();
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

app.get('/api/products', authMiddleware, (req, res) => {
    res.status(200).json(products);
});

app.get('/api/products/:id', authMiddleware, (req, res) => {
    console.log(products);
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

app.put('/api/products/:id', authMiddleware, (req, res) => {
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

app.delete('/api/products/:id', authMiddleware, (req, res) => {
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