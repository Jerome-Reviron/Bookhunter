<?php
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        SELECT 
            i.id,
            i.club_id,
            i.sender_id,
            i.status,
            i.created_at,
            c.name AS club_name,
            u.pseudo AS sender_name
        FROM club_invitations i
        JOIN clubs c ON c.id = i.club_id
        JOIN users u ON u.id = i.sender_id
        WHERE i.receiver_id = ?
        ORDER BY i.created_at DESC
    ");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
