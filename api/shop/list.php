<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            type,
            name,
            price_points,
            stripe_url,
            image_url,
            value
        FROM shop_items
        ORDER BY type ASC, price_points ASC
    ");

    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($items);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
