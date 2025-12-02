<?php
$pageTitle = 'Gamificação';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();
$userClass = new User();

// Get leaderboards
$weeklyLeaderboard = $userClass->getWeeklyLeaderboard(10);
$allTimeLeaderboard = $userClass->getLeaderboard(10);

// Get current user stats
$userStats = $db->queryOne(
    "SELECT
        (SELECT COUNT(*) FROM enrollments WHERE user_id = :user_id AND status = 'COMPLETED') as courses_completed,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = :user_id2 AND status = 'DONE') as tasks_completed,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = :user_id3) as achievements_earned
    ",
    [
        'user_id' => $_SESSION['user_id'],
        'user_id2' => $_SESSION['user_id'],
        'user_id3' => $_SESSION['user_id']
    ]
);

// Get all achievements
$achievements = $db->query(
    "SELECT a.*,
            CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as earned,
            ua.earned_at
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = :user_id
     ORDER BY a.xp_reward DESC",
    ['user_id' => $_SESSION['user_id']]
);

// Get user achievements (earned)
$earnedAchievements = array_filter($achievements, fn($a) => $a['earned']);
$pendingAchievements = array_filter($achievements, fn($a) => !$a['earned']);

// Get user rank
$userRank = $db->queryOne(
    "SELECT COUNT(*) + 1 as rank
     FROM users
     WHERE total_xp > (SELECT total_xp FROM users WHERE id = :user_id)",
    ['user_id' => $_SESSION['user_id']]
);

// Level info
$currentLevel = $currentUser['level'];
$nextLevelXP = pow($currentLevel, 2) * 100;
$currentLevelXP = pow($currentLevel - 1, 2) * 100;
$progressXP = $currentUser['total_xp'] - $currentLevelXP;
$neededXP = $nextLevelXP - $currentLevelXP;
$progressPercent = $neededXP > 0 ? min(100, round(($progressXP / $neededXP) * 100)) : 100;

// Badge colors
$getBadgeColor = function($category) {
    switch ($category) {
        case 'LEARNING': return 'from-blue-500 to-blue-600';
        case 'COLLABORATION': return 'from-green-500 to-green-600';
        case 'LEADERSHIP': return 'from-purple-500 to-purple-600';
        case 'INNOVATION': return 'from-orange-500 to-orange-600';
        case 'STREAK': return 'from-red-500 to-red-600';
        default: return 'from-gray-500 to-gray-600';
    }
};

$getCategoryLabel = function($category) {
    switch ($category) {
        case 'LEARNING': return 'Aprendizado';
        case 'COLLABORATION': return 'Colaboração';
        case 'LEADERSHIP': return 'Liderança';
        case 'INNOVATION': return 'Inovação';
        case 'STREAK': return 'Sequência';
        default: return $category;
    }
};
?>

<div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-800">Gamificação</h2>
    <p class="text-gray-500 mt-1">Acompanhe seu progresso e conquistas</p>
</div>

