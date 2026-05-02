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

// ⚠️ Ici tu peux ajouter un check admin si tu veux
// if ($_SESSION['role'] !== 'admin') { ... }

$data = json_decode(file_get_contents("php://input"), true);

if (
    !$data ||
    !isset($data["id"]) ||
    !isset($data["label"]) ||
    !isset($data["url"])
) {
    http_response_code(400);
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

$id = $data["id"];
$label = $data["label"];
$url = $data["url"];
$isPremium = isset($data["is_premium"]) ? intval($data["is_premium"]) : 0;
$pricePoints = isset($data["price_points"]) ? intval($data["price_points"]) : 0;

try {
    $stmt = $pdo->prepare("
        INSERT INTO stickers (id, label, url, is_premium, price_points)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $label, $url, $isPremium, $pricePoints]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
