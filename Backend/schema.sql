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
-- Password for admin: admin123, Password for student: student123
-- These are bcrypt hashes generated with PHP's password_hash()
INSERT IGNORE INTO users (id, username, password_hash, full_name, email, role)
VALUES
  (1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@college.edu', 'admin'),
  (2, 'student', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Student', 'student@college.edu', 'student');

-- Note: The above hash is for 'password'. For demo purposes both users use 'password' as their password.

INSERT INTO halls (name, capacity, location, facilities, is_available) VALUES
  ('Main Auditorium', 500, 'Annexe Building, Ground Floor', JSON_ARRAY('projector','sound-system','air-conditioning','stage'), 1),
  ('Conference Hall', 150, 'Annexe Building, 2nd Floor', JSON_ARRAY('projector','air-conditioning','wifi'), 1),
  ('Seminar Room 1', 50, 'Annexe Building, 1st Floor', JSON_ARRAY('projector','wifi'), 1),
  ('Sports Ground', 300, 'Sports Ground', JSON_ARRAY('sound-system','lighting'), 1),
  ('Library', 80, 'Library Building', JSON_ARRAY('wifi','air-conditioning'), 1);

-- Sample events
INSERT IGNORE INTO events (title, description, category, date, time, venue, organizer, status, created_by) VALUES
  ('Annual Tech Symposium 2025', 'A comprehensive technical symposium featuring presentations on emerging technologies, AI innovations, and software development best practices.', 'academic', '2025-01-15', '09:00:00', 'Main Auditorium', 'Computer Science Department', 'upcoming', 1),
  ('Cultural Fest - Rhythms of Unity', 'Join us for an evening of music, dance, and cultural performances celebrating diversity and student talent.', 'cultural', '2025-01-20', '17:00:00', 'Main Auditorium', 'Cultural Committee', 'upcoming', 1),
  ('Inter-College Basketball Tournament', 'Annual basketball championship featuring teams from various colleges competing for the trophy.', 'sports', '2025-01-25', '08:00:00', 'Sports Ground', 'Sports Department', 'upcoming', 1),
  ('Web Development Workshop', 'Hands-on workshop covering modern web development frameworks, React, Node.js, and deployment strategies.', 'workshop', '2025-02-05', '10:00:00', 'Conference Hall', 'IT Club', 'upcoming', 1),
  ('Career Guidance Seminar', 'Industry experts share insights on career opportunities, interview preparation, and professional development.', 'seminar', '2025-02-10', '14:00:00', 'Conference Hall', 'Placement Cell', 'upcoming', 1),
  ('Machine Learning Bootcamp', 'Intensive 3-day bootcamp on machine learning fundamentals, algorithms, and practical applications.', 'workshop', '2025-02-15', '09:30:00', 'Seminar Room 1', 'AI Research Group', 'upcoming', 1),
  ('Spring Fest Opening Ceremony', 'Grand opening of the annual spring festival with celebrity performances and entertainment.', 'cultural', '2025-03-01', '18:00:00', 'Main Auditorium', 'Student Council', 'upcoming', 1),
  ('Entrepreneurship Summit', 'Learn from successful entrepreneurs about starting and scaling businesses, funding, and innovation.', 'seminar', '2025-03-10', '11:00:00', 'Conference Hall', 'E-Cell', 'upcoming', 1);


