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
    // Récupérer tous les défis
    $stmt = $pdo->prepare("
        SELECT 
            id,
            title,
            description,
            type,
            target_value,
            reward_points,
            icon_url
        FROM challenges
        ORDER BY id ASC
    ");
    $stmt->execute();
    $challenges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer la progression de l'utilisateur
    $stmt = $pdo->prepare("
        SELECT 
            challenge_id,
            progress_value,
            completed
        FROM challenge_progress
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $progressRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Indexer la progression par challenge_id
    $progressMap = [];
    foreach ($progressRows as $row) {
        $progressMap[$row["challenge_id"]] = [
            "progress_value" => intval($row["progress_value"]),
            "completed" => boolval($row["completed"])
        ];
    }

    // Fusionner défis + progression
    foreach ($challenges as &$challenge) {
        $cid = $challenge["id"];

        if (isset($progressMap[$cid])) {
            $challenge["progress"] = $progressMap[$cid];
        } else {
            // Si aucune progression → valeur par défaut
            $challenge["progress"] = [
                "progress_value" => 0,
                "completed" => false
            ];
        }
    }

    echo json_encode($challenges);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
