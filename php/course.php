<?php
$pageTitle = 'Curso';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get course ID
$courseId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$courseId) {
    redirect('training.php');
}

// Get course details
$course = $db->queryOne(
    "SELECT c.*,
            u.first_name as instructor_first_name,
            u.last_name as instructor_last_name,
            u.avatar as instructor_avatar,
            (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
            (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
     FROM courses c
     LEFT JOIN users u ON c.instructor_id = u.id
     WHERE c.id = :id",
    ['id' => $courseId]
);

if (!$course) {
    setFlash('error', 'Curso não encontrado.');
    redirect('training.php');
}

$pageTitle = $course['title'];

// Check if user is enrolled
$enrollment = $db->queryOne(
    "SELECT * FROM enrollments WHERE course_id = :course_id AND user_id = :user_id",
    ['course_id' => $courseId, 'user_id' => $_SESSION['user_id']]
);

// Handle enrollment
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['enroll'])) {
    if (!$enrollment) {
        $db->insert('enrollments', [
            'course_id' => $courseId,
            'user_id' => $_SESSION['user_id'],
            'status' => 'IN_PROGRESS',
            'progress' => 0,
            'enrolled_at' => date('Y-m-d H:i:s')
        ]);
        setFlash('success', 'Inscrição realizada com sucesso!');
        redirect('course.php?id=' . $courseId);
    }
}

// Get lessons
$lessons = $db->query(
    "SELECT l.*,
            CASE WHEN lp.id IS NOT NULL THEN true ELSE false END as completed,
            lp.completed_at
     FROM lessons l
     LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = :user_id
     WHERE l.course_id = :course_id
     ORDER BY l.order_number ASC",
    ['course_id' => $courseId, 'user_id' => $_SESSION['user_id']]
);

// Calculate progress
$completedLessons = count(array_filter($lessons, fn($l) => $l['completed']));
$totalLessons = count($lessons);
$progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

// Mark lesson as complete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['complete_lesson']) && $enrollment) {
    $lessonId = (int)$_POST['lesson_id'];
    $lesson = $db->queryOne(
        "SELECT * FROM lessons WHERE id = :id AND course_id = :course_id",
        ['id' => $lessonId, 'course_id' => $courseId]
    );

    if ($lesson) {
        // Check if not already completed
        $existing = $db->queryOne(
            "SELECT id FROM lesson_progress WHERE lesson_id = :lesson_id AND user_id = :user_id",
            ['lesson_id' => $lessonId, 'user_id' => $_SESSION['user_id']]
        );

        if (!$existing) {
            $db->insert('lesson_progress', [
                'lesson_id' => $lessonId,
                'user_id' => $_SESSION['user_id'],
                'completed_at' => date('Y-m-d H:i:s')
            ]);

            // Award XP
            $userClass = new User();
            $userClass->addXP($_SESSION['user_id'], $lesson['xp_reward'], 'Aula concluída: ' . $lesson['title']);

            // Update enrollment progress
            $newProgress = (($completedLessons + 1) / $totalLessons) * 100;
            $status = $newProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';

            $db->execute(
                "UPDATE enrollments SET progress = :progress, status = :status, completed_at = :completed_at WHERE id = :id",
                [
                    'progress' => $newProgress,
                    'status' => $status,
                    'completed_at' => $status === 'COMPLETED' ? date('Y-m-d H:i:s') : null,
                    'id' => $enrollment['id']
                ]
            );

            // If course completed, award bonus XP
            if ($status === 'COMPLETED') {
                $userClass->addXP($_SESSION['user_id'], $course['xp_reward'], 'Curso concluído: ' . $course['title']);
                setFlash('success', 'Parabéns! Você concluiu o curso e ganhou ' . $course['xp_reward'] . ' XP!');
            } else {
                setFlash('success', 'Aula concluída! +' . $lesson['xp_reward'] . ' XP');
            }
        }

        redirect('course.php?id=' . $courseId);
    }
}

