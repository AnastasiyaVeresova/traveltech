import express from 'express';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js'; 

const router = express.Router();

// Получение всех отелей для поездки
router.get('/', authenticateToken, async (req, res) => {
  const { tripId } = req.query;
  try {
    const [hotels] = await pool.query(
      'SELECT * FROM hotels WHERE trip_id = ?',
      [tripId]
    );
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавление нового отеля
router.post('/', authenticateToken, async (req, res) => {
  const { tripId, name, checkIn, checkOut, address } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO hotels (trip_id, name, check_in, check_out, address) VALUES (?, ?, ?, ?, ?)',
      [tripId, name, checkIn, checkOut, address]
    );
    res.status(201).json({ message: 'Отель добавлен', hotelId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
