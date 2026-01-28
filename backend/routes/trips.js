import express from 'express';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Получение всех поездок пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [trips] = await pool.query(`
      SELECT t.* FROM trips t
      JOIN trip_members tm ON t.trip_id = tm.trip_id
      WHERE tm.user_id = ?
    `, [req.user.userId]);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание новой поездки
router.post('/', authenticateToken, async (req, res) => {
  const { name, startDate, endDate } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO trips (name, start_date, end_date) VALUES (?, ?, ?)',
      [name, startDate, endDate]
    );
    const tripId = result.insertId;
    await pool.query(
      'INSERT INTO trip_members (trip_id, user_id, role) VALUES (?, ?, ?)',
      [tripId, req.user.userId, 'organizer']
    );
    res.status(201).json({ message: 'Поездка создана', tripId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отмена поездки
router.put('/:tripId', authenticateToken, async (req, res) => {
  const { tripId } = req.params;
  const { status } = req.body;
  try {
    await pool.query(
      'UPDATE trips SET status = ? WHERE trip_id = ?',
      [status, tripId]
    );
    res.json({ message: 'Статус поездки обновлён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
