<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

header("Content-Type: application/json; charset=UTF-8");

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

try {
    // 1) Total livres terminés
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM books
        WHERE user_id = ? AND status = 'finished'
    ");
    $stmt->execute([$userId]);
    $totalFinished = intval($stmt->fetchColumn() ?? 0);

    // 2) Total pages lues (uniquement livres terminés)
    $stmt = $pdo->prepare("
        SELECT SUM(total_pages) 
        FROM books
        WHERE user_id = ? AND status = 'finished'
    ");
    $stmt->execute([$userId]);
    $totalPages = intval($stmt->fetchColumn() ?? 0);

    // 3) Top genres (category)
    $stmt = $pdo->prepare("
        SELECT category, COUNT(*) AS count
        FROM books
        WHERE user_id = ?
        GROUP BY category
        ORDER BY count DESC
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $topGenres = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "totalFinished" => $totalFinished,
        "totalPages" => $totalPages,
        "topGenres" => $topGenres
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
