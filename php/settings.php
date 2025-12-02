<?php
$pageTitle = 'Configurações';
require_once __DIR__ . '/includes/header.php';
requireAdmin();

$db = Database::getInstance();

// Handle form submissions
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle different settings sections
    if (isset($_POST['save_general'])) {
        // In a real app, you would save these to a settings table
        setFlash('success', 'Configurações gerais salvas com sucesso!');
        redirect('settings.php');
    }

    if (isset($_POST['create_course'])) {
        $title = trim($_POST['course_title']);
        $description = trim($_POST['course_description']);
        $difficulty = $_POST['course_difficulty'];
        $duration = (int)$_POST['course_duration'];
        $xpReward = (int)$_POST['course_xp'];

        if ($title && $description) {
            $db->insert('courses', [
                'title' => $title,
                'description' => $description,
                'difficulty' => $difficulty,
                'duration_hours' => $duration,
                'xp_reward' => $xpReward,
                'instructor_id' => $_SESSION['user_id'],
                'is_published' => true,
                'created_at' => date('Y-m-d H:i:s')
            ]);
            setFlash('success', 'Curso criado com sucesso!');
            redirect('settings.php#courses');
        }
    }

    if (isset($_POST['create_channel'])) {
        $name = trim($_POST['channel_name']);
        $description = trim($_POST['channel_description']);
        $type = $_POST['channel_type'];

        if ($name) {
            $channelId = $db->insert('channels', [
                'name' => $name,
                'description' => $description,
                'type' => $type,
                'created_by' => $_SESSION['user_id'],
                'created_at' => date('Y-m-d H:i:s')
            ]);

            // Add creator as member
            $db->insert('channel_members', [
                'channel_id' => $channelId,
                'user_id' => $_SESSION['user_id'],
                'role' => 'ADMIN',
                'joined_at' => date('Y-m-d H:i:s')
            ]);

            setFlash('success', 'Canal criado com sucesso!');
            redirect('settings.php#channels');
        }
    }

    if (isset($_POST['create_achievement'])) {
        $name = trim($_POST['achievement_name']);
        $description = trim($_POST['achievement_description']);
        $category = $_POST['achievement_category'];
        $xpReward = (int)$_POST['achievement_xp'];
        $icon = $_POST['achievement_icon'];

        if ($name && $description) {
            $db->insert('achievements', [
                'name' => $name,
                'description' => $description,
                'category' => $category,
                'xp_reward' => $xpReward,
                'icon' => $icon,
                'created_at' => date('Y-m-d H:i:s')
            ]);
            setFlash('success', 'Conquista criada com sucesso!');
            redirect('settings.php#achievements');
        }
    }
}

// Get stats
$stats = [
    'users' => $db->queryOne("SELECT COUNT(*) as count FROM users")['count'],
    'courses' => $db->queryOne("SELECT COUNT(*) as count FROM courses")['count'],
    'projects' => $db->queryOne("SELECT COUNT(*) as count FROM projects")['count'],
    'channels' => $db->queryOne("SELECT COUNT(*) as count FROM channels")['count'],
    'achievements' => $db->queryOne("SELECT COUNT(*) as count FROM achievements")['count']
];

// Get recent courses
$courses = $db->query("SELECT * FROM courses ORDER BY created_at DESC LIMIT 10");

// Get channels
$channels = $db->query("SELECT c.*, (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) as member_count FROM channels c ORDER BY c.name");

// Get achievements
$achievements = $db->query("SELECT * FROM achievements ORDER BY category, name");
?>

