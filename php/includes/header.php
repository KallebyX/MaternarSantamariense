<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$currentUser = currentUser();
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

// Get notification count
$notificationCount = 0;
if (isLoggedIn()) {
    try {
        $db = Database::getInstance();
        $result = $db->queryOne(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = :user_id AND read_at IS NULL",
            ['user_id' => $_SESSION['user_id']]
        );
        $notificationCount = (int)($result['count'] ?? 0);
    } catch (Exception $e) {}
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? sanitize($pageTitle) . ' - ' : '' ?><?= APP_NAME ?></title>

    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#fdf2f8',
                            100: '#fce7f3',
                            200: '#fbcfe8',
                            300: '#f9a8d4',
                            400: '#f472b6',
                            500: '#ec4899',
                            600: '#db2777',
                            700: '#be185d',
                            800: '#9d174d',
                            900: '#831843'
                        },
                        maternar: {
                            pink: '#e91e8c',
                            'pink-dark': '#c4177a',
                            'pink-light': '#f54da6',
                            blue: '#1e88e5',
                            green: '#43a047',
                            purple: '#7c3aed'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif']
                    }
                }
            }
        }
    </script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        body { font-family: 'Inter', system-ui, sans-serif; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Sidebar styles */
        .sidebar-link {
            transition: all 0.2s ease;
        }
        .sidebar-link.active {
            background: linear-gradient(135deg, #e91e8c 0%, #c4177a 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(233, 30, 140, 0.3);
        }
        .sidebar-link:hover:not(.active) {
            background-color: rgba(233, 30, 140, 0.08);
            color: #e91e8c;
        }
        .sidebar-link.active i {
            color: white;
        }

        /* Card hover effects */
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        /* Gradient text */
        .gradient-text {
            background: linear-gradient(135deg, #e91e8c 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Progress bar animation */
        .progress-bar {
            transition: width 0.5s ease-out;
        }

        /* Notification badge pulse */
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .notification-badge {
            animation: pulse 2s infinite;
        }

        /* Mobile sidebar */
        .sidebar-open {
            transform: translateX(0) !important;
        }

        /* Line clamp */
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen antialiased">
    <?php if (isLoggedIn()): ?>
    <!-- Sidebar -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
        <div class="flex flex-col h-full">
            <!-- Logo -->
            <div class="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-maternar-pink to-maternar-purple">
                <a href="dashboard.php" class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <i data-lucide="heart" class="w-5 h-5 text-white"></i>
                    </div>
                    <span class="text-xl font-bold text-white">Maternar</span>
                </a>
            </div>

            <!-- User Quick Info -->
            <div class="px-4 py-4 bg-gradient-to-r from-maternar-pink/5 to-maternar-purple/5 border-b border-gray-100">
                <div class="flex items-center space-x-3">
                    <?php if ($currentUser['avatar']): ?>
                        <img src="<?= sanitize($currentUser['avatar']) ?>" alt="Avatar" class="w-10 h-10 rounded-full object-cover ring-2 ring-maternar-pink/20">
                    <?php else: ?>
                        <div class="w-10 h-10 bg-gradient-to-br from-maternar-pink to-maternar-purple rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                            <?= strtoupper(substr($currentUser['first_name'] ?? $currentUser['name'], 0, 1)) ?>
                        </div>
                    <?php endif; ?>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate"><?= sanitize($currentUser['name'] ?? $currentUser['first_name']) ?></p>
                        <div class="flex items-center text-xs text-gray-500">
                            <i data-lucide="zap" class="w-3 h-3 mr-1 text-yellow-500"></i>
                            <span>Nível <?= $currentUser['level'] ?? 1 ?></span>
                            <span class="mx-1">•</span>
                            <span><?= number_format($currentUser['total_xp'] ?? 0) ?> XP</span>
                        </div>
                    </div>
                </div>
                <!-- XP Progress -->
                <div class="mt-3">
                    <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-maternar-pink to-maternar-purple rounded-full progress-bar" style="width: <?= xpProgress($currentUser['total_xp'] ?? 0) ?>%"></div>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <a href="dashboard.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= $currentPage === 'dashboard' ? 'active' : '' ?>">
                    <i data-lucide="layout-dashboard" class="w-5 h-5 mr-3 text-gray-400"></i>
                    <span class="font-medium">Dashboard</span>
                </a>
                <a href="training.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= in_array($currentPage, ['training', 'course']) ? 'active' : '' ?>">
                    <i data-lucide="graduation-cap" class="w-5 h-5 mr-3 text-gray-400"></i>
                    <span class="font-medium">Treinamentos</span>
                </a>
                <a href="projects.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= in_array($currentPage, ['projects', 'project']) ? 'active' : '' ?>">
                    <i data-lucide="folder-kanban" class="w-5 h-5 mr-3 text-gray-400"></i>
                    <span class="font-medium">Projetos</span>
                </a>
                <a href="calendar.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= $currentPage === 'calendar' ? 'active' : '' ?>">
                    <i data-lucide="calendar-days" class="w-5 h-5 mr-3 text-gray-400"></i>
                    <span class="font-medium">Calendário</span>
                </a>
                <a href="chat.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= $currentPage === 'chat' ? 'active' : '' ?>">
                    <i data-lucide="message-circle" class="w-5 h-5 mr-3 text-gray-400"></i>
                    <span class="font-medium">Chat</span>
                </a>
                <a href="gamification.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= $currentPage === 'gamification' ? 'active' : '' ?>">
                    <i data-lucide="trophy" class="w-5 h-5 mr-3 text-gray-400"></i>
                    <span class="font-medium">Gamificação</span>
                </a>

                <?php if (($currentUser['role'] ?? '') === 'ADMIN'): ?>
                <div class="pt-4 mt-4 border-t border-gray-200">
                    <p class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administração</p>
                    <a href="users.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= $currentPage === 'users' ? 'active' : '' ?>">
                        <i data-lucide="users-round" class="w-5 h-5 mr-3 text-gray-400"></i>
                        <span class="font-medium">Usuários</span>
                    </a>
                    <a href="settings.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-xl <?= $currentPage === 'settings' ? 'active' : '' ?>">
                        <i data-lucide="settings" class="w-5 h-5 mr-3 text-gray-400"></i>
                        <span class="font-medium">Configurações</span>
                    </a>
                </div>
                <?php endif; ?>
            </nav>

            <!-- Logout -->
            <div class="p-3 border-t border-gray-100">
                <a href="logout.php" class="flex items-center px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <i data-lucide="log-out" class="w-5 h-5 mr-3"></i>
                    <span class="font-medium">Sair</span>
                </a>
            </div>
        </div>
    </aside>

    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
        <button id="menu-toggle" class="p-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <i data-lucide="menu" class="w-6 h-6 text-gray-700"></i>
        </button>
    </div>

    <!-- Overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden lg:hidden transition-opacity"></div>

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
        <!-- Top bar -->
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div class="flex items-center justify-between px-6 py-4">
                <div class="flex items-center space-x-4">
                    <div class="hidden lg:block">
                        <h1 class="text-xl font-bold text-gray-800"><?= sanitize($pageTitle ?? 'Dashboard') ?></h1>
                        <p class="text-sm text-gray-500">Bem-vindo(a) de volta, <?= sanitize($currentUser['first_name'] ?? 'Usuário') ?>!</p>
                    </div>
                    <div class="lg:hidden">
                        <h1 class="text-lg font-bold text-gray-800 ml-12"><?= sanitize($pageTitle ?? 'Dashboard') ?></h1>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <!-- Search (desktop) -->
                    <div class="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2">
                        <i data-lucide="search" class="w-4 h-4 text-gray-400 mr-2"></i>
                        <input type="text" placeholder="Buscar..." class="bg-transparent border-none outline-none text-sm w-40 lg:w-60">
                    </div>

                    <!-- Notifications -->
                    <button class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                        <i data-lucide="bell" class="w-5 h-5"></i>
                        <?php if ($notificationCount > 0): ?>
                        <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center notification-badge">
                            <?= $notificationCount > 9 ? '9+' : $notificationCount ?>
                        </span>
                        <?php endif; ?>
                    </button>

                    <!-- Profile -->
                    <a href="profile.php" class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <?php if ($currentUser['avatar']): ?>
                            <img src="<?= sanitize($currentUser['avatar']) ?>" alt="Avatar" class="w-8 h-8 rounded-full object-cover">
                        <?php else: ?>
                            <div class="w-8 h-8 bg-gradient-to-br from-maternar-pink to-maternar-purple rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                <?= strtoupper(substr($currentUser['first_name'] ?? $currentUser['name'], 0, 1)) ?>
                            </div>
                        <?php endif; ?>
                        <div class="hidden sm:block text-left">
                            <p class="text-sm font-medium text-gray-700"><?= sanitize($currentUser['name'] ?? $currentUser['first_name']) ?></p>
                            <p class="text-xs text-gray-500"><?= getRoleLabel($currentUser['role'] ?? 'EMPLOYEE') ?></p>
                        </div>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 hidden sm:block"></i>
                    </a>
                </div>
            </div>
        </header>

        <!-- Flash Messages -->
        <?php $flash = getFlash(); ?>
        <?php if ($flash): ?>
        <div class="px-6 pt-4">
            <div class="p-4 rounded-xl flex items-center <?= $flash['type'] === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : ($flash['type'] === 'danger' || $flash['type'] === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200') ?>">
                <i data-lucide="<?= $flash['type'] === 'success' ? 'check-circle' : ($flash['type'] === 'danger' || $flash['type'] === 'error' ? 'x-circle' : 'alert-circle') ?>" class="w-5 h-5 mr-3 flex-shrink-0"></i>
                <span class="font-medium"><?= sanitize($flash['message']) ?></span>
                <button onclick="this.parentElement.remove()" class="ml-auto p-1 hover:bg-black/5 rounded-lg">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        <?php endif; ?>

        <!-- Page Content -->
        <div class="p-6">
    <?php endif; ?>
