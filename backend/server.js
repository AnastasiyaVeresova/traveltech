import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import pool from './config/db.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import flightRoutes from './routes/flights.js';
import hotelRoutes from './routes/hotels.js';
import activityRoutes from './routes/activities.js';
import authenticateToken from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Разрешаем доступ к папке frontend
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../frontend')));

// Маршрут для главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/trips', authenticateToken, tripRoutes);
app.use('/api/flights', authenticateToken, flightRoutes);
app.use('/api/hotels', authenticateToken, hotelRoutes);
app.use('/api/activities', authenticateToken, activityRoutes);

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
