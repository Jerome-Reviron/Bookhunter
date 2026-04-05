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

try {

    // Total pages lues
    $stmt = $pdo->prepare("
        SELECT SUM(pages_read) AS total_pages
        FROM reading_sessions
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $totalPages = intval($stmt->fetchColumn() ?? 0);

    // Total sessions
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM reading_sessions
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $totalSessions = intval($stmt->fetchColumn() ?? 0);

    // Temps total de lecture (en minutes)
    $stmt = $pdo->prepare("
        SELECT SUM(duration_minutes) 
        FROM reading_sessions
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $totalMinutes = intval($stmt->fetchColumn() ?? 0);

    // Total livres terminés
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM books
        WHERE user_id = ? AND status = 'finished'
    ");
    $stmt->execute([$userId]);
    $booksFinished = intval($stmt->fetchColumn() ?? 0);

    // Moyenne pages/session
    $avgPages = $totalSessions > 0 ? round($totalPages / $totalSessions, 2) : 0;

    // Moyenne durée/session
    $avgMinutes = $totalSessions > 0 ? round($totalMinutes / $totalSessions, 2) : 0;

    echo json_encode([
        "total_pages" => $totalPages,
        "total_sessions" => $totalSessions,
        "total_minutes" => $totalMinutes,
        "books_finished" => $booksFinished,
        "avg_pages_per_session" => $avgPages,
        "avg_minutes_per_session" => $avgMinutes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