<div class="max-w-6xl mx-auto">
    <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
        <p class="text-gray-500 mt-1">Gerencie as configurações gerais da plataforma</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-maternar-pink"><?= $stats['users'] ?></p>
            <p class="text-sm text-gray-500">Usuários</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-blue-600"><?= $stats['courses'] ?></p>
            <p class="text-sm text-gray-500">Cursos</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-green-600"><?= $stats['projects'] ?></p>
            <p class="text-sm text-gray-500">Projetos</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-purple-600"><?= $stats['channels'] ?></p>
            <p class="text-sm text-gray-500">Canais</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
            <p class="text-2xl font-bold text-yellow-600"><?= $stats['achievements'] ?></p>
            <p class="text-sm text-gray-500">Conquistas</p>
        </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
        <nav class="flex space-x-8">
            <a href="#courses" class="tab-link border-b-2 border-maternar-pink py-4 px-1 text-sm font-medium text-maternar-pink" data-tab="courses">
                <i data-lucide="book-open" class="w-4 h-4 inline mr-2"></i>Cursos
            </a>
            <a href="#channels" class="tab-link border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="channels">
                <i data-lucide="hash" class="w-4 h-4 inline mr-2"></i>Canais
            </a>
            <a href="#achievements" class="tab-link border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="achievements">
                <i data-lucide="award" class="w-4 h-4 inline mr-2"></i>Conquistas
            </a>
            <a href="#system" class="tab-link border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="system">
                <i data-lucide="settings" class="w-4 h-4 inline mr-2"></i>Sistema
            </a>
        </nav>
    </div>

    <!-- Courses Tab -->
    <div id="tab-courses" class="tab-content">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Create Course Form -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                        <i data-lucide="plus-circle" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                        Novo Curso
                    </h3>
                    <form method="POST" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input type="text" name="course_title" required
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea name="course_description" rows="3" required
                                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
                                <select name="course_difficulty" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                                    <option value="BEGINNER">Iniciante</option>
                                    <option value="INTERMEDIATE">Intermediário</option>
                                    <option value="ADVANCED">Avançado</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Duração (h)</label>
                                <input type="number" name="course_duration" min="1" value="4"
                                       class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">XP de Recompensa</label>
                            <input type="number" name="course_xp" min="10" value="100"
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                        </div>
                        <button type="submit" name="create_course" class="w-full px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                            Criar Curso
                        </button>
                    </form>
                </div>
            </div>

            <!-- Courses List -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-5 border-b border-gray-100">
                        <h3 class="font-semibold text-gray-800">Cursos Existentes</h3>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <?php foreach ($courses as $course): ?>
                        <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div>
                                <h4 class="font-medium text-gray-800"><?= sanitize($course['title']) ?></h4>
                                <p class="text-sm text-gray-500"><?= getDifficultyLabel($course['difficulty']) ?> • <?= $course['duration_hours'] ?>h • <?= $course['xp_reward'] ?> XP</p>
                            </div>
                            <a href="course.php?id=<?= $course['id'] ?>" class="text-maternar-pink hover:underline text-sm">Ver</a>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($courses)): ?>
                        <div class="p-8 text-center text-gray-500">
                            Nenhum curso cadastrado ainda.
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Channels Tab -->
    <div id="tab-channels" class="tab-content hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Create Channel Form -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                        <i data-lucide="plus-circle" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                        Novo Canal
                    </h3>
                    <form method="POST" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input type="text" name="channel_name" required
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea name="channel_description" rows="2"
                                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select name="channel_type" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                                <option value="PUBLIC">Público</option>
                                <option value="PRIVATE">Privado</option>
                            </select>
                        </div>
                        <button type="submit" name="create_channel" class="w-full px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                            Criar Canal
                        </button>
                    </form>
                </div>
            </div>

            <!-- Channels List -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-5 border-b border-gray-100">
                        <h3 class="font-semibold text-gray-800">Canais Existentes</h3>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <?php foreach ($channels as $channel): ?>
                        <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <i data-lucide="<?= $channel['type'] === 'PRIVATE' ? 'lock' : 'hash' ?>" class="w-5 h-5 text-gray-500"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-800"><?= sanitize($channel['name']) ?></h4>
                                    <p class="text-sm text-gray-500"><?= $channel['member_count'] ?> membros</p>
                                </div>
                            </div>
                            <span class="px-2 py-1 text-xs rounded-full <?= $channel['type'] === 'PRIVATE' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600' ?>">
                                <?= $channel['type'] === 'PRIVATE' ? 'Privado' : 'Público' ?>
                            </span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Achievements Tab -->
    <div id="tab-achievements" class="tab-content hidden">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Create Achievement Form -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                        <i data-lucide="plus-circle" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                        Nova Conquista
                    </h3>
                    <form method="POST" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input type="text" name="achievement_name" required
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea name="achievement_description" rows="2" required
                                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select name="achievement_category" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                                    <option value="LEARNING">Aprendizado</option>
                                    <option value="COLLABORATION">Colaboração</option>
                                    <option value="LEADERSHIP">Liderança</option>
                                    <option value="INNOVATION">Inovação</option>
                                    <option value="STREAK">Sequência</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">XP</label>
                                <input type="number" name="achievement_xp" min="10" value="50"
                                       class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ícone (emoji)</label>
                            <input type="text" name="achievement_icon" value="🏆" maxlength="4"
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink text-center text-2xl">
                        </div>
                        <button type="submit" name="create_achievement" class="w-full px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                            Criar Conquista
                        </button>
                    </form>
                </div>
            </div>

            <!-- Achievements List -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-5 border-b border-gray-100">
                        <h3 class="font-semibold text-gray-800">Conquistas Existentes</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <?php foreach ($achievements as $achievement): ?>
                        <div class="p-4 rounded-lg border border-gray-100 flex items-center gap-4">
                            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-maternar-pink to-purple-500 flex items-center justify-center text-2xl">
                                <?= $achievement['icon'] ?>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-800"><?= sanitize($achievement['name']) ?></h4>
                                <p class="text-xs text-gray-500"><?= sanitize($achievement['description']) ?></p>
                                <span class="text-xs text-maternar-pink">+<?= $achievement['xp_reward'] ?> XP</span>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- System Tab -->
    <div id="tab-system" class="tab-content hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- General Settings -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                    <i data-lucide="settings" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                    Configurações Gerais
                </h3>
                <form method="POST" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Plataforma</label>
                        <input type="text" name="app_name" value="<?= APP_NAME ?>"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">URL da Aplicação</label>
                        <input type="url" name="app_url" value="<?= APP_URL ?>"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">XP por Nível</label>
                        <input type="number" name="xp_per_level" value="<?= XP_PER_LEVEL ?>"
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                    </div>
                    <button type="submit" name="save_general" class="w-full px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                        Salvar Configurações
                    </button>
                </form>
            </div>

            <!-- System Info -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                    <i data-lucide="info" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                    Informações do Sistema
                </h3>
                <div class="space-y-3">
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">Versão</span>
                        <span class="font-medium"><?= APP_VERSION ?></span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">PHP</span>
                        <span class="font-medium"><?= phpversion() ?></span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">Ambiente</span>
                        <span class="font-medium"><?= ucfirst(APP_ENV) ?></span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">Timezone</span>
                        <span class="font-medium"><?= date_default_timezone_get() ?></span>
                    </div>
                    <div class="flex justify-between py-2">
                        <span class="text-gray-500">Última atualização</span>
                        <span class="font-medium"><?= date('d/m/Y H:i') ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Tab switching
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const tab = this.dataset.tab;

        // Update tab links
        document.querySelectorAll('.tab-link').forEach(l => {
            l.classList.remove('border-maternar-pink', 'text-maternar-pink');
            l.classList.add('border-transparent', 'text-gray-500');
        });
        this.classList.add('border-maternar-pink', 'text-maternar-pink');
        this.classList.remove('border-transparent', 'text-gray-500');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById('tab-' + tab).classList.remove('hidden');

        // Update URL hash
        window.location.hash = tab;
    });
});

// Handle hash on load
if (window.location.hash) {
    const tab = window.location.hash.substring(1);
    const link = document.querySelector(`[data-tab="${tab}"]`);
    if (link) link.click();
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
