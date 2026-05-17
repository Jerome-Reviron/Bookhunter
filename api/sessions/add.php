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

if (
    !$input ||
    !isset($input["book_id"]) ||
    !isset($input["pages_read"]) ||
    !isset($input["start_session"]) ||
    !isset($input["end_session"])
) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$bookId = intval($input["book_id"]);
$pagesRead = intval($input["pages_read"]);

$startSession = $input["start_session"]; // format DATETIME
$endSession = $input["end_session"];     // format DATETIME

// Calcul de la durée exacte en secondes
$durationSeconds = strtotime($endSession) - strtotime($startSession);

// Vérifier que le livre appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT id, start_date, total_pages, current_page FROM books WHERE id = ? AND user_id = ?");
$stmt->execute([$bookId, $userId]);
$book = $stmt->fetch();

if (!$book) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

try {
    // Ajouter la session
    $stmt = $pdo->prepare("
        INSERT INTO reading_sessions (user_id, book_id, pages_read, start_session, end_session, duration_seconds)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $bookId, $pagesRead, $startSession, $endSession, $durationSeconds]);

    // Mettre à jour start_date et end_date dans la table books
    if ($book["start_date"] === null) {
        // Première session → start_date = start_session
        $updateDates = $pdo->prepare("
            UPDATE books
            SET start_date = ?, end_date = ?
            WHERE id = ? AND user_id = ?
        ");
        $updateDates->execute([$startSession, $endSession, $bookId, $userId]);
    } else {
        // Sessions suivantes → end_date = end_session
        $updateDates = $pdo->prepare("
            UPDATE books
            SET end_date = ?
            WHERE id = ? AND user_id = ?
        ");
        $updateDates->execute([$endSession, $bookId, $userId]);
    }

    // 🔥 Mise à jour du nombre de pages lues
    $newCurrentPage = min($book["current_page"] + $pagesRead, $book["total_pages"]);

    $updatePage = $pdo->prepare("
        UPDATE books
        SET current_page = ?
        WHERE id = ? AND user_id = ?
    ");
    $updatePage->execute([$newCurrentPage, $bookId, $userId]);

    echo json_encode([
        "success" => true,
        "session_id" => $pdo->lastInsertId(),
        "current_page" => $newCurrentPage
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
