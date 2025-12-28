<?php
declare(strict_types=1);

namespace Backend\Core;

class Router
{
  private array $routes = [];

  public function get(string $pattern, $handler): void { $this->map('GET', $pattern, $handler); }
  public function post(string $pattern, $handler): void { $this->map('POST', $pattern, $handler); }
  public function put(string $pattern, $handler): void { $this->map('PUT', $pattern, $handler); }
  public function delete(string $pattern, $handler): void { $this->map('DELETE', $pattern, $handler); }

  private function map(string $method, string $pattern, $handler): void
  {
    $this->routes[] = [
      'method' => $method,
      'pattern' => '#^' . $pattern . '$#',
      'handler' => $handler,
    ];
  }

  public function dispatch(string $method, string $uri): void
  {
    $path = parse_url($uri, PHP_URL_PATH);
    // Normalize and urldecode the path
    $path = rawurldecode($path);
    // If the app is served from a subdirectory, strip the script directory
    $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
    if ($scriptDir !== '' && strpos($path, $scriptDir) === 0) {
      $path = substr($path, strlen($scriptDir));
      if ($path === '') $path = '/';
    }
    // Strip the script filename if present (e.g. /index.php)
    $scriptName = basename($_SERVER['SCRIPT_NAME']);
    if ($scriptName && strpos($path, '/' . $scriptName) === 0) {
      $path = substr($path, strlen('/' . $scriptName));
      if ($path === '') $path = '/';
    }
    foreach ($this->routes as $route) {
      if ($method !== $route['method']) continue;
      if (preg_match($route['pattern'], $path, $matches)) {
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        $handler = $route['handler'];
        if (is_array($handler)) {
          [$class, $action] = $handler;
          $instance = new $class();
          // Call method with params only if it expects arguments
          try {
            $ref = new \ReflectionMethod($class, $action);
            if ($ref->getNumberOfParameters() === 0) {
              $instance->$action();
            } else {
              $instance->$action($params);
            }
          } catch (\ReflectionException $e) {
            // Fallback: attempt to call with params
            $instance->$action($params);
          }
          return;
        } elseif (is_callable($handler)) {
          // Callable (closure) - call with params only if it accepts arguments
          try {
            $ref = new \ReflectionFunction($handler);
            if ($ref->getNumberOfParameters() === 0) {
              $handler();
            } else {
              $handler($params);
            }
          } catch (\ReflectionException $e) {
            // Fallback
            $handler($params);
          }
          return;
        }
      }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
  }
}


