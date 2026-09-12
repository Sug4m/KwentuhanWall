<?php
/* =========================================================
   auth.php
   =========================================================
   Tinatanggap nito ang Google "credential" (ID token) na
   ipinapadala ng script.js pagkatapos mag-log in/sign up.

   Ginagawa nito:
   1. Ipinapadala yung token sa Google mismo para i-verify
      (hindi lang basta dine-decode — kailangan ito para
      hindi kayang peke-in ng ibang tao ang login).
   2. Kung valid, hahanapin sa database kung meron nang user
      na may kaparehong google_id.
        - Kung meron na: ibabalik yung existing na alias niya.
        - Kung wala pa: gagawa ng bagong row (bagong alias).
   3. Ibabalik lang bilang JSON ang: id, alias, avatar
      (HINDI ang email — pribado ito, panatilihin sa database lang).
   ========================================================= */

header('Content-Type: application/json');
require_once 'db_connect.php';

// 1. Kunin ang credential na ipinadala ng frontend (JSON body)
$input = json_decode(file_get_contents('php://input'), true);
$credential = $input['credential'] ?? null;

if (!$credential) {
    http_response_code(400);
    echo json_encode(['error' => 'Walang credential na natanggap.']);
    exit;
}

// 2. I-verify ang token direkta sa Google
$verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
$response = @file_get_contents($verifyUrl);

if ($response === false) {
    http_response_code(401);
    echo json_encode(['error' => 'Hindi ma-verify ang Google login. Subukan ulit.']);
    exit;
}

$googleData = json_decode($response, true);

if (!isset($googleData['sub']) || !isset($googleData['email'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid o expired na Google token.']);
    exit;
}

$googleId = $googleData['sub'];
$email    = $googleData['email'];

// 3. Hanapin kung meron nang user na may ganitong google_id
$stmt = $pdo->prepare('SELECT id, alias, avatar FROM users WHERE google_id = ?');
$stmt->execute([$googleId]);
$user = $stmt->fetch();

if ($user) {
    // Existing na user — ibalik lang yung info niya
    echo json_encode([
        'id'     => $user['id'],
        'alias'  => $user['alias'],
        'avatar' => $user['avatar'],
        'isNew'  => false,
    ]);
    exit;
}

// 4. Bagong user — gumawa ng bagong random na alias
function generateAlias(PDO $pdo): string {
    do {
        $alias = 'Anonymous #' . random_int(1000, 9999);
        $check = $pdo->prepare('SELECT id FROM users WHERE alias = ?');
        $check->execute([$alias]);
    } while ($check->fetch()); // ulitin kung sakaling nagkataon magkapareho
    return $alias;
}

$alias  = generateAlias($pdo);
$avatar = 'default-avatar.png';

$insert = $pdo->prepare(
    'INSERT INTO users (google_id, email, alias, avatar) VALUES (?, ?, ?, ?)'
);
$insert->execute([$googleId, $email, $alias, $avatar]);

echo json_encode([
    'id'     => $pdo->lastInsertId(),
    'alias'  => $alias,
    'avatar' => $avatar,
    'isNew'  => true,
]);
