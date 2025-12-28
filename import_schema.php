<?php
$host = '127.0.0.1';
$user = 'root';
$pass = ''; // XAMPP default
$dbname = 'college_events_db';
$sqlFile = __DIR__ . '/backend/schema.sql';

if (!file_exists($sqlFile)) { echo "Missing $sqlFile\n"; exit(1); }
$sql = file_get_contents($sqlFile);
if ($sql === false) { echo "Cannot read $sqlFile\n"; exit(1); }

$mysqli = new mysqli($host, $user, $pass);
if ($mysqli->connect_errno) { echo "Connect failed: " . $mysqli->connect_error . "\n"; exit(1); }

if (!$mysqli->query("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;")) {
    echo "DB create error: " . $mysqli->error . "\n"; exit(1);
}
$mysqli->select_db($dbname);

if (!$mysqli->multi_query($sql)) {
    echo "Import error: " . $mysqli->error . "\n"; exit(1);
}
do {
    if ($res = $mysqli->store_result()) { $res->free(); }
} while ($mysqli->more_results() && $mysqli->next_result());

echo "Schema import completed\n";
$mysqli->close();