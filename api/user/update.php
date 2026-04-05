<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

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

if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

// Champs autorisés à être mis à jour
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
    if (isset($input[$field])) {

        // Si c'est un champ JSON → on encode proprement
        if (in_array($field, ["unlocked_stickers", "unlocked_fonts", "unlocked_backgrounds"])) {
            $updates[] = "$field = ?";
            $params[] = json_encode($input[$field]);
        } else {
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
}

if (empty($updates)) {
    echo json_encode(["success" => false, "message" => "Nothing to update"]);
    exit;
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
