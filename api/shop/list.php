<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

// L'utilisateur peut être connecté ou non, mais on garde la session ouverte
$userId = $_SESSION['user_id'] ?? null;

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            type,
            name,
            price,
            image_url,
            rarity,
            description
        FROM shop_items
        ORDER BY type ASC, price ASC
    ");

    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "items" => $items,
        "user_id" => $userId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
