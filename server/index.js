import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Review = require('./models/Review');

const app = express();

app.use(cors());
app.use(express.json());

// Логгер входящих запросов для отладки 405 ошибки
app.use((req, res, next) => {
  console.log(`[INCOMING REQUEST] Method: ${req.method} | URL: ${req.url}`);
  next();
});

const SECRET_KEY = process.env.SECRET_KEY || 'super_secret_jwt_key_123';
const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/cinetrack';

// Подключение к MongoDB
mongoose.connect(MONGO_URL)
  .then(() => console.log('Успешное подключение к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Middleware для проверки JWT токена
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена авторизации' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

// Генерация JWT токена
const generateToken = (user) => {
  return jwt.sign({ email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '7d' });
};

// --- СОЗДАЕМ ЕДИНЫЙ API РОУТЕР ---
const apiRouter = express.Router();

// Роуты авторизации
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже занят' });
    }

    const newUser = new User({ email, password, name });
    await newUser.save();

    const token = generateToken(newUser);
    res.json({
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        color: newUser.color
      }
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: err.message || 'Ошибка сервера при регистрации' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color
      }
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: err.message || 'Ошибка сервера при входе' });
  }
});

apiRouter.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Роуты профиля
apiRouter.put('/users/profile', verifyToken, async (req, res) => {
  try {
    const { name, avatar, color } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { name, avatar, color },
      { new: true }
    );
    res.json({
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      color: updatedUser.color
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Роуты избранного
apiRouter.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    res.json(user ? user.favorites : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/favorites', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (user.favorites.includes(movieId)) {
      user.favorites = user.favorites.filter(id => id !== movieId);
    } else {
      user.favorites.push(movieId);
    }
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Роуты отзывов
apiRouter.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/reviews', verifyToken, async (req, res) => {
  try {
    const { movie_id, movie_title, movie_poster, text, rating, date } = req.body;

    await Review.findOneAndUpdate(
      { movie_id, user_email: req.user.email },
      { movie_title, movie_poster, author: req.user.name, text, rating, date, user_email: req.user.email },
      { upsert: true, new: true }
    );

    const allReviews = await Review.find();
    res.json(allReviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/reviews/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
    
    if (review.user_email !== req.user.email) {
      return res.status(403).json({ error: 'Нет прав на удаление этого отзыва' });
    }

    await Review.findByIdAndDelete(req.params.id);
    const allReviews = await Review.find();
    res.json(allReviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Подключаем весь роутер на префикс /api
app.use('/api', apiRouter);

// --- РАЗДАЧА СТАТИКИ ФРОНТЕНДА ---
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});