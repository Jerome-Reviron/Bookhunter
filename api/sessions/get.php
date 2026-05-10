<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

// Filtre optionnel : book_id
$bookId = isset($_GET["book_id"]) ? intval($_GET["book_id"]) : null;

try {
    if ($bookId) {
        // Vérifier que le livre appartient à l'utilisateur
        $stmt = $pdo->prepare("SELECT id FROM books WHERE id = ? AND user_id = ?");
        $stmt->execute([$bookId, $userId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden"]);
            exit;
        }

        // Récupérer les sessions pour un livre précis
        $stmt = $pdo->prepare("
            SELECT id, book_id, pages_read, duration_minutes, timestamp
            FROM reading_sessions
            WHERE user_id = ? AND book_id = ?
            ORDER BY timestamp DESC
        ");
        $stmt->execute([$userId, $bookId]);

    } else {
        // Récupérer toutes les sessions de l'utilisateur
        $stmt = $pdo->prepare("
            SELECT id, book_id, pages_read, duration_minutes, timestamp
            FROM reading_sessions
            WHERE user_id = ?
            ORDER BY timestamp DESC
        ");
        $stmt->execute([$userId]);
    }

    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($sessions);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
