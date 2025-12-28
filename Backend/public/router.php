<?php
// Built-in server router: serve existing files directly, otherwise forward to index.php
$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && is_file($file)) {
    return false; // serve the requested resource as-is
}
require __DIR__ . '/index.php';
