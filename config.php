<?php
/**
 * Configuration Settings for Akarshit Gupta Website
 * Centralized settings for Database, SMTP, API, and admin access.
 */

function loadEnvFile(string $filePath): void {
    if (!file_exists($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $value = trim($value, "\"'");

        $_ENV[$key] = $value;
        putenv($key . '=' . $value);
    }
}

function envValue(string $key, string $default = ''): string {
    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }

    $value = getenv($key);
    return $value === false ? $default : $value;
}

loadEnvFile(__DIR__ . '/.env');

// Database Configuration
define('DB_HOST', envValue('DB_HOST', 'localhost'));
define('DB_USER', envValue('DB_USER', 'root'));
define('DB_PASS', envValue('DB_PASS', ''));
define('DB_NAME', envValue('DB_NAME', 'contact_db'));

// SMTP Configuration
define('SMTP_HOST', envValue('SMTP_HOST', 'smtp.gmail.com'));
define('SMTP_USER', envValue('SMTP_USER'));
define('SMTP_PASS', envValue('SMTP_PASS'));
define('SMTP_PORT', (int) envValue('SMTP_PORT', '465'));
define('SMTP_SECURE', envValue('SMTP_SECURE', 'ssl'));

// Site Settings
define('SITE_NAME', envValue('SITE_NAME', 'Akarshit Gupta'));
define('ADMIN_EMAIL', envValue('ADMIN_EMAIL'));
define('ADMIN_PASSWORD', envValue('ADMIN_PASSWORD'));
define('GEMINI_API_KEY', envValue('GEMINI_API_KEY'));
define('GEMINI_ALLOWED_ORIGIN', envValue('GEMINI_ALLOWED_ORIGIN', ''));

/**
 * Get Database Connection
 * @return mysqli|false
 */
function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        return false;
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}
?>
