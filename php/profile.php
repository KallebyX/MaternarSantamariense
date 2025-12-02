<?php
$pageTitle = 'Perfil';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();
$userClass = new User();

// Handle profile update
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['update_profile'])) {
        $result = $userClass->updateProfile($_SESSION['user_id'], [
            'first_name' => trim($_POST['first_name'] ?? ''),
            'last_name' => trim($_POST['last_name'] ?? ''),
            'department' => trim($_POST['department'] ?? ''),
            'position' => trim($_POST['position'] ?? '')
        ]);

        if ($result['success']) {
            $message = $result['message'];
            // Refresh user data
            $currentUser = $userClass->getById($_SESSION['user_id']);
        } else {
            $error = $result['message'];
        }
    }

    if (isset($_POST['update_password'])) {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';

        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            $error = 'Preencha todos os campos de senha.';
        } elseif ($newPassword !== $confirmPassword) {
            $error = 'As senhas não coincidem.';
        } elseif (strlen($newPassword) < 6) {
            $error = 'A nova senha deve ter pelo menos 6 caracteres.';
        } else {
            $auth = new Auth();
            $result = $auth->updatePassword($_SESSION['user_id'], $currentPassword, $newPassword);

            if ($result['success']) {
                $message = $result['message'];
            } else {
                $error = $result['message'];
            }
        }
    }

    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $result = $userClass->uploadAvatar($_SESSION['user_id'], $_FILES['avatar']);

        if ($result['success']) {
            $message = $result['message'];
            $currentUser['avatar'] = $result['avatar'];
        } else {
            $error = $result['message'];
        }
    }
}

// Get user stats
$stats = $db->queryOne(
    "SELECT
        (SELECT COUNT(*) FROM enrollments WHERE user_id = :user_id) as enrolled_courses,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = :user_id2 AND status = 'COMPLETED') as completed_courses,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = :user_id3) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = :user_id4 AND status = 'DONE') as completed_tasks,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = :user_id5) as achievements
    ",
    [
        'user_id' => $_SESSION['user_id'],
        'user_id2' => $_SESSION['user_id'],
        'user_id3' => $_SESSION['user_id'],
        'user_id4' => $_SESSION['user_id'],
        'user_id5' => $_SESSION['user_id']
    ]
);

// Get recent activities
$activities = $userClass->getActivities($_SESSION['user_id'], 10);

// Level progress
$currentLevel = $currentUser['level'];
$nextLevelXP = pow($currentLevel, 2) * 100;
$currentLevelXP = pow($currentLevel - 1, 2) * 100;
$progressXP = $currentUser['total_xp'] - $currentLevelXP;
$neededXP = $nextLevelXP - $currentLevelXP;
$progressPercent = $neededXP > 0 ? min(100, round(($progressXP / $neededXP) * 100)) : 100;

$getRoleLabel = function($role) {
    switch ($role) {
        case 'ADMIN': return 'Administrador';
        case 'MANAGER': return 'Gerente';
        case 'EMPLOYEE': return 'Colaborador';
        default: return $role;
    }
};
?>

