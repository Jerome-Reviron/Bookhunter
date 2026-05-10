<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=utf-8");

// Vérifier session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["user_id"]) || !isset($data["font_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

$userId = intval($data["user_id"]);
$fontId = $data["font_id"];

// Un utilisateur ne peut acheter que pour lui-même
if ($userId !== intval($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

try {
    // Vérifier font
    $stmt = $pdo->prepare("SELECT * FROM fonts WHERE id = ?");
    $stmt->execute([$fontId]);
    $font = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$font) {
        http_response_code(404);
        echo json_encode(["error" => "Font not found"]);
        exit;
    }

    // Vérifier si déjà débloquée
    $stmt = $pdo->prepare("SELECT 1 FROM user_fonts WHERE user_id = ? AND font_id = ?");
    $stmt->execute([$userId, $fontId]);

    if ($stmt->fetch()) {
        echo json_encode(["success" => true, "message" => "Already unlocked"]);
        exit;
    }

    // Si gratuit → débloquer directement
    if ($font["is_premium"] == 0) {
        $pdo->prepare("INSERT INTO user_fonts (user_id, font_id) VALUES (?, ?)")
            ->execute([$userId, $fontId]);

        echo json_encode(["success" => true, "message" => "Font unlocked"]);
        exit;
    }

    // Vérifier points utilisateur
    $stmt = $pdo->prepare("SELECT points FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    if ($user["points"] < $font["price_points"]) {
        http_response_code(400);
        echo json_encode(["error" => "Not enough points"]);
        exit;
    }

    // Débloquer + retirer points
    $pdo->prepare("INSERT INTO user_fonts (user_id, font_id) VALUES (?, ?)")
        ->execute([$userId, $fontId]);

    $pdo->prepare("UPDATE users SET points = points - ? WHERE id = ?")
        ->execute([$font["price_points"], $userId]);

    echo json_encode(["success" => true, "message" => "Font purchased"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
