<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

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

    // Conversion JSON
    $stickers = json_decode($user["unlocked_stickers"] ?? "[]", true) ?? [];
    $fonts = json_decode($user["unlocked_fonts"] ?? "[]", true) ?? [];
    $bgs = json_decode($user["unlocked_backgrounds"] ?? "[]", true) ?? [];

    // Renvoyer les bons noms pour le frontend
    echo json_encode([
        "id" => $user["id"],
        "username" => $user["pseudo"],          // 🔥 correspond à profile.username
        "email" => $user["email"],
        "avatar_url" => $user["avatar_url"],
        "points" => $user["points"],
        "created_at" => $user["createdAt"],     // 🔥 correspond à profile.created_at
        "unlocked_stickers" => $stickers,
        "unlocked_fonts" => $fonts,
        "unlocked_backgrounds" => $bgs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
