<?php
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../db.php';

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

// Vérifier paramètre club_id
if (!isset($_GET["club_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing club_id"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$clubId = intval($_GET["club_id"]);

try {
    // Vérifier que le club existe
    $stmt = $pdo->prepare("SELECT id FROM clubs WHERE id = ? LIMIT 1");
    $stmt->execute([$clubId]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Club not found"]);
        exit;
    }

    // Vérifier que l'utilisateur est membre
    $stmt = $pdo->prepare("
        SELECT id FROM club_members 
        WHERE user_id = ? AND club_id = ? 
        LIMIT 1
    ");
    $stmt->execute([$userId, $clubId]);
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(["error" => "Not a member"]);
        exit;
    }

    // Récupérer les messages du club
    $stmt = $pdo->prepare("
        SELECT 
            cm.id,
            cm.user_id,
            u.pseudo,
            cm.message,
            cm.createdAt
        FROM club_messages cm
        JOIN users u ON u.id = cm.user_id
        WHERE cm.club_id = ?
        ORDER BY cm.createdAt DESC
    ");
    $stmt->execute([$clubId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($messages);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
