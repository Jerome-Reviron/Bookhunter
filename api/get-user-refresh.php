<?php
session_start();
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/db.php";

header("Content-Type: application/json; charset=UTF-8");

// Si pas de session → renvoyer null (pas une erreur)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(null);
    exit;
}

$userId = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("
        SELECT id, pseudo, email, role
        FROM users
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(null);
        exit;
    }

    $user['role'] = ($user['role'] === 'admin') ? 'admin' : 'user';

    echo json_encode($user);
    exit;

} catch (PDOException $e) {
    echo json_encode(null);
    exit;
}
