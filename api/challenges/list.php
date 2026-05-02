<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

$userId = intval($_SESSION['user_id']);

try {
    // 1) Récupérer tous les défis
    $stmt = $pdo->prepare("
        SELECT 
            id,
            title,
            description,
            reward_type,
            reward_value,
            requirement_type,
            requirement_value
        FROM challenges
        ORDER BY id ASC
    ");
    $stmt->execute();
    $challenges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2) Récupérer la progression de l'utilisateur
    $stmt = $pdo->prepare("
        SELECT 
            challenge_id,
            progress,
            completed,
            claimed
        FROM challenge_progress
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $progressRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Indexer la progression
    $progressMap = [];
    foreach ($progressRows as $row) {
        $progressMap[$row["challenge_id"]] = [
            "currentProgress" => intval($row["progress"]),
            "completed" => boolval($row["completed"]),
            "claimed" => boolval($row["claimed"])
        ];
    }

    // 3) Fusionner défis + progression
    foreach ($challenges as &$c) {
        $cid = $c["id"];

        // Valeurs par défaut
        $c["currentProgress"] = 0;
        $c["completed"] = false;
        $c["claimed"] = false;

        if (isset($progressMap[$cid])) {
            $c["currentProgress"] = $progressMap[$cid]["currentProgress"];
            $c["completed"] = $progressMap[$cid]["completed"];
            $c["claimed"] = $progressMap[$cid]["claimed"];
        }
    }

    echo json_encode($challenges);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
