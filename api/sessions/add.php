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

if (!$input || !isset($input["book_id"]) || !isset($input["pages_read"]) || !isset($input["duration_minutes"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$bookId = intval($input["book_id"]);
$pages = intval($input["pages_read"]);
$duration = intval($input["duration_minutes"]);
$date = $input["date"] ?? date("Y-m-d H:i:s");

// Vérifier que le livre appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT id FROM books WHERE id = ? AND user_id = ?");
$stmt->execute([$bookId, $userId]);

if ($stmt->rowCount() === 0) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

try {
    // Ajouter la session
    $stmt = $pdo->prepare("
        INSERT INTO reading_sessions (user_id, book_id, pages_read, duration_minutes, createdAt)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([$userId, $bookId, $pages, $duration, $date]);

    echo json_encode([
        "success" => true,
        "session_id" => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
