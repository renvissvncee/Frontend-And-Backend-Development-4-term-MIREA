const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// ПОДКЛЮЧЕНИЕ С ПРОВЕРКОЙ
console.log('🟡 Пытаюсь подключиться к MongoDB...');

mongoose.connect('mongodb://localhost:27017/mydb')
  .then(() => {
    console.log('✅ MongoDB подключена!');
    
    app.listen(3000, () => {
      console.log('🚀 Сервер на http://localhost:3000');
    });
  })
  .catch(err => {
    console.log('❌ Ошибка подключения к MongoDB:');
    console.log(err.message);
    console.log('\n💡 Проверь:');
    console.log('1. Запущена ли служба MongoDB (net start MongoDB)');
    console.log('2. Правильный ли URL подключения');
  });

// СХЕМА
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  age: { type: Number, required: true },
  created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  updated_at: { type: Number, default: () => Math.floor(Date.now() / 1000) }
});

const User = mongoose.model('User', userSchema);

// КОНТРОЛЛЕРЫ
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Math.floor(Date.now() / 1000) },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});