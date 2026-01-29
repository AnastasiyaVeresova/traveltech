-- 1. Создание базы данных, если её нет
CREATE DATABASE IF NOT EXISTS traveltech
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;


--     CREATE USER 'traveltech_user'@'localhost' IDENTIFIED BY 'пароль';
-- GRANT ALL PRIVILEGES ON traveltech.* TO 'traveltech_user'@'localhost';
-- FLUSH PRIVILEGES;


-- 2. Подключение к базе данных
USE traveltech;

-- 3. Создание таблицы users (если её нет)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Создание таблицы trips (если её нет)
CREATE TABLE IF NOT EXISTS trips (
    trip_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning'
);

-- 5. Создание таблицы trip_members (если её нет)
CREATE TABLE IF NOT EXISTS trip_members (
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('organizer', 'member') NOT NULL,
    PRIMARY KEY (trip_id, user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Создание таблицы flights (если её нет)
CREATE TABLE IF NOT EXISTS flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    flight_number VARCHAR(50) NOT NULL,
    departure DATETIME NOT NULL,
    arrival DATETIME NOT NULL,
    departure_airport VARCHAR(255) NOT NULL,
    arrival_airport VARCHAR(255) NOT NULL,
    status ENUM('proposed', 'confirmed', 'cancelled') DEFAULT 'proposed',
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- 7. Создание таблицы hotels (если её нет)
CREATE TABLE IF NOT EXISTS hotels (
    hotel_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME NOT NULL,
    address VARCHAR(255) NOT NULL,
    status ENUM('proposed', 'confirmed', 'cancelled') DEFAULT 'proposed',
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- 8. Создание таблицы activities (если её нет)
CREATE TABLE IF NOT EXISTS activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('proposed', 'confirmed', 'cancelled') DEFAULT 'proposed',
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- 9. Создание таблицы bookings (если её нет)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    object_type ENUM('flight', 'hotel', 'activity') NOT NULL,
    object_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    payment_data JSON
);

-- 10. Создание таблицы changes (если её нет)
CREATE TABLE IF NOT EXISTS changes (
    change_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    object_id INT NOT NULL,
    object_type ENUM('flight', 'hotel', 'activity') NOT NULL,
    change_type ENUM('add', 'edit', 'delete') NOT NULL,
    data JSON NOT NULL,
    user_id INT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Создание таблицы conflicts (если её нет)
CREATE TABLE IF NOT EXISTS conflicts (
    conflict_id INT AUTO_INCREMENT PRIMARY KEY,
    change_id INT NOT NULL,
    status ENUM('pending', 'resolved') DEFAULT 'pending',
    resolution JSON,
    FOREIGN KEY (change_id) REFERENCES changes(change_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS trip_members (
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('organizer', 'member') NOT NULL,
    PRIMARY KEY (trip_id, user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

ALTER TABLE trip_members ADD COLUMN status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending';


-- Таблица для голосования за элементы поездки
CREATE TABLE IF NOT EXISTS votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    object_type ENUM('flight', 'hotel', 'activity') NOT NULL,
    object_id INT NOT NULL,
    user_id INT NOT NULL,
    vote BOOLEAN NOT NULL, -- true: за, false: против
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (object_type, object_id, user_id)
);

-- Добавим 3 пользователей: организатора и двух участников поездки

-- Пользователь 1: Организатор
INSERT INTO users (name, email, timezone)
VALUES ('Владимир Петров', 'vladimir@example.com', 'Europe/Moscow');

-- Пользователь 2: Участник
INSERT INTO users (name, email, timezone)
VALUES ('Анна Сидорова', 'anna@example.com', 'Europe/Moscow');

-- Пользователь 3: Участник
INSERT INTO users (name, email, timezone)
VALUES ('Игорь Иванов', 'igor@example.com', 'Asia/Yekaterinburg');


-- Создадим одну поездку — "Лето в Сочи 2026"

INSERT INTO trips (name, start_date, end_date, status)
VALUES ('Лето в Сочи 2026', '2026-07-01 00:00:00', '2026-07-14 00:00:00', 'planning');

-- Добавим всех пользователей в поездку с указанием ролей

-- Владимир — организатор
INSERT INTO trip_members (trip_id, user_id, role)
VALUES (1, 1, 'organizer');

-- Анна — участник
INSERT INTO trip_members (trip_id, user_id, role)
VALUES (1, 2, 'member');

-- Игорь — участник
INSERT INTO trip_members (trip_id, user_id, role)
VALUES (1, 3, 'member');


-- Добавим два рейса: туда и обратно

-- Рейс туда: Москва → Сочи
INSERT INTO flights (trip_id, flight_number, departure, arrival, departure_airport, arrival_airport, status)
VALUES (1, 'SU1234', '2026-07-01 10:00:00', '2026-07-01 12:30:00', 'VKO', 'AER', 'proposed');

-- Рейс обратно: Сочи → Москва
INSERT INTO flights (trip_id, flight_number, departure, arrival, departure_airport, arrival_airport, status)
VALUES (1, 'SU4321', '2026-07-14 18:00:00', '2026-07-14 20:30:00', 'AER', 'VKO', 'proposed');

-- Добавим два отеля на выбор

-- Отель 1: Radisson
INSERT INTO hotels (trip_id, name, check_in, check_out, address, status)
VALUES (1, 'Radisson Collection Paradise Resort & Spa', '2026-07-01 14:00:00', '2026-07-14 12:00:00', 'г. Сочи, ул. Курортный проспект, 92', 'proposed');

-- Отель 2: Bogatyr
INSERT INTO hotels (trip_id, name, check_in, check_out, address, status)
VALUES (1, 'Bogatyr Hotel', '2026-07-01 15:00:00', '2026-07-14 11:00:00', 'г. Сочи, ул. Виноградная, 18', 'proposed');

-- Добавим три активности на выбор

-- Активность 1: Экскурсия в аквапарк
INSERT INTO activities (trip_id, name, date, location, status)
VALUES (1, 'Экскурсия в аквапарк "Аквалоо"', '2026-07-05 10:00:00', 'г. Сочи, Адлерский р-н, Олимпийский пр-т, 21', 'proposed');

-- Активность 2: Поход в горы
INSERT INTO activities (trip_id, name, date, location, status)
VALUES (1, 'Поход на Красную Поляну', '2026-07-08 09:00:00', 'Красная Поляна, Сочи', 'proposed');

-- Активность 3: Ужин в ресторане
INSERT INTO activities (trip_id, name, date, location, status)
VALUES (1, 'Ужин в ресторане "Белый лебедь"', '2026-07-10 19:00:00', 'г. Сочи, ул. Театральная, 2', 'proposed');

-- Симулируем, что Владимир добавил рейс, Анна — отель, а Игорь — активность

-- Владимир добавил рейс туда
INSERT INTO changes (trip_id, object_id, object_type, change_type, data, user_id)
VALUES (1, 1, 'flight', 'add', '{"flight_number": "SU1234", "departure": "2026-07-01 10:00:00", "arrival": "2026-07-01 12:30:00"}', 1);

-- Анна добавила отель Radisson
INSERT INTO changes (trip_id, object_id, object_type, change_type, data, user_id)
VALUES (1, 1, 'hotel', 'add', '{"name": "Radisson Collection Paradise Resort & Spa", "check_in": "2026-07-01 14:00:00"}', 2);

-- Игорь добавил активность "Экскурсия в аквапарк"
INSERT INTO changes (trip_id, object_id, object_type, change_type, data, user_id)
VALUES (1, 1, 'activity', 'add', '{"name": "Экскурсия в аквапарк \\"Аквалоо\\"", "date": "2026-07-05 10:00:00"}', 3);


-- Посмотреть всех пользователей
SELECT * FROM users;

-- Посмотреть все поездки
SELECT * FROM trips;

-- Посмотреть всех участников поездки
SELECT * FROM trip_members;

-- Посмотреть все рейсы
SELECT * FROM flights;

-- Посмотреть все отели
SELECT * FROM hotels;

-- Посмотреть все активности
SELECT * FROM activities;

-- Посмотреть историю изменений
SELECT * FROM changes;

ALTER TABLE users ADD COLUMN password VARCHAR(255);

-- SET SQL_SAFE_UPDATES = 0;
-- DELETE FROM users WHERE name = "F";
-- SELECT * FROM users WHERE name = "F";

ALTER TABLE users
ADD COLUMN surname VARCHAR(255) AFTER name,
ADD COLUMN patronymic VARCHAR(255) AFTER surname,
ADD COLUMN birth_date DATE AFTER patronymic;
