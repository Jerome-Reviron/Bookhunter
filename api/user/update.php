<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

// json_decode retourne null si JSON invalide
if ($input === null) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

$allowedFields = [
    "pseudo",
    "email",
    "avatar_url",
    "points",
    "unlocked_stickers",
    "unlocked_fonts",
    "unlocked_backgrounds"
];

$updates = [];
$params = [];

foreach ($allowedFields as $field) {

    // array_key_exists accepte les valeurs vides
    if (array_key_exists($field, $input)) {

        // Champs JSON → doivent toujours être des tableaux valides
        if (in_array($field, ["unlocked_stickers", "unlocked_fonts", "unlocked_backgrounds"])) {

            $value = $input[$field];

            // Empêcher MySQL JSON NOT NULL de planter
            if ($value === "" || $value === null) {
                $value = [];
            }

            $updates[] = "$field = ?";
            $params[] = json_encode($value);

        } else {
            // Champs simples
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
}

if (empty($updates)) {
    echo json_encode(["success" => false, "message" => "Nothing to update"]);
    return;
}

$params[] = $userId;

$query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";

try {
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
