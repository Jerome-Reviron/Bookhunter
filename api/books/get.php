<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=utf-8");

$userId = intval($_SESSION['user_id']);
$bookId = isset($_GET['id']) ? intval($_GET['id']) : null;

try {
    if ($bookId) {
        $stmt = $pdo->prepare("
            SELECT id, user_id, title, author, category, support, edition,
                   status, rating, start_date, end_date, cover_url,
                   total_pages, current_page, notes, tags, stickers,
                   card_font, card_bg
            FROM books
            WHERE id = ? AND user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$bookId, $userId]);
        $book = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$book) {
            http_response_code(404);
            echo json_encode(["error" => "Book not found"]);
            exit;
        }

        // Normalisation
        $book['notes'] = $book['notes'] ?? '';
        $book['tags'] = $book['tags'] ?? '[]';
        $book['stickers'] = $book['stickers'] ?? '[]';

        echo json_encode($book);
    } else {
        $stmt = $pdo->prepare("
            SELECT id, user_id, title, author, category, support, edition,
                   status, rating, start_date, end_date, cover_url,
                   total_pages, current_page, notes, tags, stickers,
                   card_font, card_bg
            FROM books
            WHERE user_id = ?
            ORDER BY id DESC
        ");
        $stmt->execute([$userId]);
        $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($books as &$book) {
            $book['notes'] = $book['notes'] ?? '';
            $book['tags'] = $book['tags'] ?? '[]';
            $book['stickers'] = $book['stickers'] ?? '[]';
        }
        unset($book);

        echo json_encode($books);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}