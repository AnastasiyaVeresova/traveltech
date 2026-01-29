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

// Добавление участника в поездку
router.post('/:tripId/members', authenticateToken, async (req, res) => {
  const { tripId } = req.params;
  const { userId } = req.body;
  try {
    await pool.query(
      'INSERT INTO trip_members (trip_id, user_id, role) VALUES (?, ?, ?)',
      [tripId, userId, 'member']
    );
    res.status(201).json({ message: 'Участник добавлен в поездку' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение участников поездки
router.get('/:tripId/members', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const [members] = await pool.query(`
      SELECT u.user_id, u.name, u.surname, u.email, tm.role, tm.status
      FROM trip_members tm
      JOIN users u ON tm.user_id = u.user_id
      WHERE tm.trip_id = ?
    `, [tripId]);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление статуса приглашения
router.put('/:tripId/members/:userId', authenticateToken, async (req, res) => {
  const { tripId, userId } = req.params;
  const { status } = req.body;
  try {
    await pool.query(
      'UPDATE trip_members SET status = ? WHERE trip_id = ? AND user_id = ?',
      [status, tripId, userId]
    );
    res.json({ message: 'Статус приглашения обновлён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение голосов за элемент поездки
router.get('/:tripId/votes/:objectType/:objectId', authenticateToken, async (req, res) => {
  const { tripId, objectType, objectId } = req.params;
  try {
    const [votes] = await pool.query(
      'SELECT u.user_id, u.name, u.surname, v.vote FROM votes v JOIN users u ON v.user_id = u.user_id WHERE v.object_type = ? AND v.object_id = ?',
      [objectType, objectId]
    );
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Голосование за элемент поездки
router.post('/:tripId/vote', authenticateToken, async (req, res) => {
  const { tripId } = req.params;
  const { objectType, objectId, vote } = req.body;
  try {
    await pool.query(
      'INSERT INTO votes (object_type, object_id, user_id, vote) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE vote = ?',
      [objectType, objectId, req.user.userId, vote, vote]
    );
    res.json({ message: 'Голос учтён' });
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
