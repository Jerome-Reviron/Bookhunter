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
    // Récupérer l'invitation
    $stmt = $pdo->prepare("
        SELECT club_id, receiver_id
        FROM club_invitations
        WHERE id = ? AND status = 'pending'
    ");
    $stmt->execute([$invId]);
    $inv = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$inv || $inv["receiver_id"] != $userId) {
        http_response_code(403);
        echo json_encode(["error" => "Invalid invitation"]);
        exit;
    }

    // Ajouter le membre au club
    $stmt = $pdo->prepare("
        INSERT INTO club_members (club_id, user_id)
        VALUES (?, ?)
    ");
    $stmt->execute([$inv["club_id"], $userId]);

    // Marquer l'invitation comme acceptée
    $stmt = $pdo->prepare("
        UPDATE club_invitations
        SET status = 'accepted'
        WHERE id = ?
    ");
    $stmt->execute([$invId]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
