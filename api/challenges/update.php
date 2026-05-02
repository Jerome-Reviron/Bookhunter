<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input["challengeId"]) || !isset($input["progress"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$challengeId = intval($input["challengeId"]);
$progressValue = intval($input["progress"]);

try {
    // Récupérer le défi
    $stmt = $pdo->prepare("
        SELECT id, reward_type, reward_value, requirement_value
        FROM challenges
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$challengeId]);
    $challenge = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$challenge) {
        http_response_code(404);
        echo json_encode(["error" => "Challenge not found"]);
        exit;
    }

    // Récupérer progression existante
    $stmt = $pdo->prepare("
        SELECT progress, completed, claimed
        FROM challenge_progress
        WHERE user_id = ? AND challenge_id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId, $challengeId]);
    $progress = $stmt->fetch(PDO::FETCH_ASSOC);

    $alreadyCompleted = $progress ? boolval($progress["completed"]) : false;

    // Nouvelle progression
    $newProgress = $progress ? max($progress["progress"], $progressValue) : $progressValue;

    // Déterminer si complété
    $isCompleted = $newProgress >= intval($challenge["requirement_value"]);

    // INSERT ou UPDATE
    if (!$progress) {
        $stmt = $pdo->prepare("
            INSERT INTO challenge_progress (user_id, challenge_id, progress, completed, claimed)
            VALUES (?, ?, ?, ?, 0)
        ");
        $stmt->execute([$userId, $challengeId, $newProgress, $isCompleted]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE challenge_progress
            SET progress = ?, completed = ?
            WHERE user_id = ? AND challenge_id = ?
        ");
        $stmt->execute([$newProgress, $isCompleted, $userId, $challengeId]);
    }

    // Récompense
    $rewardGiven = false;

    if ($isCompleted && !$alreadyCompleted) {
        if ($challenge["reward_type"] === "points") {
            $rewardPoints = intval($challenge["reward_value"]);

            $stmt = $pdo->prepare("
                UPDATE users
                SET points = points + ?
                WHERE id = ?
            ");
            $stmt->execute([$rewardPoints, $userId]);

            $rewardGiven = true;
        }
    }

    echo json_encode([
        "success" => true,
        "progress" => $newProgress,
        "completed" => $isCompleted,
        "reward_given" => $rewardGiven
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
