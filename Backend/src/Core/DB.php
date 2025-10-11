<?php
declare(strict_types=1);

namespace Backend\Core;

use Backend\Config;
use PDO;
use PDOException;

class DB
{
  private static ?PDO $conn = null;

  public static function conn(): PDO
  {
    if (self::$conn === null) {
      $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', Config::DB_HOST, Config::DB_PORT, Config::DB_NAME);
      try {
        self::$conn = new PDO($dsn, Config::DB_USER, Config::DB_PASS, [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
      } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
      }
    }
    return self::$conn;
  }
}


