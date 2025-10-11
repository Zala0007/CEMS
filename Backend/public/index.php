<?php
// Front controller



declare(strict_types=1);

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../src/bootstrap.php';

// Development: show all PHP errors to help debugging. Remove in production.
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

use Backend\Core\Router;
use Backend\Core\Response;
use Backend\Controllers\AuthController;
use Backend\Controllers\EventsController;
use Backend\Controllers\HallsController;
use Backend\Controllers\BookingsController;
use Backend\Controllers\UsersController;

$router = new Router();

// Health check
$router->get('/api/health', function () {
  Response::json(['status' => 'ok']);
});

// Auth
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);

// Events
$router->get('/api/events', [EventsController::class, 'index']);
$router->post('/api/events', [EventsController::class, 'store']);
$router->get('/api/events/(?P<id>\d+)', [EventsController::class, 'show']);
$router->put('/api/events/(?P<id>\d+)', [EventsController::class, 'update']);
$router->delete('/api/events/(?P<id>\d+)', [EventsController::class, 'destroy']);

// Halls
$router->get('/api/halls', [HallsController::class, 'index']);
$router->post('/api/halls', [HallsController::class, 'store']);
$router->get('/api/halls/(?P<id>\d+)', [HallsController::class, 'show']);
$router->put('/api/halls/(?P<id>\d+)', [HallsController::class, 'update']);
$router->delete('/api/halls/(?P<id>\d+)', [HallsController::class, 'destroy']);

// Bookings
$router->get('/api/bookings', [BookingsController::class, 'index']);
$router->post('/api/bookings', [BookingsController::class, 'store']);
$router->get('/api/bookings/(?P<id>\d+)', [BookingsController::class, 'show']);
$router->put('/api/bookings/(?P<id>\d+)', [BookingsController::class, 'update']);
$router->delete('/api/bookings/(?P<id>\d+)', [BookingsController::class, 'destroy']);

// Users (admin)
$router->get('/api/users', [UsersController::class, 'index']);
$router->post('/api/users', [UsersController::class, 'store']);
$router->get('/api/users/(?P<id>\d+)', [UsersController::class, 'show']);
$router->put('/api/users/(?P<id>\d+)', [UsersController::class, 'update']);
$router->delete('/api/users/(?P<id>\d+)', [UsersController::class, 'destroy']);

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);