<div class="max-w-4xl mx-auto">
    <?php if ($message): ?>
    <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
        <?= sanitize($message) ?>
    </div>
    <?php endif; ?>

    <?php if ($error): ?>
    <div class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <?= sanitize($error) ?>
    </div>
    <?php endif; ?>

    <!-- Profile Header -->
    <div class="bg-gradient-to-r from-maternar-pink to-pink-400 rounded-xl shadow-lg p-6 text-white mb-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="relative">
                <?php if ($currentUser['avatar']): ?>
                <img src="<?= sanitize($currentUser['avatar']) ?>" alt="Avatar" class="w-28 h-28 rounded-full border-4 border-white/30 object-cover">
                <?php else: ?>
                <div class="w-28 h-28 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center">
                    <span class="text-4xl font-bold"><?= strtoupper(substr($currentUser['first_name'], 0, 1)) ?></span>
                </div>
                <?php endif; ?>
                <form method="POST" enctype="multipart/form-data" class="absolute bottom-0 right-0">
                    <label class="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                        <i data-lucide="camera" class="w-4 h-4 text-maternar-pink"></i>
                        <input type="file" name="avatar" accept="image/*" class="hidden" onchange="this.form.submit()">
                    </label>
                </form>
            </div>
            <div class="text-center md:text-left flex-grow">
                <h2 class="text-2xl font-bold"><?= sanitize($currentUser['first_name'] . ' ' . $currentUser['last_name']) ?></h2>
                <p class="opacity-80"><?= sanitize($currentUser['position'] ?? $getRoleLabel($currentUser['role'])) ?></p>
                <?php if ($currentUser['department']): ?>
                <p class="opacity-60 text-sm"><?= sanitize($currentUser['department']) ?></p>
                <?php endif; ?>
                <div class="flex items-center gap-4 mt-3 justify-center md:justify-start">
                    <span class="px-3 py-1 bg-white/20 rounded-full text-sm">
                        Nível <?= $currentLevel ?>
                    </span>
                    <span class="flex items-center">
                        <i data-lucide="zap" class="w-4 h-4 mr-1"></i>
                        <?= number_format($currentUser['total_xp']) ?> XP
                    </span>
                    <span class="flex items-center">
                        <i data-lucide="flame" class="w-4 h-4 mr-1"></i>
                        <?= $currentUser['current_streak'] ?> dias
                    </span>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <div class="flex justify-between text-sm mb-1 opacity-80">
                <span>Progresso para Nível <?= $currentLevel + 1 ?></span>
                <span><?= $progressPercent ?>%</span>
            </div>
            <div class="bg-white/20 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-white rounded-full" style="width: <?= $progressPercent ?>%"></div>
            </div>
        </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-maternar-pink"><?= $stats['enrolled_courses'] ?></p>
            <p class="text-sm text-gray-500">Cursos</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-green-600"><?= $stats['completed_courses'] ?></p>
            <p class="text-sm text-gray-500">Concluídos</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-blue-600"><?= $stats['total_tasks'] ?></p>
            <p class="text-sm text-gray-500">Tarefas</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-purple-600"><?= $stats['completed_tasks'] ?></p>
            <p class="text-sm text-gray-500">Completadas</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-yellow-600"><?= $stats['achievements'] ?></p>
            <p class="text-sm text-gray-500">Conquistas</p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Edit Profile -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i data-lucide="user" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                    Editar Perfil
                </h3>
            </div>
            <form method="POST" class="p-5">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value="<?= sanitize($currentUser['email']) ?>" disabled
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input type="text" name="first_name" value="<?= sanitize($currentUser['first_name']) ?>" required
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                            <input type="text" name="last_name" value="<?= sanitize($currentUser['last_name']) ?>" required
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                        <input type="text" name="department" value="<?= sanitize($currentUser['department'] ?? '') ?>"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                        <input type="text" name="position" value="<?= sanitize($currentUser['position'] ?? '') ?>"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                    </div>
                </div>
                <button type="submit" name="update_profile" class="mt-6 w-full px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                    Salvar Alterações
                </button>
            </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i data-lucide="lock" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                    Alterar Senha
                </h3>
            </div>
            <form method="POST" class="p-5">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                        <input type="password" name="current_password" required
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                        <input type="password" name="new_password" required minlength="6"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                        <input type="password" name="confirm_password" required minlength="6"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
                    </div>
                </div>
                <button type="submit" name="update_password" class="mt-6 w-full px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                    Alterar Senha
                </button>
            </form>
        </div>
    </div>

    <!-- Recent Activities -->
    <?php if (!empty($activities)): ?>
    <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-5 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800 flex items-center">
                <i data-lucide="activity" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                Atividades Recentes
            </h3>
        </div>
        <div class="divide-y divide-gray-100">
            <?php foreach ($activities as $activity): ?>
            <div class="p-4 flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-maternar-pink/10 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="<?= $activity['type'] === 'xp_gain' ? 'zap' : 'activity' ?>" class="w-5 h-5 text-maternar-pink"></i>
                </div>
                <div class="flex-grow">
                    <p class="text-gray-800"><?= sanitize($activity['description']) ?></p>
                    <p class="text-sm text-gray-500"><?= formatDate($activity['created_at'], true) ?></p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
