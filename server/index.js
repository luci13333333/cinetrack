require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'fallback_secret_key';

// Инициализация базы данных SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка открытия базы данных SQLite:', err.message);
  } else {
    console.log('✅ База данных SQLite успешно инициализирована');
  }
});

// Создание таблиц
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    avatar TEXT,
    color TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    movie_title TEXT,
    movie_poster TEXT,
    user_email TEXT,
    author TEXT,
    text TEXT,
    rating INTEGER,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    movie_id INTEGER
  )`);
});

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

// Регистрация с проверкой занятости email
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        `INSERT INTO users (name, email, password, avatar, color) VALUES (?, ?, ?, ?, ?)`,
        [name || 'Пользователь', email, hashedPassword, '', 'bg-blue-600'],
        function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: 'Ошибка при создании пользователя' });
          }

          const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '7d' });
          
          res.json({
            token,
            user: { id: this.lastID, name: name || 'Пользователь', email, avatar: '', color: 'bg-blue-600' }
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Авторизация (Логин)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color }
    });
  });
});

// Проверка текущего пользователя по токену
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, email, avatar, color FROM users WHERE email = ?`, [req.user.email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ user });
  });
});

// Получение всех отзывов
app.get('/api/reviews', (req, res) => {
  db.all(`SELECT * FROM reviews`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Добавление / обновление отзыва
app.post('/api/reviews', authenticateToken, (req, res) => {
  const { movie_id, movie_title, movie_poster, text, rating, date } = req.body;
  
  db.get(`SELECT name FROM users WHERE email = ?`, [req.user.email], (err, userRow) => {
    const authorName = userRow ? userRow.name : 'Пользователь';

    db.get(`SELECT id FROM reviews WHERE movie_id = ? AND user_email = ?`, [movie_id, req.user.email], (err, existingReview) => {
      if (existingReview) {
        db.run(
          `UPDATE reviews SET text = ?, rating = ?, date = ?, movie_title = ?, movie_poster = ? WHERE id = ?`,
          [text, rating, date, movie_title, movie_poster, existingReview.id],
          function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            sendAllReviews(res);
          }
        );
      } else {
        db.run(
          `INSERT INTO reviews (movie_id, movie_title, movie_poster, user_email, author, text, rating, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [movie_id, movie_title, movie_poster, req.user.email, authorName, text, rating, date],
          function(insertErr) {
            if (insertErr) return res.status(500).json({ error: insertErr.message });
            sendAllReviews(res);
          }
        );
      }
    });
  });
});

// Удаление отзыва
app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
  const reviewId = req.params.id;
  db.run(`DELETE FROM reviews WHERE id = ? AND user_email = ?`, [reviewId, req.user.email], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    sendAllReviews(res);
  });
});

function sendAllReviews(res) {
  db.all(`SELECT * FROM reviews`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

// Получение избранного
app.get('/api/favorites', authenticateToken, (req, res) => {
  db.all(`SELECT movie_id FROM favorites WHERE user_email = ?`, [req.user.email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.movie_id));
  });
});

// Добавление / удаление из избранного
app.post('/api/favorites', authenticateToken, (req, res) => {
  const { movieId } = req.body;
  db.get(`SELECT id FROM favorites WHERE user_email = ? AND movie_id = ?`, [req.user.email, movieId], (err, row) => {
    if (row) {
      db.run(`DELETE FROM favorites WHERE user_email = ? AND movie_id = ?`, [req.user.email, movieId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        sendUserFavorites(req.user.email, res);
      });
    } else {
      db.run(`INSERT INTO favorites (user_email, movie_id) VALUES (?, ?)`, [req.user.email, movieId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        sendUserFavorites(req.user.email, res);
      });
    }
  });
});

function sendUserFavorites(email, res) {
  db.all(`SELECT movie_id FROM favorites WHERE user_email = ?`, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.movie_id));
  });
}

// Обновление профиля
app.put('/api/users/profile', authenticateToken, (req, res) => {
  const { name, avatar, color } = req.body;
  db.run(
    `UPDATE users SET name = ?, avatar = ?, color = ? WHERE email = ?`,
    [name, avatar, color, req.user.email],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT id, name, email, avatar, color FROM users WHERE email = ?`, [req.user.email], (err, user) => {
        res.json(user);
      });
    }
  );
});

// Раздача фронтенда для продакшена
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Бэкенд с JWT и SQLite запущен на http://localhost:${PORT}`);
});