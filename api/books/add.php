<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $userId = intval($input['userId'] ?? 0);
    if ($userId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or invalid user ID']);
        exit;
    }

    // Convertir stickers en JSON
    $stickers = json_encode($input['stickers'] ?? []);

    // Valeurs par défaut
    $cardFont = $input['card_font'] ?? 'default';
    $cardBg   = $input['card_bg'] ?? 'default';

    $stmt = $pdo->prepare("
        INSERT INTO books (
            user_id, title, author, category, support, edition, status,
            total_pages, cover_url, current_page, notes, tags, stickers,
            card_font, card_bg
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?, ?, ?)
    ");

    $stmt->execute([
        $userId,
        $input['title'] ?? '',
        $input['author'] ?? '',
        $input['category'] ?? 'Fiction',
        $input['support'] ?? 'physical',
        $input['edition'] ?? '',
        $input['status'] ?? 'reading',
        intval($input['total_pages'] ?? 0),
        $input['cover_url'] ?? '',
        $stickers,
        $cardFont,
        $cardBg
    ]);

    echo json_encode([
        'success' => true,
        'book_id' => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
