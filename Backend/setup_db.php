<?php
/**
 * Database Setup Script
 * Run this once to set up the database and seed data
 * 
 * Usage: php setup_db.php
 * Or access via browser: http://localhost:8000/setup_db.php
 */

declare(strict_types=1);

require_once __DIR__ . '/src/bootstrap.php';

use Backend\Config;

try {
    // Connect to MySQL without selecting a database first
    $dsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', Config::DB_HOST, Config::DB_PORT);
    $pdo = new PDO($dsn, Config::DB_USER, Config::DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "Connected to MySQL server.\n";

    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . Config::DB_NAME);
    $pdo->exec("USE " . Config::DB_NAME);
    echo "Database '" . Config::DB_NAME . "' ready.\n";

    // Create tables
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(120) NOT NULL UNIQUE,
            role ENUM('admin','student') NOT NULL DEFAULT 'student',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "Table 'users' ready.\n";

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS halls (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            capacity INT NOT NULL,
            location VARCHAR(200) NOT NULL,
            facilities JSON NULL,
            is_available TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "Table 'halls' ready.\n";

    $pdo->exec("
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
        )
    ");
    echo "Table 'events' ready.\n";

    $pdo->exec("
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
        )
    ");
    echo "Table 'bookings' ready.\n";

    // Generate password hashes for demo users
    $adminHash = password_hash('admin123', PASSWORD_BCRYPT);
    $studentHash = password_hash('student123', PASSWORD_BCRYPT);

    // Insert seed users (ignore if already exist)
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO users (username, password_hash, full_name, email, role) VALUES
        (:u1, :h1, 'Administrator', 'admin@college.edu', 'admin'),
        (:u2, :h2, 'John Student', 'student@college.edu', 'student')
    ");
    $stmt->execute([':u1' => 'admin', ':h1' => $adminHash, ':u2' => 'student', ':h2' => $studentHash]);
    echo "Seed users created (admin/admin123, student/student123).\n";

    // Insert seed halls (ignore if already exist)
    $pdo->exec("
        INSERT IGNORE INTO halls (id, name, capacity, location, facilities, is_available) VALUES
        (1, 'Main Auditorium', 500, 'Annexe Building, Ground Floor', '[\"projector\",\"sound-system\",\"air-conditioning\",\"stage\"]', 1),
        (2, 'Conference Hall', 150, 'Annexe Building, 2nd Floor', '[\"projector\",\"air-conditioning\",\"wifi\"]', 1),
        (3, 'Seminar Room 1', 50, 'Annexe Building, 1st Floor', '[\"projector\",\"wifi\"]', 1),
        (4, 'Sports Ground', 300, 'Sports Ground', '[\"sound-system\",\"lighting\"]', 1),
        (5, 'Library', 80, 'Library Building', '[\"wifi\",\"air-conditioning\"]', 1)
    ");
    echo "Seed halls created.\n";

    // Insert sample events
    $pdo->exec("
        INSERT IGNORE INTO events (id, title, description, category, date, time, venue, organizer, status, created_by) VALUES
        (1, 'Annual Tech Fest', 'A comprehensive tech conference featuring latest innovations.', 'academic', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00:00', 'Main Auditorium', 'Computer Department', 'upcoming', 1),
        (2, 'Cultural Festival 2025', 'Celebrate diversity with music, dance, and art performances.', 'cultural', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '16:00:00', 'Sports Ground', 'Student Cultural Committee', 'upcoming', 1),
        (3, 'Basketball Championship', 'Inter-college basketball tournament.', 'sports', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', 'Sports Ground', 'Sports Department', 'upcoming', 1)
    ");
    echo "Seed events created.\n";

    echo "\n✓ Database setup complete!\n";
    echo "You can now login with:\n";
    echo "  Admin: admin / admin123\n";
    echo "  Student: student / student123\n";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
}
