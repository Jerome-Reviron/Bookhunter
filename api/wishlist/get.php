<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

// L'utilisateur est déjà vérifié par auth.php
$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        SELECT id, title, author
        FROM wishlist
        WHERE user_id = ?
        ORDER BY id DESC
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($items);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
    exit;
}
