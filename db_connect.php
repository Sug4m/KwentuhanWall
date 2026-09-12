<?php
/* =========================================================
   db_connect.php
   =========================================================
   Ito yung gagamitin ng LAHAT ng ibang PHP files para
   kumonekta sa MySQL database. I-require lang ito sa taas
   ng ibang .php file, hal:

     require_once 'db_connect.php';

   PAALALA: Baguhin ang mga value sa ibaba kung iba ang
   setup ng XAMPP MySQL mo (bihira lang, default na ito
   sa halos lahat ng fresh XAMPP install).
   ========================================================= */

$DB_HOST = "localhost";
$DB_NAME = "kwentuhanwall";
$DB_USER = "root";
$DB_PASS = "";      // default: walang password ang root sa XAMPP

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        "error" => "Hindi makakonekta sa database. Siguraduhing tumatakbo ang MySQL sa XAMPP."
    ]));
}
