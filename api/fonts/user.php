<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=utf-8");

// 🔐 Sécurité session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        SELECT f.*
        FROM user_fonts uf
        JOIN fonts f ON f.id = uf.font_id
        WHERE uf.user_id = ?
        ORDER BY f.label ASC
    ");
    $stmt->execute([$userId]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
