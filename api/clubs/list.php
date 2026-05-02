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
    // Récupérer tous les clubs
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            description,
            owner_id,
            type,
            created_at
        FROM clubs
        ORDER BY id ASC
    ");
    $stmt->execute();
    $clubs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer les membres
    $stmt = $pdo->prepare("
        SELECT 
            club_id,
            user_id
        FROM club_members
    ");
    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Indexer les membres par club
    $clubMembers = [];
    foreach ($members as $m) {
        $cid = $m["club_id"];
        if (!isset($clubMembers[$cid])) {
            $clubMembers[$cid] = [];
        }
        $clubMembers[$cid][] = intval($m["user_id"]);
    }

    // Fusionner clubs + membres + statut utilisateur
    foreach ($clubs as &$club) {
        $cid = $club["id"];

        $club["members"] = $clubMembers[$cid] ?? [];
        $club["member_count"] = count($club["members"]);
        $club["is_member"] = in_array($userId, $club["members"]);
        $club["is_owner"] = ($club["owner_id"] == $userId);
    }

    echo json_encode($clubs);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
