<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data['title']) || !isset($data['author'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$title = trim($data['title']);
$author = trim($data['author']);

try {
    $stmt = $pdo->prepare("
        INSERT INTO wishlist (user_id, title, author)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$userId, $title, $author]);

    echo json_encode(["id" => $pdo->lastInsertId()]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
    exit;
}
