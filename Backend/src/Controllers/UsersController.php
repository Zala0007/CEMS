<?php
declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Core\DB;
use Backend\Core\Request;
use Backend\Core\Response;

class UsersController
{
  public function index(): void
  {
    $role = Request::query('role');
    $search = Request::query('search');
    $sql = 'SELECT id, username, full_name AS fullName, email, role, joined_at AS joinedAt FROM users WHERE 1=1';
    $params = [];
    if ($role) { $sql .= ' AND role = :role'; $params[':role'] = $role; }
    if ($search) {
      $sql .= ' AND (username LIKE :q OR full_name LIKE :q OR email LIKE :q)';
      $params[':q'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY id DESC';
    $stmt = DB::conn()->prepare($sql);
    $stmt->execute($params);
    Response::json($stmt->fetchAll());
  }

  public function show(array $params): void
  {
    $stmt = DB::conn()->prepare('SELECT id, username, full_name AS fullName, email, role, joined_at AS joinedAt FROM users WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
  $user = $stmt->fetch();
  if (!$user) { Response::error('Not Found', 404); return; }
    Response::json($user);
  }

  public function store(): void
  {
    $data = Request::json();
    $required = ['username','password','fullName','email','role'];
  foreach ($required as $r) { if (empty($data[$r])) { Response::error("$r is required", 422); return; } }
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = DB::conn()->prepare('INSERT INTO users (username, password_hash, full_name, email, role) VALUES (:username,:hash,:full,:email,:role)');
    $stmt->execute([
      ':username'=>$data['username'],
      ':hash'=>$hash,
      ':full'=>$data['fullName'],
      ':email'=>$data['email'],
      ':role'=>$data['role']
    ]);
    $id = (int)DB::conn()->lastInsertId();
    $this->show(['id'=>$id]);
  }

  public function update(array $params): void
  {
    $id = (int)$params['id'];
    $data = Request::json();
    $set = [];
    $bind = [':id'=>$id];
    if (isset($data['username'])) { $set[] = 'username = :username'; $bind[':username'] = $data['username']; }
    if (isset($data['fullName'])) { $set[] = 'full_name = :full_name'; $bind[':full_name'] = $data['fullName']; }
    if (isset($data['email'])) { $set[] = 'email = :email'; $bind[':email'] = $data['email']; }
    if (isset($data['role'])) { $set[] = 'role = :role'; $bind[':role'] = $data['role']; }
    if (isset($data['password'])) { $set[] = 'password_hash = :hash'; $bind[':hash'] = password_hash($data['password'], PASSWORD_BCRYPT); }
  if (empty($set)) { Response::error('No fields to update', 400); return; }
    $sql = 'UPDATE users SET ' . implode(', ', $set) . ' WHERE id = :id';
    DB::conn()->prepare($sql)->execute($bind);
    $this->show(['id'=>$id]);
  }

  public function destroy(array $params): void
  {
    $stmt = DB::conn()->prepare('DELETE FROM users WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
    Response::json(['success'=>true]);
  }
}


