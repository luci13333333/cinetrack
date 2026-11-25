import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Review from './models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Отладочный логгер входящих запросов
app.use((req, res, next) => {
  console.log(`[INCOMING REQUEST] Method: ${req.method} | URL: ${req.url}`);
  next();
});

const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_key_change_in_prod';
const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/cinetrack';

const STATUS_KEYS = ['watchlist', 'watching', 'completed', 'on_hold', 'dropped'];

// Хэширование пароля с солью через встроенный crypto
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedValue) {
  if (!storedValue || !storedValue.includes(':')) {
    // Совместимость со старыми записями в БД, сохранёнными без хэша
    return storedValue === password;
  }
  const [salt, originalHash] = storedValue.split(':');
  const derivedHash = crypto.scryptSync(password, salt, 64);
  const originalBuf = Buffer.from(originalHash, 'hex');
  if (derivedHash.length !== originalBuf.length) return false;
  return crypto.timingSafeEqual(derivedHash, originalBuf);
}

function formatUser(user) {
  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    color: user.color || 'bg-blue-600',
  };
}

function formatStatuses(user) {
  return {
    watchlist: user?.watchlist || [],
    watching: user?.watching || [],
    completed: user?.completed || [],
    on_hold: user?.on_hold || [],
    dropped: user?.dropped || [],
  };
}

// Подключение к MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log('Успешное подключение к MongoDB'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

// Middleware для проверки JWT токена
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена авторизации' });

  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = payload;
    next();
  });
};

const generateToken = (user) => {
  return jwt.sign({ email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '7d' });
};

const apiRouter = express.Router();

apiRouter.post('/auth/register', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim();

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Заполните имя, email и пароль' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже занят' });
    }

    const newUser = new User({
      email,
      password: hashPassword(password),
      name,
    });
    await newUser.save();

    const token = generateToken(newUser);
    res.json({ token, user: formatUser(newUser) });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: err.message || 'Ошибка сервера при регистрации' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: err.message || 'Ошибка сервера при входе' });
  }
});

apiRouter.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/users/profile', verifyToken, async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body?.name === 'string' && req.body.name.trim()) {
      updates.name = req.body.name.trim();
    }
    if (typeof req.body?.avatar === 'string') {
      updates.avatar = req.body.avatar.trim();
    }
    if (typeof req.body?.color === 'string' && req.body.color.trim()) {
      updates.color = req.body.color.trim();
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: updates },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'Пользователь не найден' });

    res.json(formatUser(updatedUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    res.json(user ? user.favorites || [] : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/favorites', verifyToken, async (req, res) => {
  try {
    const numericId = Number(req.body?.movieId);
    if (!Number.isFinite(numericId)) {
      return res.status(400).json({ error: 'Некорректный movieId' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const current = Array.isArray(user.favorites) ? user.favorites : [];
    if (current.includes(numericId)) {
      user.favorites = current.filter((id) => Number(id) !== numericId);
    } else {
      user.favorites = [...current, numericId];
    }

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/watchlist', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    res.json(user ? user.watchlist || [] : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/watchlist', verifyToken, async (req, res) => {
  try {
    const numericId = Number(req.body?.movieId);
    if (!Number.isFinite(numericId)) {
      return res.status(400).json({ error: 'Некорректный movieId' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const current = Array.isArray(user.watchlist) ? user.watchlist : [];
    if (current.includes(numericId)) {
      user.watchlist = current.filter((id) => Number(id) !== numericId);
    } else {
      user.watchlist = [...current, numericId];
    }

    await user.save();
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/statuses', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    res.json(formatStatuses(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/statuses', verifyToken, async (req, res) => {
  try {
    const numericId = Number(req.body?.movieId);
    const status = req.body?.status;

    if (!Number.isFinite(numericId)) {
      return res.status(400).json({ error: 'Некорректный movieId' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Убираем фильм из всех списков статусов, чтобы он был в одной категории просмотра
    STATUS_KEYS.forEach((key) => {
      const arr = Array.isArray(user[key]) ? user[key] : [];
      user[key] = arr.filter((id) => Number(id) !== numericId);
    });

    // Если выбран конкретный статус (не 'none'), добавляем в него
    if (status && STATUS_KEYS.includes(status)) {
      user[status] = [...user[status], numericId];
    }

    await user.save();
    res.json(formatStatuses(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    const movie_id = Number(req.body?.movie_id);
    const text = String(req.body?.text || '').trim();
    const rating = Number(req.body?.rating);

    if (!Number.isFinite(movie_id) || !text || !Number.isFinite(rating)) {
      return res.status(400).json({ error: 'Некорректные данные отзыва' });
    }

    const currentUser = await User.findOne({ email: req.user.email });
    const authorName = currentUser?.name || req.user.name || 'Пользователь';

    await Review.findOneAndUpdate(
      { movie_id, user_email: req.user.email },
      {
        movie_id,
        movie_title: req.body?.movie_title || '',
        movie_poster: req.body?.movie_poster || '',
        author: authorName,
        text,
        rating: Math.min(10, Math.max(1, rating)),
        date: req.body?.date || new Date().toLocaleDateString('en-US'),
        user_email: req.user.email,
      },
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

// Подключаем API-роутер ДО статики и SPA fallback
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});