import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { surname, name, patronymic, birthDate, email, password, timezone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      'INSERT INTO users (surname, name, patronymic, birth_date, email, password, timezone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [surname, name, patronymic, birthDate, email, hashedPassword, timezone]
    );
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Авторизация пользователя
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    const token = jwt.sign({ userId: user.user_id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const user = users[0];
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Поиск пользователя по email
router.get('/users', authenticateToken, async (req, res) => {
  const { email } = req.query;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
