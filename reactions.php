<?php
/* =========================================================
   reactions.php
   =========================================================
   POST -> "Bigyan ng Ginhawa" (heart). Isang beses lang
   makaka-react ang isang user bawat post (may UNIQUE constraint
   sa reactions table na post_id + user_id).

   Tinatanggap: { post_id, user_id }
   Ibinabalik: { success: true, comfort: <bagong bilang> }
               o { alreadyReacted: true, comfort: <kasalukuyang bilang> }
   ========================================================= */

header('Content-Type: application/json');
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$input  = json_decode(file_get_contents('php://input'), true);
$postId = $input['post_id'] ?? null;
$userId = $input['user_id'] ?? null;

if (!$postId || !$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'Kulang ang impormasyon.']);
    exit;
}

// Tingnan muna kung nag-react na ang user na ito sa post na ito
$check = $pdo->prepare('SELECT id FROM reactions WHERE post_id = ? AND user_id = ?');
$check->execute([$postId, $userId]);

if ($check->fetch()) {
    // Meron nang reaction — huwag nang dagdagan, ibalik lang ang kasalukuyang count
    $countStmt = $pdo->prepare('SELECT comfort_count FROM posts WHERE id = ?');
    $countStmt->execute([$postId]);
    $post = $countStmt->fetch();

    echo json_encode([
        'alreadyReacted' => true,
        'comfort'        => (int)($post['comfort_count'] ?? 0),
    ]);
    exit;
}

// Bagong reaction — i-insert at dagdagan ang comfort_count
$pdo->beginTransaction();
try {
    $insert = $pdo->prepare('INSERT INTO reactions (post_id, user_id) VALUES (?, ?)');
    $insert->execute([$postId, $userId]);

    $update = $pdo->prepare('UPDATE posts SET comfort_count = comfort_count + 1 WHERE id = ?');
    $update->execute([$postId]);

    $countStmt = $pdo->prepare('SELECT comfort_count FROM posts WHERE id = ?');
    $countStmt->execute([$postId]);
    $post = $countStmt->fetch();

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'comfort' => (int)$post['comfort_count'],
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'May problema sa pagse-save ng reaction.']);
}
