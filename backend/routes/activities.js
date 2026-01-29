import express from 'express';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js'; 


const router = express.Router();

// Получение всех активностей для поездки
router.get('/', authenticateToken, async (req, res) => {
  const { tripId } = req.query;
  try {
    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE trip_id = ?',
      [tripId]
    );
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Добавление новой активности
router.post('/', async (req, res) => {
  const { tripId, name, date, location } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO activities (trip_id, name, date, location) VALUES (?, ?, ?, ?)',
      [tripId, name, date, location]
    );
    res.status(201).json({ message: 'Активность добавлена', activityId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
