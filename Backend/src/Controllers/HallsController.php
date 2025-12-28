<?php
declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Core\DB;
use Backend\Core\Request;
use Backend\Core\Response;

class HallsController
{
  public function index(): void
  {
    $stmt = DB::conn()->query('SELECT * FROM halls ORDER BY name ASC');
    $rows = $stmt->fetchAll();
    // Decode JSON facilities
    foreach ($rows as &$r) {
      $r['facilities'] = $r['facilities'] ? json_decode($r['facilities'], true) : [];
    }
    Response::json($rows);
  }

  public function show(array $params): void
  {
    $stmt = DB::conn()->prepare('SELECT * FROM halls WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
    $hall = $stmt->fetch();
  if (!$hall) { Response::error('Not Found', 404); return; }
    $hall['facilities'] = $hall['facilities'] ? json_decode($hall['facilities'], true) : [];
    Response::json($hall);
  }

  public function store(): void
  {
    $data = Request::json();
    $required = ['name','capacity','location'];
  foreach ($required as $r) { if (empty($data[$r])) { Response::error("$r is required", 422); return; } }
    $facilitiesJson = isset($data['facilities']) ? json_encode($data['facilities']) : json_encode([]);
    $stmt = DB::conn()->prepare('INSERT INTO halls (name, capacity, location, facilities, is_available) VALUES (:name,:capacity,:location,:facilities,:is_available)');
    $stmt->execute([
      ':name'=>$data['name'],
      ':capacity'=>(int)$data['capacity'],
      ':location'=>$data['location'],
      ':facilities'=>$facilitiesJson,
      ':is_available'=> isset($data['isAvailable']) ? (int)!!$data['isAvailable'] : 1,
    ]);
    $id = (int)DB::conn()->lastInsertId();
    $this->show(['id' => $id]);
  }

  public function update(array $params): void
  {
    $id = (int)$params['id'];
    $data = Request::json();
    $fields = ['name','capacity','location','is_available'];
    $set = [];
    $bind = [':id'=>$id];
    foreach ($fields as $f) {
      if (isset($data[$f])) { $set[] = "$f = :$f"; $bind[":$f"] = $data[$f]; }
    }
    if (isset($data['facilities'])) { $set[] = 'facilities = :facilities'; $bind[':facilities'] = json_encode($data['facilities']); }
    if (isset($data['isAvailable'])) { $set[] = 'is_available = :is_available'; $bind[':is_available'] = (int)!!$data['isAvailable']; }
  if (empty($set)) { Response::error('No fields to update', 400); return; }
    $sql = 'UPDATE halls SET ' . implode(', ', $set) . ' WHERE id = :id';
    DB::conn()->prepare($sql)->execute($bind);
    $this->show(['id'=>$id]);
  }

  public function destroy(array $params): void
  {
    $stmt = DB::conn()->prepare('DELETE FROM halls WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
    Response::json(['success'=>true]);
  }
}


