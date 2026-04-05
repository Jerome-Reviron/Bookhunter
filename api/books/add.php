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

// Champs attendus
$required = ["title", "author", "category", "support", "edition", "status", "total_pages", "cover_url"];

foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing field: $field"]);
        exit;
    }
}

$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        INSERT INTO books 
        (user_id, title, author, category, support, edition, status, total_pages, cover_url, current_page, notes, tags, stickers, card_font, card_bg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '', '[]', '[]', 'default', 'default')
    ");

    $stmt->execute([
        $userId,
        $input["title"],
        $input["author"],
        $input["category"],
        $input["support"],
        $input["edition"],
        $input["status"],
        intval($input["total_pages"]),
        $input["cover_url"]
    ]);

    echo json_encode([
        "success" => true,
        "book_id" => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
