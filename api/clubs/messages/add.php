<?php
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../db.php';

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

// Vérifier méthode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Récupérer le JSON envoyé par le front
$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input["club_id"]) || !isset($input["message"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$clubId = intval($input["club_id"]);
$message = trim($input["message"]);

if ($message === "") {
    http_response_code(400);
    echo json_encode(["error" => "Empty message"]);
    exit;
}

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

    // Ajouter le message
    $stmt = $pdo->prepare("
        INSERT INTO club_messages (club_id, user_id, message, createdAt)
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$clubId, $userId, $message]);

    echo json_encode([
        "success" => true,
        "message_id" => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
