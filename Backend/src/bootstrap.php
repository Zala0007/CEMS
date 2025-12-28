<?php
declare(strict_types=1);

spl_autoload_register(function ($class) {
  $prefix = 'Backend\\';
  $base_dir = __DIR__ . '/';
  $len = strlen($prefix);
  if (strncmp($prefix, $class, $len) !== 0) {
    return;
  }
  $relative_class = substr($class, $len);
  $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
  if (file_exists($file)) {
    require $file;
  }
});

// Note: do not require this file again (it used to include itself recursively).
// The front controller (`public/index.php`) should require this file directly.

// Optionally set a default JSON content type for API responses.
header('Content-Type: application/json');


