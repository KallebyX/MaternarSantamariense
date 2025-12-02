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
define('XP_PER_LEVEL', 100);
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
    if ($data === null) return '';
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

function formatDate($date, $withTime = false) {
    if (!$date) return '';
    $format = $withTime ? 'd/m/Y H:i' : 'd/m/Y';
    return date($format, strtotime($date));
}

function formatDateTime($date) {
    if (!$date) return '';
    return date('d/m/Y H:i', strtotime($date));
}

function timeAgo($datetime) {
    if (!$datetime) return '';
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
    // Level = sqrt(xp / 100) + 1
    // Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
    return max(1, floor(sqrt($xp / XP_PER_LEVEL)) + 1);
}

function xpForLevel($level) {
    // XP needed to reach this level
    return pow($level - 1, 2) * XP_PER_LEVEL;
}

function xpToNextLevel($currentXP) {
    $currentLevel = calculateLevel($currentXP);
    $nextLevelXP = xpForLevel($currentLevel + 1);
    return $nextLevelXP - $currentXP;
}

function xpProgress($currentXP) {
    $currentLevel = calculateLevel($currentXP);
    $currentLevelXP = xpForLevel($currentLevel);
    $nextLevelXP = xpForLevel($currentLevel + 1);
    $progress = $nextLevelXP - $currentLevelXP;
    if ($progress <= 0) return 100;
    return min(100, (($currentXP - $currentLevelXP) / $progress) * 100);
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
        redirect('login.php');
    }
}

function requireAdmin() {
    requireLogin();
    $user = currentUser();
    if ($user['role'] !== 'ADMIN') {
        setFlash('danger', 'Acesso negado. Você não tem permissão para acessar esta página.');
        redirect('dashboard.php');
    }
}

function currentUser() {
    if (!isLoggedIn()) return null;

    // Check if we have cached user data
    if (isset($_SESSION['user_data']) && $_SESSION['user_data']['id'] == $_SESSION['user_id']) {
        return $_SESSION['user_data'];
    }

    // Fetch fresh user data from database
    try {
        $db = Database::getInstance();
        $user = $db->queryOne(
            "SELECT id, email, username, first_name, last_name, role, department, position,
                    avatar, total_xp, level, weekly_xp, current_streak, longest_streak,
                    last_login, is_active, created_at
             FROM users WHERE id = :id AND is_active = true",
            ['id' => $_SESSION['user_id']]
        );

        if ($user) {
            // Add computed fields
            $user['name'] = $user['first_name'] . ' ' . $user['last_name'];
            $user['level'] = calculateLevel($user['total_xp']);

            // Cache in session
            $_SESSION['user_data'] = $user;
            return $user;
        }
    } catch (Exception $e) {
        // Fallback to session data
    }

    // Fallback
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'] ?? '',
        'name' => $_SESSION['user_name'] ?? 'Usuário',
        'first_name' => $_SESSION['user_name'] ?? 'Usuário',
        'last_name' => '',
        'role' => $_SESSION['user_role'] ?? 'EMPLOYEE',
        'avatar' => $_SESSION['user_avatar'] ?? null,
        'total_xp' => 0,
        'level' => 1,
        'weekly_xp' => 0,
        'current_streak' => 0,
        'department' => null,
        'position' => null
    ];
}

function refreshUserData() {
    unset($_SESSION['user_data']);
    return currentUser();
}

function getRoleLabel($role) {
    $roles = [
        'ADMIN' => 'Administrador',
        'MANAGER' => 'Gerente',
        'EMPLOYEE' => 'Colaborador'
    ];
    return $roles[$role] ?? $role;
}

function getStatusColor($status) {
    $colors = [
        'ACTIVE' => 'bg-green-100 text-green-800',
        'PENDING' => 'bg-yellow-100 text-yellow-800',
        'COMPLETED' => 'bg-blue-100 text-blue-800',
        'CANCELLED' => 'bg-red-100 text-red-800',
        'ON_HOLD' => 'bg-gray-100 text-gray-800'
    ];
    return $colors[$status] ?? 'bg-gray-100 text-gray-800';
}

function getPriorityColor($priority) {
    $colors = [
        'URGENT' => 'text-red-600',
        'HIGH' => 'text-orange-600',
        'MEDIUM' => 'text-yellow-600',
        'LOW' => 'text-green-600'
    ];
    return $colors[$priority] ?? 'text-gray-600';
}

function getDifficultyLabel($difficulty) {
    $labels = [
        'BEGINNER' => 'Iniciante',
        'INTERMEDIATE' => 'Intermediário',
        'ADVANCED' => 'Avançado'
    ];
    return $labels[$difficulty] ?? $difficulty;
}

function getDifficultyColor($difficulty) {
    $colors = [
        'BEGINNER' => 'bg-green-100 text-green-800',
        'INTERMEDIATE' => 'bg-yellow-100 text-yellow-800',
        'ADVANCED' => 'bg-red-100 text-red-800'
    ];
    return $colors[$difficulty] ?? 'bg-gray-100 text-gray-800';
}
