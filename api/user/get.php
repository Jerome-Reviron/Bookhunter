<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            pseudo,
            email,
            avatar_url,
            points,
            unlocked_stickers,
            unlocked_fonts,
            unlocked_backgrounds,
            createdAt
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    // Convertir les champs JSON en tableaux
    $user["unlocked_stickers"] = json_decode($user["unlocked_stickers"], true);
    $user["unlocked_fonts"] = json_decode($user["unlocked_fonts"], true);
    $user["unlocked_backgrounds"] = json_decode($user["unlocked_backgrounds"], true);

    echo json_encode($user);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
