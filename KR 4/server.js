const { Pool } = require('pg');
const express = require('express');
const app = express();

// Подключение к PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'FBR_KR4',
    password: 'Adler272',
    port: 5432,
});

app.use(express.json());

// 1. POST /api/users - Создание пользователя
app.post('/api/users', async (req, res) => {
    try {
        const { first_name, last_name, age } = req.body;
        
        // Проверяем, что все поля есть
        if (!first_name || !last_name || !age) {
            return res.status(400).json({ error: 'first_name, last_name и age обязательны' });
        }
        
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, age, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
            [first_name, last_name, age]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET /api/users - Получение всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET /api/users/:id - Получение одного пользователя
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. PATCH /api/users/:id - Обновление пользователя
app.patch('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, age } = req.body;
        
        // Собираем поля для обновления динамически
        const updates = [];
        const values = [];
        let counter = 1;
        
        if (first_name !== undefined) {
            updates.push(`first_name = $${counter}`);
            values.push(first_name);
            counter++;
        }
        if (last_name !== undefined) {
            updates.push(`last_name = $${counter}`);
            values.push(last_name);
            counter++;
        }
        if (age !== undefined) {
            updates.push(`age = $${counter}`);
            values.push(age);
            counter++;
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }
        
        // Добавляем updated_at
        updates.push(`updated_at = NOW()`);
        values.push(id);
        
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`;
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE /api/users/:id - Удаление пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ message: 'Пользователь удален', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});