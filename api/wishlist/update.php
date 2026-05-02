<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['title']) || !isset($data['author'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$itemId = intval($data['id']);
$title = trim($data['title']);
$author = trim($data['author']);

try {
    $stmt = $pdo->prepare("
        UPDATE wishlist
        SET title = ?, author = ?
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$title, $author, $itemId, $userId]);

    echo json_encode(["success" => true]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
    exit;
}
