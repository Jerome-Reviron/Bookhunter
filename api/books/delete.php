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

if (!$input || !isset($input["book_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing book_id or invalid JSON"]);
    exit;
}

$bookId = intval($input["book_id"]);
$userId = intval($_SESSION['user_id']);

// Vérifier que le livre appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT id FROM books WHERE id = ? AND user_id = ?");
$stmt->execute([$bookId, $userId]);

if ($stmt->rowCount() === 0) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM books WHERE id = ? AND user_id = ?");
    $stmt->execute([$bookId, $userId]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}