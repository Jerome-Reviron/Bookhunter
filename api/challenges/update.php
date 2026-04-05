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

if (!$input || !isset($input["challenge_id"]) || !isset($input["progress_value"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$userId = intval($_SESSION['user_id']);
$challengeId = intval($input["challenge_id"]);
$progressValue = intval($input["progress_value"]);

try {
    // Vérifier que le défi existe
    $stmt = $pdo->prepare("
        SELECT id, target_value, reward_points
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

    // Vérifier si une progression existe déjà
    $stmt = $pdo->prepare("
        SELECT progress_value, completed
        FROM challenge_progress
        WHERE user_id = ? AND challenge_id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId, $challengeId]);
    $progress = $stmt->fetch(PDO::FETCH_ASSOC);

    $alreadyCompleted = $progress ? boolval($progress["completed"]) : false;

    // Calcul de la nouvelle progression
    $newProgress = $progress ? max($progress["progress_value"], $progressValue) : $progressValue;

    // Déterminer si le défi est complété
    $isCompleted = $newProgress >= intval($challenge["target_value"]);

    // Si progression inexistante → INSERT
    if (!$progress) {
        $stmt = $pdo->prepare("
            INSERT INTO challenge_progress (user_id, challenge_id, progress_value, completed)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $challengeId, $newProgress, $isCompleted]);

    } else {
        // Sinon → UPDATE
        $stmt = $pdo->prepare("
            UPDATE challenge_progress
            SET progress_value = ?, completed = ?
            WHERE user_id = ? AND challenge_id = ?
        ");
        $stmt->execute([$newProgress, $isCompleted, $userId, $challengeId]);
    }

    // Récompense : seulement si complété maintenant et pas avant
    $rewardGiven = false;

    if ($isCompleted && !$alreadyCompleted) {
        $rewardPoints = intval($challenge["reward_points"]);

        $stmt = $pdo->prepare("
            UPDATE users
            SET points = points + ?
            WHERE id = ?
        ");
        $stmt->execute([$rewardPoints, $userId]);

        $rewardGiven = true;
    }

    echo json_encode([
        "success" => true,
        "progress_value" => $newProgress,
        "completed" => $isCompleted,
        "reward_given" => $rewardGiven
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