$getDifficultyColor = function($difficulty) {
    switch ($difficulty) {
        case 'BEGINNER': return 'bg-green-100 text-green-800';
        case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
        case 'ADVANCED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

$getDifficultyLabel = function($difficulty) {
    switch ($difficulty) {
        case 'BEGINNER': return 'Iniciante';
        case 'INTERMEDIATE': return 'Intermediário';
        case 'ADVANCED': return 'Avançado';
        default: return $difficulty;
    }
};

$getTypeIcon = function($type) {
    switch ($type) {
        case 'VIDEO': return 'play-circle';
        case 'DOCUMENT': return 'file-text';
        case 'QUIZ': return 'help-circle';
        default: return 'book-open';
    }
};
?>

<div class="mb-6">
    <a href="training.php" class="inline-flex items-center text-gray-500 hover:text-maternar-pink mb-4">
        <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
        Voltar para cursos
    </a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Course Info -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Course Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <?php if ($course['thumbnail']): ?>
            <img src="<?= sanitize($course['thumbnail']) ?>" alt="" class="w-full h-48 object-cover">
            <?php else: ?>
            <div class="w-full h-48 bg-gradient-to-r from-maternar-pink to-pink-400 flex items-center justify-center">
                <i data-lucide="book-open" class="w-16 h-16 text-white/50"></i>
            </div>
            <?php endif; ?>

            <div class="p-6">
                <div class="flex items-center gap-3 mb-3">
                    <span class="px-2 py-1 text-xs font-medium rounded-full <?= $getDifficultyColor($course['difficulty']) ?>">
                        <?= $getDifficultyLabel($course['difficulty']) ?>
                    </span>
                    <span class="text-sm text-gray-500">
                        <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i>
                        <?= $course['duration_hours'] ?> horas
                    </span>
                    <span class="text-sm text-gray-500">
                        <i data-lucide="users" class="w-4 h-4 inline mr-1"></i>
                        <?= $course['enrolled_count'] ?> alunos
                    </span>
                </div>

                <h1 class="text-2xl font-bold text-gray-800 mb-3"><?= sanitize($course['title']) ?></h1>
                <p class="text-gray-600"><?= nl2br(sanitize($course['description'])) ?></p>

                <?php if ($course['instructor_first_name']): ?>
                <div class="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                    <?php if ($course['instructor_avatar']): ?>
                    <img src="<?= sanitize($course['instructor_avatar']) ?>" alt="" class="w-10 h-10 rounded-full">
                    <?php else: ?>
                    <div class="w-10 h-10 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                        <span class="text-maternar-pink font-medium"><?= strtoupper(substr($course['instructor_first_name'], 0, 1)) ?></span>
                    </div>
                    <?php endif; ?>
                    <div>
                        <p class="text-sm text-gray-500">Instrutor</p>
                        <p class="font-medium text-gray-800"><?= sanitize($course['instructor_first_name'] . ' ' . $course['instructor_last_name']) ?></p>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Lessons -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800">Conteúdo do Curso</h3>
                <p class="text-sm text-gray-500 mt-1"><?= $totalLessons ?> aulas</p>
            </div>

            <?php if (empty($lessons)): ?>
            <div class="p-8 text-center">
                <i data-lucide="book-open" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-500">Nenhuma aula disponível ainda.</p>
            </div>
            <?php else: ?>
            <div class="divide-y divide-gray-100">
                <?php foreach ($lessons as $index => $lesson): ?>
                <div class="p-4 flex items-center gap-4 <?= $lesson['completed'] ? 'bg-green-50' : '' ?>">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full <?= $lesson['completed'] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500' ?> flex items-center justify-center">
                        <?php if ($lesson['completed']): ?>
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <?php else: ?>
                        <span class="text-sm font-medium"><?= $index + 1 ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="flex-grow">
                        <div class="flex items-center gap-2">
                            <i data-lucide="<?= $getTypeIcon($lesson['type']) ?>" class="w-4 h-4 text-gray-400"></i>
                            <h4 class="font-medium text-gray-800"><?= sanitize($lesson['title']) ?></h4>
                        </div>
                        <?php if ($lesson['description']): ?>
                        <p class="text-sm text-gray-500 mt-1"><?= sanitize($lesson['description']) ?></p>
                        <?php endif; ?>
                        <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <?php if ($lesson['duration_minutes']): ?>
                            <span><i data-lucide="clock" class="w-3 h-3 inline mr-1"></i><?= $lesson['duration_minutes'] ?> min</span>
                            <?php endif; ?>
                            <span><i data-lucide="zap" class="w-3 h-3 inline mr-1"></i><?= $lesson['xp_reward'] ?> XP</span>
                        </div>
                    </div>
                    <?php if ($enrollment && !$lesson['completed']): ?>
                    <form method="POST" class="flex-shrink-0">
                        <input type="hidden" name="lesson_id" value="<?= $lesson['id'] ?>">
                        <button type="submit" name="complete_lesson" class="px-4 py-2 bg-maternar-pink text-white text-sm rounded-lg hover:bg-maternar-pink/90 transition-colors">
                            Concluir
                        </button>
                    </form>
                    <?php elseif ($lesson['completed']): ?>
                    <span class="text-green-600 text-sm flex items-center">
                        <i data-lucide="check-circle" class="w-4 h-4 mr-1"></i>
                        Concluído
                    </span>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-1 space-y-6">
        <!-- Enrollment Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <?php if ($enrollment): ?>
            <div class="text-center mb-4">
                <p class="text-sm text-gray-500">Seu progresso</p>
                <p class="text-3xl font-bold text-maternar-pink"><?= $progress ?>%</p>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div class="h-full bg-maternar-pink rounded-full transition-all duration-500" style="width: <?= $progress ?>%"></div>
            </div>
            <div class="flex justify-between text-sm text-gray-500 mb-6">
                <span><?= $completedLessons ?> de <?= $totalLessons ?> aulas</span>
                <span><?= $enrollment['status'] === 'COMPLETED' ? 'Concluído' : 'Em andamento' ?></span>
            </div>
            <?php if ($enrollment['status'] === 'COMPLETED'): ?>
            <div class="text-center py-4 bg-green-50 rounded-lg">
                <i data-lucide="award" class="w-8 h-8 text-green-500 mx-auto mb-2"></i>
                <p class="font-medium text-green-800">Curso Concluído!</p>
                <p class="text-sm text-green-600">Parabéns pela conquista</p>
            </div>
            <?php endif; ?>
            <?php else: ?>
            <div class="text-center mb-4">
                <p class="text-3xl font-bold text-maternar-pink"><?= $course['xp_reward'] ?> XP</p>
                <p class="text-sm text-gray-500">ao concluir o curso</p>
            </div>
            <form method="POST">
                <button type="submit" name="enroll" class="w-full px-4 py-3 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors font-medium">
                    <i data-lucide="play" class="w-5 h-5 inline mr-2"></i>
                    Iniciar Curso
                </button>
            </form>
            <?php endif; ?>
        </div>

        <!-- Course Details -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-800 mb-4">Detalhes</h3>
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Dificuldade</span>
                    <span class="font-medium"><?= $getDifficultyLabel($course['difficulty']) ?></span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Duração</span>
                    <span class="font-medium"><?= $course['duration_hours'] ?> horas</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Aulas</span>
                    <span class="font-medium"><?= $totalLessons ?></span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Alunos</span>
                    <span class="font-medium"><?= $course['enrolled_count'] ?></span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">XP do Curso</span>
                    <span class="font-medium text-maternar-pink"><?= $course['xp_reward'] ?></span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
