<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$sessionId = isset($_GET["id"]) ? intval($_GET["id"]) : null;
$userId = intval($_SESSION['user_id']);

if (!$sessionId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing session id"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        DELETE FROM reading_sessions
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$sessionId, $userId]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
