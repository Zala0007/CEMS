<?php
declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Core\DB;
use Backend\Core\Request;
use Backend\Core\Response;

class EventsController
{
  public function index(): void
  {
    $category = Request::query('category');
    $status = Request::query('status');
    $search = Request::query('search');
    $dateFrom = Request::query('dateFrom');
    $dateTo = Request::query('dateTo');

    $sql = 'SELECT * FROM events WHERE 1=1';
    $params = [];
    if ($category) { $sql .= ' AND category = :category'; $params[':category'] = $category; }
    if ($status) { $sql .= ' AND status = :status'; $params[':status'] = $status; }
    if ($dateFrom) { $sql .= ' AND date >= :dateFrom'; $params[':dateFrom'] = $dateFrom; }
    if ($dateTo) { $sql .= ' AND date <= :dateTo'; $params[':dateTo'] = $dateTo; }
    if ($search) {
      $sql .= ' AND (title LIKE :q OR description LIKE :q OR organizer LIKE :q)';
      $params[':q'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY date DESC, time DESC';

    $stmt = DB::conn()->prepare($sql);
    $stmt->execute($params);
    Response::json($stmt->fetchAll());
  }

  public function show(array $params): void
  {
    $stmt = DB::conn()->prepare('SELECT * FROM events WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
    $event = $stmt->fetch();
  if (!$event) { Response::error('Not Found', 404); return; }
    Response::json($event);
  }

  public function store(): void
  {
    $data = Request::json();
    $required = ['title','description','category','date','time','venue','organizer'];
  foreach ($required as $r) { if (empty($data[$r])) { Response::error("$r is required", 422); return; } }

    $stmt = DB::conn()->prepare('INSERT INTO events (title, description, category, date, time, venue, organizer, status, created_by) VALUES (:title,:description,:category,:date,:time,:venue,:organizer,:status,:created_by)');
    $stmt->execute([
      ':title'=>$data['title'],
      ':description'=>$data['description'],
      ':category'=>$data['category'],
      ':date'=>$data['date'],
      ':time'=>$data['time'],
      ':venue'=>$data['venue'],
      ':organizer'=>$data['organizer'],
      ':status'=>$data['status'] ?? 'upcoming',
      ':created_by'=>$data['created_by'] ?? 1,
    ]);

    $id = (int)DB::conn()->lastInsertId();
    $this->show(['id' => $id]);
  }

  public function update(array $params): void
  {
    $id = (int)$params['id'];
    $data = Request::json();
    $fields = ['title','description','category','date','time','venue','organizer','status'];
    $set = [];
    $bind = [':id'=>$id];
    foreach ($fields as $f) {
      if (isset($data[$f])) { $set[] = "$f = :$f"; $bind[":$f"] = $data[$f]; }
    }
  if (empty($set)) { Response::error('No fields to update', 400); return; }
    $sql = 'UPDATE events SET ' . implode(', ', $set) . ' WHERE id = :id';
    DB::conn()->prepare($sql)->execute($bind);
    $this->show(['id'=>$id]);
  }

  public function destroy(array $params): void
  {
    $stmt = DB::conn()->prepare('DELETE FROM events WHERE id = :id');
    $stmt->execute([':id' => (int)$params['id']]);
    Response::json(['success'=>true]);
  }

  
}


