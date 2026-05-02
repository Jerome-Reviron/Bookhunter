<?php
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["invitation_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing invitation_id"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$invId = intval($input["invitation_id"]);

try {
    // Marquer comme refusée
    $stmt = $pdo->prepare("
        UPDATE club_invitations
        SET status = 'declined'
        WHERE id = ? AND receiver_id = ?
    ");
    $stmt->execute([$invId, $userId]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
