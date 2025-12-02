<?php
session_start();
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect(APP_URL . '/dashboard.php');
}

$error = '';
$formData = [
    'first_name' => '',
    'last_name' => '',
    'email' => '',
    'department' => '',
    'position' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $formData = [
        'first_name' => $_POST['first_name'] ?? '',
        'last_name' => $_POST['last_name'] ?? '',
        'email' => $_POST['email'] ?? '',
        'password' => $_POST['password'] ?? '',
        'password_confirm' => $_POST['password_confirm'] ?? '',
        'department' => $_POST['department'] ?? '',
        'position' => $_POST['position'] ?? ''
    ];

    // Validate passwords match
    if ($formData['password'] !== $formData['password_confirm']) {
        $error = 'As senhas não coincidem.';
    } else {
        $auth = new Auth();
        $result = $auth->register($formData);

        if ($result['success']) {
            setFlash('success', 'Conta criada com sucesso! Faça login para continuar.');
            redirect(APP_URL . '/login.php');
        } else {
            $error = $result['message'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro - <?= APP_NAME ?></title>
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="min-h-screen bg-gradient-to-br from-maternar-pink via-purple-600 to-maternar-blue flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
        <!-- Logo Card -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-3">
                <span class="text-2xl font-bold text-maternar-pink">M</span>
            </div>
            <h1 class="text-2xl font-bold text-white">Maternar Santamariense</h1>
        </div>

        <!-- Register Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Criar Conta</h2>

            <?php if ($error): ?>
            <div class="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                <i data-lucide="alert-circle" class="w-5 h-5 mr-2"></i>
                <?= sanitize($error) ?>
            </div>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value="<?= sanitize($formData['first_name']) ?>"
                            required
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                            placeholder="Seu nome"
                        >
                    </div>
                    <div>
                        <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value="<?= sanitize($formData['last_name']) ?>"
                            required
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                            placeholder="Seu sobrenome"
                        >
                    </div>
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value="<?= sanitize($formData['email']) ?>"
                        required
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                        placeholder="seu@email.com"
                    >
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="department" class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                        <select
                            id="department"
                            name="department"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                        >
                            <option value="">Selecione</option>
                            <option value="Enfermagem" <?= $formData['department'] === 'Enfermagem' ? 'selected' : '' ?>>Enfermagem</option>
                            <option value="Medicina" <?= $formData['department'] === 'Medicina' ? 'selected' : '' ?>>Medicina</option>
                            <option value="Administração" <?= $formData['department'] === 'Administração' ? 'selected' : '' ?>>Administração</option>
                            <option value="TI" <?= $formData['department'] === 'TI' ? 'selected' : '' ?>>TI</option>
                            <option value="Nutrição" <?= $formData['department'] === 'Nutrição' ? 'selected' : '' ?>>Nutrição</option>
                            <option value="Outro" <?= $formData['department'] === 'Outro' ? 'selected' : '' ?>>Outro</option>
                        </select>
                    </div>
                    <div>
                        <label for="position" class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value="<?= sanitize($formData['position']) ?>"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                            placeholder="Seu cargo"
                        >
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        minlength="6"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                    >
                </div>

                <div>
                    <label for="password_confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                    <input
                        type="password"
                        id="password_confirm"
                        name="password_confirm"
                        required
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-pink focus:border-transparent"
                        placeholder="Confirme sua senha"
                    >
                </div>

                <button
                    type="submit"
                    class="w-full py-3 px-4 bg-gradient-to-r from-maternar-pink to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:ring-4 focus:ring-maternar-pink/50"
                >
                    Criar Conta
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-gray-600">
                    Já tem uma conta?
                    <a href="login.php" class="text-maternar-pink font-semibold hover:underline">Entrar</a>
                </p>
            </div>
        </div>
    </div>

    <script>lucide.createIcons();</script>
</body>
</html>
