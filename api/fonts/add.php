<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (
    !$data ||
    !isset($data["id"]) ||
    !isset($data["label"]) ||
    !isset($data["css_class"])
) {
    http_response_code(400);
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

$id = $data["id"];
$label = $data["label"];
$cssClass = $data["css_class"];
$isPremium = isset($data["is_premium"]) ? intval($data["is_premium"]) : 0;
$pricePoints = isset($data["price_points"]) ? intval($data["price_points"]) : 0;

try {
    $stmt = $pdo->prepare("
        INSERT INTO fonts (id, label, css_class, is_premium, price_points)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $label, $cssClass, $isPremium, $pricePoints]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
