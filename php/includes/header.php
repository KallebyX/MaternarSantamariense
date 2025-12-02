<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$currentUser = currentUser();
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? $pageTitle . ' - ' : '' ?><?= APP_NAME ?></title>

    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#fdf4ff',
                            100: '#fae8ff',
                            200: '#f5d0fe',
                            300: '#f0abfc',
                            400: '#e879f9',
                            500: '#d946ef',
                            600: '#c026d3',
                            700: '#a21caf',
                            800: '#86198f',
                            900: '#701a75'
                        },
                        maternar: {
                            pink: '#e91e8c',
                            blue: '#1e88e5',
                            green: '#43a047'
                        }
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body { font-family: 'Inter', sans-serif; }
        .sidebar-link.active {
            background-color: rgb(233, 30, 140);
            color: white;
        }
        .sidebar-link:hover:not(.active) {
            background-color: rgba(233, 30, 140, 0.1);
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <?php if (isLoggedIn()): ?>
    <!-- Sidebar -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
        <div class="flex flex-col h-full">
            <!-- Logo -->
            <div class="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-maternar-pink to-primary-600">
                <a href="dashboard.php" class="flex items-center space-x-2">
                    <span class="text-2xl font-bold text-white">Maternar</span>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <a href="dashboard.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'dashboard' ? 'active' : '' ?>">
                    <i data-lucide="layout-dashboard" class="w-5 h-5 mr-3"></i>
                    Dashboard
                </a>
                <a href="training.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'training' ? 'active' : '' ?>">
                    <i data-lucide="book-open" class="w-5 h-5 mr-3"></i>
                    Treinamentos
                </a>
                <a href="projects.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'projects' ? 'active' : '' ?>">
                    <i data-lucide="folder-kanban" class="w-5 h-5 mr-3"></i>
                    Projetos
                </a>
                <a href="calendar.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'calendar' ? 'active' : '' ?>">
                    <i data-lucide="calendar" class="w-5 h-5 mr-3"></i>
                    Calendário
                </a>
                <a href="chat.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'chat' ? 'active' : '' ?>">
                    <i data-lucide="message-square" class="w-5 h-5 mr-3"></i>
                    Chat
                </a>
                <a href="gamification.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'gamification' ? 'active' : '' ?>">
                    <i data-lucide="trophy" class="w-5 h-5 mr-3"></i>
                    Gamificação
                </a>

                <?php if ($currentUser['role'] === 'ADMIN'): ?>
                <div class="pt-4 mt-4 border-t border-gray-200">
                    <p class="px-4 text-xs font-semibold text-gray-400 uppercase">Admin</p>
                    <a href="users.php" class="sidebar-link flex items-center px-4 py-3 mt-2 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'users' ? 'active' : '' ?>">
                        <i data-lucide="users" class="w-5 h-5 mr-3"></i>
                        Usuários
                    </a>
                    <a href="settings.php" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors <?= $currentPage === 'settings' ? 'active' : '' ?>">
                        <i data-lucide="settings" class="w-5 h-5 mr-3"></i>
                        Configurações
                    </a>
                </div>
                <?php endif; ?>
            </nav>

            <!-- User Info -->
            <div class="p-4 border-t border-gray-200">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        <?php if ($currentUser['avatar']): ?>
                            <img src="<?= $currentUser['avatar'] ?>" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
                        <?php else: ?>
                            <div class="w-10 h-10 bg-maternar-pink rounded-full flex items-center justify-center text-white font-semibold">
                                <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate"><?= sanitize($currentUser['name']) ?></p>
                        <p class="text-xs text-gray-500 truncate"><?= sanitize($currentUser['email']) ?></p>
                    </div>
                    <a href="logout.php" class="text-gray-400 hover:text-red-500 transition-colors" title="Sair">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                    </a>
                </div>
            </div>
        </div>
    </aside>

    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
        <button id="menu-toggle" class="p-2 bg-white rounded-lg shadow-lg">
            <i data-lucide="menu" class="w-6 h-6 text-gray-700"></i>
        </button>
    </div>

    <!-- Overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden lg:hidden"></div>

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
        <!-- Top bar -->
        <header class="sticky top-0 z-30 bg-white shadow-sm">
            <div class="flex items-center justify-between px-6 py-4">
                <h1 class="text-xl font-semibold text-gray-800"><?= $pageTitle ?? 'Dashboard' ?></h1>
                <div class="flex items-center space-x-4">
                    <!-- Notifications -->
                    <button class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <i data-lucide="bell" class="w-5 h-5"></i>
                        <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <!-- Profile -->
                    <a href="profile.php" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <span class="hidden sm:block text-sm font-medium"><?= sanitize($currentUser['name']) ?></span>
                        <?php if ($currentUser['avatar']): ?>
                            <img src="<?= $currentUser['avatar'] ?>" alt="Avatar" class="w-8 h-8 rounded-full object-cover">
                        <?php else: ?>
                            <div class="w-8 h-8 bg-maternar-pink rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
                            </div>
                        <?php endif; ?>
                    </a>
                </div>
            </div>
        </header>

        <!-- Flash Messages -->
        <?php $flash = getFlash(); ?>
        <?php if ($flash): ?>
        <div class="px-6 pt-4">
            <div class="p-4 rounded-lg <?= $flash['type'] === 'success' ? 'bg-green-100 text-green-800' : ($flash['type'] === 'danger' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800') ?>">
                <?= sanitize($flash['message']) ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- Page Content -->
        <div class="p-6">
    <?php endif; ?>
