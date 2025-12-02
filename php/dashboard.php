<?php
$pageTitle = 'Dashboard';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();
$user = new User();

// Get current user full data
$currentUserData = $user->getById($_SESSION['user_id']);

// Get stats
$totalCourses = $db->count('courses', 'is_active = true');
$enrolledCourses = $db->count('enrollments', 'user_id = :user_id', ['user_id' => $_SESSION['user_id']]);
$completedCourses = $db->count('enrollments', 'user_id = :user_id AND completed_at IS NOT NULL', ['user_id' => $_SESSION['user_id']]);
$totalProjects = $db->count('project_members', 'user_id = :user_id', ['user_id' => $_SESSION['user_id']]);
$pendingTasks = $db->count('tasks', 'assigned_to = :user_id AND status != :status', ['user_id' => $_SESSION['user_id'], 'status' => 'DONE']);

// Get recent activities
$activities = $db->query(
    "SELECT * FROM activity_logs WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 5",
    ['user_id' => $_SESSION['user_id']]
);

// Get upcoming events
$upcomingEvents = $db->query(
    "SELECT e.*, u.first_name, u.last_name
     FROM events e
     LEFT JOIN users u ON e.organizer_id = u.id
     WHERE e.start_date >= NOW()
     ORDER BY e.start_date ASC
     LIMIT 5"
);

// Get leaderboard
$leaderboard = $user->getLeaderboard(5);

// Calculate level progress
$xpProgress = xpProgress($currentUserData['total_xp'] ?? 0);
$xpToNext = xpToNextLevel($currentUserData['total_xp'] ?? 0);
?>

<!-- Welcome Section -->
<div class="mb-8">
    <div class="bg-gradient-to-r from-maternar-pink to-purple-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold mb-2">Olá, <?= sanitize($currentUserData['first_name']) ?>!</h2>
                <p class="text-white/80">Bem-vindo ao Maternar Santamariense</p>
            </div>
            <div class="hidden md:block text-right">
                <p class="text-sm text-white/80">Nível <?= $currentUserData['level'] ?? 1 ?></p>
                <p class="text-2xl font-bold"><?= number_format($currentUserData['total_xp'] ?? 0) ?> XP</p>
            </div>
        </div>

        <!-- XP Progress Bar -->
        <div class="mt-4">
            <div class="flex justify-between text-sm text-white/80 mb-1">
                <span>Progresso para o próximo nível</span>
                <span><?= number_format($xpToNext) ?> XP restantes</span>
            </div>
            <div class="h-3 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-white rounded-full transition-all duration-500" style="width: <?= $xpProgress ?>%"></div>
            </div>
        </div>
    </div>
