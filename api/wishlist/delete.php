<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing id"]);
    exit;
}

$itemId = intval($_GET['id']);
$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        DELETE FROM wishlist
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$itemId, $userId]);

    echo json_encode(["success" => true]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
    exit;
}