<!-- User Stats Card -->
<div class="bg-gradient-to-r from-maternar-pink to-pink-400 rounded-xl shadow-lg p-6 text-white mb-8">
    <div class="flex flex-col md:flex-row md:items-center gap-6">
        <div class="flex-shrink-0">
            <?php if ($currentUser['avatar']): ?>
            <img src="<?= sanitize($currentUser['avatar']) ?>" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-white/30">
            <?php else: ?>
            <div class="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center">
                <span class="text-3xl font-bold"><?= strtoupper(substr($currentUser['first_name'], 0, 1)) ?></span>
            </div>
            <?php endif; ?>
        </div>
        <div class="flex-grow">
            <div class="flex items-center gap-3 mb-2">
                <h3 class="text-2xl font-bold"><?= sanitize($currentUser['first_name'] . ' ' . $currentUser['last_name']) ?></h3>
                <span class="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    Nível <?= $currentLevel ?>
                </span>
            </div>
            <div class="flex items-center gap-2 mb-3">
                <i data-lucide="trophy" class="w-5 h-5"></i>
                <span class="font-medium">Ranking #<?= $userRank['rank'] ?></span>
                <span class="mx-2">•</span>
                <i data-lucide="zap" class="w-5 h-5"></i>
                <span class="font-medium"><?= number_format($currentUser['total_xp']) ?> XP Total</span>
            </div>
            <div class="bg-white/20 rounded-full h-3 overflow-hidden">
                <div class="h-full bg-white rounded-full transition-all duration-500" style="width: <?= $progressPercent ?>%"></div>
            </div>
            <div class="flex justify-between text-sm mt-1 opacity-80">
                <span><?= $progressXP ?> XP</span>
                <span><?= $neededXP ?> XP para Nível <?= $currentLevel + 1 ?></span>
            </div>
        </div>
    </div>
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <i data-lucide="flame" class="w-6 h-6 text-yellow-600"></i>
        </div>
        <p class="text-2xl font-bold text-gray-800"><?= $currentUser['current_streak'] ?></p>
        <p class="text-sm text-gray-500">Dias de Streak</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <i data-lucide="book-open" class="w-6 h-6 text-blue-600"></i>
        </div>
        <p class="text-2xl font-bold text-gray-800"><?= $userStats['courses_completed'] ?></p>
        <p class="text-sm text-gray-500">Cursos Concluídos</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <i data-lucide="check-circle" class="w-6 h-6 text-green-600"></i>
        </div>
        <p class="text-2xl font-bold text-gray-800"><?= $userStats['tasks_completed'] ?></p>
        <p class="text-sm text-gray-500">Tarefas Completadas</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <i data-lucide="award" class="w-6 h-6 text-purple-600"></i>
        </div>
        <p class="text-2xl font-bold text-gray-800"><?= $userStats['achievements_earned'] ?></p>
        <p class="text-sm text-gray-500">Conquistas</p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Leaderboards -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Weekly Leaderboard -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i data-lucide="calendar" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                    Ranking Semanal
                </h3>
            </div>
            <div class="divide-y divide-gray-100">
                <?php foreach ($weeklyLeaderboard as $index => $user): ?>
                <div class="p-4 flex items-center gap-4 <?= $user['id'] === $_SESSION['user_id'] ? 'bg-maternar-pink/5' : '' ?>">
                    <div class="flex-shrink-0 w-8 text-center">
                        <?php if ($index < 3): ?>
                        <span class="text-2xl"><?= ['🥇', '🥈', '🥉'][$index] ?></span>
                        <?php else: ?>
                        <span class="text-lg font-bold text-gray-400"><?= $index + 1 ?></span>
                        <?php endif; ?>
                    </div>
                    <?php if ($user['avatar']): ?>
                    <img src="<?= sanitize($user['avatar']) ?>" alt="" class="w-10 h-10 rounded-full">
                    <?php else: ?>
                    <div class="w-10 h-10 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                        <span class="text-maternar-pink font-medium"><?= strtoupper(substr($user['first_name'], 0, 1)) ?></span>
                    </div>
                    <?php endif; ?>
                    <div class="flex-grow">
                        <p class="font-medium text-gray-800"><?= sanitize($user['first_name'] . ' ' . $user['last_name']) ?></p>
                        <p class="text-sm text-gray-500">Nível <?= $user['level'] ?></p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-maternar-pink"><?= number_format($user['weekly_xp']) ?></p>
                        <p class="text-xs text-gray-500">XP esta semana</p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- All-Time Leaderboard -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i data-lucide="trophy" class="w-5 h-5 mr-2 text-yellow-500"></i>
                    Ranking Geral
                </h3>
            </div>
            <div class="divide-y divide-gray-100">
                <?php foreach ($allTimeLeaderboard as $index => $user): ?>
                <div class="p-4 flex items-center gap-4 <?= $user['id'] === $_SESSION['user_id'] ? 'bg-maternar-pink/5' : '' ?>">
                    <div class="flex-shrink-0 w-8 text-center">
                        <?php if ($index < 3): ?>
                        <span class="text-2xl"><?= ['🥇', '🥈', '🥉'][$index] ?></span>
                        <?php else: ?>
                        <span class="text-lg font-bold text-gray-400"><?= $index + 1 ?></span>
                        <?php endif; ?>
                    </div>
                    <?php if ($user['avatar']): ?>
                    <img src="<?= sanitize($user['avatar']) ?>" alt="" class="w-10 h-10 rounded-full">
                    <?php else: ?>
                    <div class="w-10 h-10 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                        <span class="text-maternar-pink font-medium"><?= strtoupper(substr($user['first_name'], 0, 1)) ?></span>
                    </div>
                    <?php endif; ?>
                    <div class="flex-grow">
                        <p class="font-medium text-gray-800"><?= sanitize($user['first_name'] . ' ' . $user['last_name']) ?></p>
                        <p class="text-sm text-gray-500">Nível <?= $user['level'] ?></p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-800"><?= number_format($user['total_xp']) ?></p>
                        <p class="text-xs text-gray-500">XP total</p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <!-- Achievements -->
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i data-lucide="award" class="w-5 h-5 mr-2 text-purple-500"></i>
                    Conquistas
                </h3>
            </div>
            <div class="p-5 space-y-4 max-h-[600px] overflow-y-auto">
                <?php if (!empty($earnedAchievements)): ?>
                <div class="mb-4">
                    <h4 class="text-sm font-medium text-gray-500 mb-3">Conquistadas (<?= count($earnedAchievements) ?>)</h4>
                    <div class="space-y-3">
                        <?php foreach ($earnedAchievements as $achievement): ?>
                        <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div class="w-12 h-12 rounded-lg bg-gradient-to-br <?= $getBadgeColor($achievement['category']) ?> flex items-center justify-center text-white text-2xl">
                                <?= $achievement['icon'] ?>
                            </div>
                            <div class="flex-grow">
                                <p class="font-medium text-gray-800"><?= sanitize($achievement['name']) ?></p>
                                <p class="text-xs text-gray-500"><?= sanitize($achievement['description']) ?></p>
                                <p class="text-xs text-green-600 mt-1">+<?= $achievement['xp_reward'] ?> XP</p>
                            </div>
                            <i data-lucide="check-circle" class="w-5 h-5 text-green-500 flex-shrink-0"></i>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>

                <?php if (!empty($pendingAchievements)): ?>
                <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-3">A conquistar (<?= count($pendingAchievements) ?>)</h4>
                    <div class="space-y-3">
                        <?php foreach ($pendingAchievements as $achievement): ?>
                        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                            <div class="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center text-white text-2xl">
                                <?= $achievement['icon'] ?>
                            </div>
                            <div class="flex-grow">
                                <p class="font-medium text-gray-800"><?= sanitize($achievement['name']) ?></p>
                                <p class="text-xs text-gray-500"><?= sanitize($achievement['description']) ?></p>
                                <p class="text-xs text-gray-400 mt-1">+<?= $achievement['xp_reward'] ?> XP</p>
                            </div>
                            <i data-lucide="lock" class="w-5 h-5 text-gray-400 flex-shrink-0"></i>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
