<?php
declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Core\DB;
use Backend\Core\Response;

class AuthController
{
  public function login(): void
  {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if ($username === '' || $password === '') {
      Response::error('Username and password are required', 422);
      return;
    }

    $stmt = DB::conn()->prepare('SELECT id, username, password_hash, full_name, email, role FROM users WHERE username = :u');
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
      Response::error('Invalid credentials', 401);
      return;
    }

    unset($user['password_hash']);
    Response::json(['user' => $user]);
  }

  public function me(): void
  {
    // For simplicity without JWT/session, return unauthorized.
    Response::error('Not implemented', 501);
  }

  public function logout(): void
  {
    Response::json(['success' => true]);
  }
}


