<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

    // 🔹 Sécurisation des champs optionnels
    $title      = $input['title'] ?? '';
    $author     = $input['author'] ?? '';
    $category   = $input['category'] ?? 'Fiction';
    $support    = $input['support'] ?? 'physical';
    $edition    = $input['edition'] ?? '';
    $status     = $input['status'] ?? 'reading';
    $totalPages = intval($input['total_pages'] ?? 0);
    $coverUrl   = $input['cover_url'] ?? '';

    // 🔹 Champs qui posaient problème (NOT NULL)
    $notes = $input['notes'] ?? '';   // ⬅️ FIX CRITIQUE
    $tags  = $input['tags'] ?? '';    // ⬅️ FIX (si colonne NOT NULL)

    // 🔹 Stickers doit être JSON
    $stickers = json_encode($input['stickers'] ?? []);

    // 🔹 Valeurs par défaut pour la carte
    $cardFont = $input['card_font'] ?? 'default';
    $cardBg   = $input['card_bg'] ?? 'default';

    // 🔹 Requête SQL corrigée
    $stmt = $pdo->prepare("
        INSERT INTO books (
            user_id, title, author, category, support, edition, status,
            total_pages, cover_url, current_page, notes, tags, stickers,
            card_font, card_bg
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $userId,
        $title,
        $author,
        $category,
        $support,
        $edition,
        $status,
        $totalPages,
        $coverUrl,
        $notes,
        $tags,
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
