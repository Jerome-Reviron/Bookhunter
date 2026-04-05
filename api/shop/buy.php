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

if (!$input || !isset($input["item_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing item_id"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$itemId = intval($input["item_id"]);

try {
    // Récupérer l'item
    $stmt = $pdo->prepare("
        SELECT id, type, name, price
        FROM shop_items
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$itemId]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo json_encode(["error" => "Item not found"]);
        exit;
    }

    // Récupérer l'utilisateur
    $stmt = $pdo->prepare("
        SELECT points, unlocked_stickers, unlocked_fonts, unlocked_backgrounds
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

    $points = intval($user["points"]);

    // Vérifier les points
    if ($points < intval($item["price"])) {
        http_response_code(400);
        echo json_encode(["error" => "Not enough points"]);
        exit;
    }

    // Déterminer la colonne à mettre à jour
    $column = match ($item["type"]) {
        "sticker" => "unlocked_stickers",
        "font" => "unlocked_fonts",
        "background" => "unlocked_backgrounds",
        default => null
    };

    if (!$column) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid item type"]);
        exit;
    }

    // Récupérer les unlocks actuels
    $unlocks = json_decode($user[$column], true) ?? [];

    // Vérifier si déjà acheté
    if (in_array($itemId, $unlocks)) {
        http_response_code(400);
        echo json_encode(["error" => "Item already owned"]);
        exit;
    }

    // Ajouter l'item
    $unlocks[] = $itemId;

    // Déduire les points
    $newPoints = $points - intval($item["price"]);

    // Mise à jour en base
    $stmt = $pdo->prepare("
        UPDATE users
        SET points = ?, $column = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $newPoints,
        json_encode($unlocks),
        $userId
    ]);

    echo json_encode([
        "success" => true,
        "new_points" => $newPoints,
        "unlocks" => $unlocks
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
