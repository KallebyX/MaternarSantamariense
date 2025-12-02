<?php
session_start();
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect(APP_URL . '/dashboard.php');
}

$error = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);

    $auth = new Auth();
    $result = $auth->login($email, $password, $remember);

    if ($result['success']) {
        setFlash('success', 'Bem-vindo de volta!');
        redirect(APP_URL . '/dashboard.php');
    } else {
        $error = $result['message'];
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?= APP_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        maternar: {
                            pink: '#e91e8c',
                            blue: '#1e88e5'
                        }
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="min-h-screen bg-gradient-to-br from-maternar-pink via-purple-600 to-maternar-blue flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Logo Card -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                <span class="text-3xl font-bold text-maternar-pink">M</span>
            </div>
            <h1 class="text-3xl font-bold text-white">Maternar Santamariense</h1>
            <p class="text-white/80 mt-2">Sistema de Gestão Hospitalar</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Entrar</h2>

            <?php if ($error): ?>
            <div class="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                <i data-lucide="alert-circle" class="w-5 h-5 mr-2"></i>
                <?= sanitize($error) ?>
            </div>
            <?php endif; ?>

            <?php $flash = getFlash(); if ($flash): ?>
            <div class="mb-6 p-4 rounded-lg <?= $flash['type'] === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' ?>">
                <?= sanitize($flash['message']) ?>
            </div>
            <?php endif; ?>

            <form method="POST" class="space-y-6">
                <input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i data-lucide="mail" class="w-5 h-5"></i>
                        </span>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value="<?= sanitize($email) ?>"
                            required
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent transition-colors"
                            placeholder="seu@email.com"
                        >
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i data-lucide="lock" class="w-5 h-5"></i>
                        </span>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent transition-colors"
                            placeholder="••••••••"
                        >
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <label class="flex items-center">
                        <input type="checkbox" name="remember" class="w-4 h-4 text-maternar-pink border-gray-300 rounded focus:ring-maternar-pink">
                        <span class="ml-2 text-sm text-gray-600">Lembrar-me</span>
                    </label>
                    <a href="forgot-password.php" class="text-sm text-maternar-pink hover:underline">Esqueceu a senha?</a>
                </div>

                <button
                    type="submit"
                    class="w-full py-3 px-4 bg-gradient-to-r from-maternar-pink to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:ring-4 focus:ring-maternar-pink/50"
                >
                    Entrar
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-gray-600">
                    Não tem uma conta?
                    <a href="register.php" class="text-maternar-pink font-semibold hover:underline">Cadastre-se</a>
                </p>
            </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-white/60 text-sm mt-8">
            © <?= date('Y') ?> <?= APP_NAME ?>. Todos os direitos reservados.
        </p>
    </div>

    <script>lucide.createIcons();</script>
</body>
</html>
