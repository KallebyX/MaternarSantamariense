<?php
/**
 * Maternar Santamariense - Configuração Principal
 */

// Definições do ambiente
define('APP_NAME', 'Maternar Santamariense');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost:8080');
define('APP_ENV', 'development'); // development | production

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Session
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
if (APP_ENV === 'production') {
    ini_set('session.cookie_secure', 1);
}

// Error reporting
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Paths
define('ROOT_PATH', dirname(__DIR__));
define('INCLUDES_PATH', ROOT_PATH . '/includes');
define('CLASSES_PATH', ROOT_PATH . '/classes');
define('PAGES_PATH', ROOT_PATH . '/pages');
define('UPLOADS_PATH', ROOT_PATH . '/uploads');
define('ASSETS_PATH', ROOT_PATH . '/assets');

// Upload settings
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_DOC_TYPES', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// Gamification settings
define('XP_PER_LEVEL', 1000);
define('XP_COURSE_COMPLETION', 100);
define('XP_LESSON_COMPLETION', 20);
define('XP_LOGIN_STREAK', 10);
define('XP_PROJECT_TASK', 15);

// Security
define('CSRF_TOKEN_NAME', 'csrf_token');
define('PASSWORD_MIN_LENGTH', 6);

// Autoload classes
spl_autoload_register(function ($class) {
    $file = CLASSES_PATH . '/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Helper functions
function redirect($url) {
    header("Location: $url");
    exit;
}

function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function generateCSRFToken() {
    if (empty($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

function validateCSRFToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

function formatDate($date, $format = 'd/m/Y') {
    return date($format, strtotime($date));
}

function formatDateTime($date) {
    return date('d/m/Y H:i', strtotime($date));
}

function timeAgo($datetime) {
    $time = strtotime($datetime);
    $now = time();
    $diff = $now - $time;

    if ($diff < 60) return 'agora';
    if ($diff < 3600) return floor($diff / 60) . ' min atrás';
    if ($diff < 86400) return floor($diff / 3600) . 'h atrás';
    if ($diff < 604800) return floor($diff / 86400) . 'd atrás';
    return formatDate($datetime);
}

function calculateLevel($xp) {
    return floor($xp / XP_PER_LEVEL) + 1;
}

function xpToNextLevel($xp) {
    $currentLevel = calculateLevel($xp);
    return ($currentLevel * XP_PER_LEVEL) - $xp;
}

function xpProgress($xp) {
    $currentLevelXP = ($xp % XP_PER_LEVEL);
    return ($currentLevelXP / XP_PER_LEVEL) * 100;
}

// Flash messages
function setFlash($type, $message) {
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function getFlash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        setFlash('warning', 'Você precisa estar logado para acessar esta página.');
        redirect(APP_URL . '/login.php');
    }
}

function requireAdmin() {
    requireLogin();
    if ($_SESSION['user_role'] !== 'ADMIN') {
        setFlash('danger', 'Acesso negado. Você não tem permissão para acessar esta página.');
        redirect(APP_URL . '/dashboard.php');
    }
}

function currentUser() {
    if (!isLoggedIn()) return null;
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'],
        'name' => $_SESSION['user_name'],
        'role' => $_SESSION['user_role'],
        'avatar' => $_SESSION['user_avatar'] ?? null
    ];
}
