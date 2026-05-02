<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=utf-8");

// Vérifier session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

// Vérifier user_id
if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing user_id"]);
    exit;
}

$userId = intval($_GET['user_id']);

// Un utilisateur ne peut voir que sa propre collection
if ($userId !== intval($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT s.*
        FROM user_stickers us
        JOIN stickers s ON s.id = us.sticker_id
        WHERE us.user_id = ?
        ORDER BY s.label ASC
    ");
    $stmt->execute([$userId]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
