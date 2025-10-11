<?php
declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Core\DB;
use Backend\Core\Request;
use Backend\Core\Response;

class BookingsController
{
  public function index(): void
  {
    $status = Request::query('status');
    $hallId = Request::query('hallId');
    $userId = Request::query('userId');
    $search = Request::query('search');

    $sql = 'SELECT b.*, h.name AS hallName, u.username FROM bookings b JOIN halls h ON b.hall_id = h.id JOIN users u ON b.user_id = u.id WHERE 1=1';
    $params = [];
    if ($status) { $sql .= ' AND b.status = :status'; $params[':status'] = $status; }
    if ($hallId) { $sql .= ' AND b.hall_id = :hallId'; $params[':hallId'] = (int)$hallId; }
    if ($userId) { $sql .= ' AND b.user_id = :userId'; $params[':userId'] = (int)$userId; }
    if ($search) { $sql .= ' AND (b.purpose LIKE :q OR h.name LIKE :q OR u.username LIKE :q)'; $params[':q'] = '%' . $search . '%'; }
    $sql .= ' ORDER BY b.created_at DESC';

    $stmt = DB::conn()->prepare($sql);
    $stmt->execute($params);
    Response::json($stmt->fetchAll());
  }

  public function show(array $params): void
  {
    $stmt = DB::conn()->prepare('SELECT * FROM bookings WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
  $row = $stmt->fetch();
  if (!$row) { Response::error('Not Found', 404); return; }
    Response::json($row);
  }

  public function store(): void
  {
    $data = Request::json();
  $required = ['hallId','userId','purpose','date','startTime','duration','attendees'];
  foreach ($required as $r) { if (!isset($data[$r]) || $data[$r] === '') { Response::error("$r is required", 422); return; } }

    // Basic conflict check: approved bookings for same hall/date/time overlap
    $conflictStmt = DB::conn()->prepare('SELECT * FROM bookings WHERE hall_id = :hall AND date = :date AND status = "approved"');
    $conflictStmt->execute([':hall' => (int)$data['hallId'], ':date' => $data['date']]);
    $existing = $conflictStmt->fetchAll();
    foreach ($existing as $b) {
      if ($this->hasTimeConflict($data['startTime'], $data['duration'], $b['start_time'], $b['duration'])) {
        Response::error('Time slot not available', 409); return;
      }
    }

    $stmt = DB::conn()->prepare('INSERT INTO bookings (hall_id, user_id, purpose, date, start_time, duration, attendees, requirements, status) VALUES (:hall_id,:user_id,:purpose,:date,:start_time,:duration,:attendees,:requirements,:status)');
    $stmt->execute([
      ':hall_id'=>(int)$data['hallId'],
      ':user_id'=>(int)$data['userId'],
      ':purpose'=>$data['purpose'],
      ':date'=>$data['date'],
      ':start_time'=>$data['startTime'],
      ':duration'=>$data['duration'],
      ':attendees'=>(int)$data['attendees'],
      ':requirements'=>$data['requirements'] ?? null,
      ':status'=>$data['status'] ?? 'pending',
    ]);
    $id = (int)DB::conn()->lastInsertId();
    $this->show(['id'=>$id]);
  }

  public function update(array $params): void
  {
    $id = (int)$params['id'];
    $data = Request::json();
    $fields = ['hall_id','user_id','purpose','date','start_time','duration','attendees','requirements','status'];
    $set = [];
    $bind = [':id'=>$id];
    foreach ($fields as $f) {
      if (isset($data[$f])) { $set[] = "$f = :$f"; $bind[":$f"] = $data[$f]; }
    }
    if (isset($data['hallId'])) { $set[] = 'hall_id = :hall_id'; $bind[':hall_id'] = (int)$data['hallId']; }
    if (isset($data['userId'])) { $set[] = 'user_id = :user_id'; $bind[':user_id'] = (int)$data['userId']; }
    if (isset($data['startTime'])) { $set[] = 'start_time = :start_time'; $bind[':start_time'] = $data['startTime']; }
  if (empty($set)) { Response::error('No fields to update', 400); return; }
    $sql = 'UPDATE bookings SET ' . implode(', ', $set) . ' WHERE id = :id';
    DB::conn()->prepare($sql)->execute($bind);
    $this->show(['id'=>$id]);
  }

  public function destroy(array $params): void
  {
    $stmt = DB::conn()->prepare('DELETE FROM bookings WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
    Response::json(['success'=>true]);
  }

  private function hasTimeConflict(string $startA, string $durA, string $startB, string $durB): bool
  {
    $aStart = $this->toMinutes($startA);
    $aEnd = $aStart + $this->durToMinutes($durA);
    $bStart = $this->toMinutes($startB);
    $bEnd = $bStart + $this->durToMinutes($durB);
    return $aStart < $bEnd && $bStart < $aEnd;
  }

  private function toMinutes(string $t): int { [$h,$m] = array_map('intval', explode(':', $t)); return $h*60+$m; }
  private function durToMinutes(string $d): int { return $d === 'full-day' ? 8*60 : (int)$d * 60; }
}


