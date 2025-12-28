<?php
declare(strict_types=1);

namespace Backend\Core;

class Response
{
  public static function json($data, int $status = 200): void
  {
    http_response_code($status);
    echo json_encode($data);
  }

  public static function error(string $message, int $status = 400): void
  {
    self::json(['error' => $message], $status);
  }
}


