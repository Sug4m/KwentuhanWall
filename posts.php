<?php
/* =========================================================
   posts.php
   =========================================================
   GET  -> ibinabalik ang listahan ng mga post (pinaka-bago muna),
           kasama ang bilang ng post bawat kategorya.
   POST -> gumagawa ng bagong post sa database.

   Tinatanggap ng frontend (wall.js / write.js) ang JSON na ito
   at direkta na lang ipinapakita sa pahina.
   ========================================================= */

header('Content-Type: application/json');
require_once 'db_connect.php';

// Nagbibigay ng magandang "X oras/araw nakalipas" na text sa halip na raw timestamp.
function timeAgoFilipino(string $datetime): string {
    $diff = time() - strtotime($datetime);

    if ($diff < 60) return "ngayon lang";
    if ($diff < 3600) return floor($diff / 60) . " minuto nakalipas";
    if ($diff < 86400) return floor($diff / 3600) . " oras nakalipas";
    if ($diff < 604800) return floor($diff / 86400) . " araw nakalipas";
    return floor($diff / 604800) . " linggo nakalipas";
}

$method = $_SERVER['REQUEST_METHOD'];

/* ---------------------------------------------------------
   GET — kunin ang mga post
   --------------------------------------------------------- */
if ($method === 'GET') {
    $categoryFilter = $_GET['category'] ?? null;

    $sql = "
        SELECT
            p.id,
            u.alias,
            c.name AS category,
            c.color AS categoryColor,
            p.content,
            p.comfort_count,
            p.created_at,
            (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) AS comment_count
        FROM posts p
        JOIN users u ON u.id = p.user_id
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_hidden = 0
    ";

    $params = [];
    if ($categoryFilter) {
        $sql .= " AND c.name = ?";
        $params[] = $categoryFilter;
    }

    $sql .= " ORDER BY p.created_at DESC LIMIT 50";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $posts = array_map(function ($row) {
        return [
            'id'             => (int)$row['id'],
            'alias'          => $row['alias'],
            'category'       => $row['category'],
            'categoryColor'  => $row['categoryColor'],
            'text'           => $row['content'],
            'comfort'        => (int)$row['comfort_count'],
            'comments'       => (int)$row['comment_count'],
            'time'           => timeAgoFilipino($row['created_at']),
        ];
    }, $rows);

    // Bilang ng post bawat kategorya (para sa sidebar)
    $countStmt = $pdo->query("
        SELECT c.name, COUNT(p.id) AS total
        FROM categories c
        LEFT JOIN posts p ON p.category_id = c.id AND p.is_hidden = 0
        GROUP BY c.id, c.name
    ");
    $categoryCounts = [];
    foreach ($countStmt->fetchAll() as $row) {
        $categoryCounts[$row['name']] = (int)$row['total'];
    }

    $totalStmt = $pdo->query("
        SELECT COUNT(*) AS total FROM posts
        WHERE is_hidden = 0 AND created_at >= (NOW() - INTERVAL 7 DAY)
    ");
    $totalThisWeek = (int)$totalStmt->fetch()['total'];

    echo json_encode([
        'posts'           => $posts,
        'categoryCounts'  => $categoryCounts,
        'totalThisWeek'   => $totalThisWeek,
    ]);
    exit;
}

/* ---------------------------------------------------------
   POST — gumawa ng bagong post
   --------------------------------------------------------- */
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $userId   = $input['user_id'] ?? null;
    $category = $input['category'] ?? null;
    $content  = trim($input['content'] ?? '');

    if (!$userId || !$category || $content === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Kulang ang impormasyon ng post.']);
        exit;
    }

    // Hanapin ang category_id base sa pangalan
    $catStmt = $pdo->prepare('SELECT id FROM categories WHERE name = ?');
    $catStmt->execute([$category]);
    $cat = $catStmt->fetch();

    if (!$cat) {
        http_response_code(400);
        echo json_encode(['error' => 'Hindi valid na kategorya.']);
        exit;
    }

    $insert = $pdo->prepare(
        'INSERT INTO posts (user_id, category_id, content) VALUES (?, ?, ?)'
    );
    $insert->execute([$userId, $cat['id'], $content]);

    echo json_encode([
        'success' => true,
        'id'      => $pdo->lastInsertId(),
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);
