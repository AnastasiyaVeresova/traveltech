import express from 'express';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Получение всех рейсов для поездки
router.get('/', authenticateToken, async (req, res) => {
  const { tripId } = req.query;
  try {
    const [flights] = await pool.query(
      'SELECT * FROM flights WHERE trip_id = ?',
      [tripId]
    );
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Добавление нового рейса
router.post('/', authenticateToken, async (req, res) => {
  const { tripId, flightNumber, departure, arrival, departureAirport, arrivalAirport } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO flights (trip_id, flight_number, departure, arrival, departure_airport, arrival_airport) VALUES (?, ?, ?, ?, ?, ?)',
      [tripId, flightNumber, departure, arrival, departureAirport, arrivalAirport]
    );
    res.status(201).json({ message: 'Рейс добавлен', flightId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