</div>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Courses -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Cursos Disponíveis</p>
                <p class="text-3xl font-bold text-gray-800 mt-1"><?= $totalCourses ?></p>
                <p class="text-sm text-maternar-pink mt-2"><?= $enrolledCourses ?> inscritos</p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <i data-lucide="book-open" class="w-7 h-7 text-maternar-blue"></i>
            </div>
        </div>
    </div>

    <!-- Projects -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Meus Projetos</p>
                <p class="text-3xl font-bold text-gray-800 mt-1"><?= $totalProjects ?></p>
                <p class="text-sm text-purple-600 mt-2">Participando</p>
            </div>
            <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <i data-lucide="folder-kanban" class="w-7 h-7 text-purple-600"></i>
            </div>
        </div>
    </div>

    <!-- Tasks -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Tarefas Pendentes</p>
                <p class="text-3xl font-bold text-gray-800 mt-1"><?= $pendingTasks ?></p>
                <p class="text-sm text-orange-600 mt-2">A fazer</p>
            </div>
            <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <i data-lucide="check-square" class="w-7 h-7 text-orange-600"></i>
            </div>
        </div>
    </div>

    <!-- Streak -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Sequência</p>
                <p class="text-3xl font-bold text-gray-800 mt-1"><?= $currentUserData['current_streak'] ?? 0 ?></p>
                <p class="text-sm text-maternar-green mt-2">dias consecutivos</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <i data-lucide="flame" class="w-7 h-7 text-maternar-green"></i>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Quick Actions -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <i data-lucide="zap" class="w-5 h-5 mr-2 text-maternar-pink"></i>
            Ações Rápidas
        </h3>
        <div class="space-y-3">
            <a href="training.php" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-maternar-pink/10 transition-colors group">
                <i data-lucide="book-open" class="w-5 h-5 text-gray-500 group-hover:text-maternar-pink mr-3"></i>
                <span class="text-gray-700 group-hover:text-maternar-pink">Ver Cursos</span>
            </a>
            <a href="projects.php" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-maternar-pink/10 transition-colors group">
                <i data-lucide="folder-kanban" class="w-5 h-5 text-gray-500 group-hover:text-maternar-pink mr-3"></i>
                <span class="text-gray-700 group-hover:text-maternar-pink">Meus Projetos</span>
            </a>
            <a href="calendar.php" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-maternar-pink/10 transition-colors group">
                <i data-lucide="calendar" class="w-5 h-5 text-gray-500 group-hover:text-maternar-pink mr-3"></i>
                <span class="text-gray-700 group-hover:text-maternar-pink">Calendário</span>
            </a>
            <a href="chat.php" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-maternar-pink/10 transition-colors group">
                <i data-lucide="message-square" class="w-5 h-5 text-gray-500 group-hover:text-maternar-pink mr-3"></i>
                <span class="text-gray-700 group-hover:text-maternar-pink">Chat</span>
            </a>
        </div>
    </div>

    <!-- Upcoming Events -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <i data-lucide="calendar" class="w-5 h-5 mr-2 text-maternar-pink"></i>
            Próximos Eventos
        </h3>
        <?php if (empty($upcomingEvents)): ?>
        <p class="text-gray-500 text-center py-4">Nenhum evento agendado</p>
        <?php else: ?>
        <div class="space-y-3">
            <?php foreach ($upcomingEvents as $event): ?>
            <div class="flex items-start p-3 bg-gray-50 rounded-lg">
                <div class="w-10 h-10 bg-maternar-pink/10 rounded-lg flex items-center justify-center mr-3 shrink-0">
                    <i data-lucide="calendar" class="w-5 h-5 text-maternar-pink"></i>
                </div>
                <div class="min-w-0">
                    <p class="font-medium text-gray-800 truncate"><?= sanitize($event['title']) ?></p>
                    <p class="text-sm text-gray-500"><?= formatDateTime($event['start_date']) ?></p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <a href="calendar.php" class="mt-4 block text-center text-maternar-pink hover:underline text-sm">Ver todos</a>
    </div>

    <!-- Leaderboard -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <i data-lucide="trophy" class="w-5 h-5 mr-2 text-yellow-500"></i>
            Ranking
        </h3>
        <?php if (empty($leaderboard)): ?>
        <p class="text-gray-500 text-center py-4">Nenhum usuário no ranking</p>
        <?php else: ?>
        <div class="space-y-3">
            <?php foreach ($leaderboard as $index => $leader): ?>
            <div class="flex items-center p-2 <?= $leader['id'] == $_SESSION['user_id'] ? 'bg-maternar-pink/10 rounded-lg' : '' ?>">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3
                    <?= $index === 0 ? 'bg-yellow-400 text-white' : ($index === 1 ? 'bg-gray-300 text-gray-700' : ($index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600')) ?>">
                    <?= $index + 1 ?>
                </div>
                <?php if ($leader['avatar']): ?>
                <img src="<?= $leader['avatar'] ?>" alt="" class="w-8 h-8 rounded-full object-cover mr-3">
                <?php else: ?>
                <div class="w-8 h-8 bg-maternar-pink rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                    <?= strtoupper(substr($leader['first_name'], 0, 1)) ?>
                </div>
                <?php endif; ?>
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 truncate <?= $leader['id'] == $_SESSION['user_id'] ? 'text-maternar-pink' : '' ?>">
                        <?= sanitize($leader['first_name'] . ' ' . $leader['last_name']) ?>
                        <?= $leader['id'] == $_SESSION['user_id'] ? '<span class="text-xs">(você)</span>' : '' ?>
                    </p>
                    <p class="text-xs text-gray-500">Nível <?= $leader['level'] ?></p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-800"><?= number_format($leader['total_xp']) ?></p>
                    <p class="text-xs text-gray-500">XP</p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <a href="gamification.php" class="mt-4 block text-center text-maternar-pink hover:underline text-sm">Ver ranking completo</a>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
