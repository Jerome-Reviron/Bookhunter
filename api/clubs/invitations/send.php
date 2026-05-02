<?php
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["club_id"], $input["receiver_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

$senderId = intval($_SESSION['user_id']);
$clubId = intval($input["club_id"]);
$receiverId = intval($input["receiver_id"]);

try {
    // Vérifier si une invitation existe déjà
    $stmt = $pdo->prepare("
        SELECT id FROM club_invitations
        WHERE club_id = ? AND receiver_id = ? AND status = 'pending'
    ");
    $stmt->execute([$clubId, $receiverId]);

    if ($stmt->fetch()) {
        echo json_encode(["error" => "Invitation already sent"]);
        exit;
    }

    // Créer l'invitation
    $stmt = $pdo->prepare("
        INSERT INTO club_invitations (club_id, sender_id, receiver_id)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$clubId, $senderId, $receiverId]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
