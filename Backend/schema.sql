-- College Event Management SQL Schema (MySQL compatible)

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  role ENUM('admin','student') NOT NULL DEFAULT 'student',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Halls
CREATE TABLE IF NOT EXISTS halls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(200) NOT NULL,
  facilities JSON NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('academic','cultural','sports','workshop','seminar') NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue VARCHAR(120) NOT NULL,
  organizer VARCHAR(120) NOT NULL,
  status ENUM('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hall_id INT NOT NULL,
  user_id INT NOT NULL,
  purpose VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration ENUM('1','2','3','4','full-day') NOT NULL,
  attendees INT NOT NULL,
  requirements TEXT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hall_id) REFERENCES halls(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed data
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES
  ('admin', '$2y$10$8cWc5Y0zv0H5mC0mWq0nQe5y9m7J1v1Z4c0sR0uIqvYb9uTz5zIyu', 'Administrator', 'admin@college.edu', 'admin'),
  ('student', '$2y$10$7H8iYb3mJZ3nP6q9Xy1o0uU2Wf6H8J9K0lMn1Op2QrSt3Uv4WxYZa', 'John Student', 'student@college.edu', 'student');

-- Note: password hashes correspond to placeholder values. Update with real hashes.

INSERT INTO halls (name, capacity, location, facilities, is_available) VALUES
  ('Main Auditorium', 500, 'Annexe Building, Ground Floor', JSON_ARRAY('projector','sound-system','air-conditioning','stage'), 1),
  ('Conference Hall', 150, 'Annexe Building, 2nd Floor', JSON_ARRAY('projector','air-conditioning','wifi'), 1),
  ('Seminar Room 1', 50, 'Annexe Building, 1st Floor', JSON_ARRAY('projector','wifi'), 1),
  ('Sports Ground', 300, 'Sports Ground', JSON_ARRAY('sound-system','lighting'), 1),
  ('Library', 80, 'Library Building', JSON_ARRAY('wifi','air-conditioning'), 1);


