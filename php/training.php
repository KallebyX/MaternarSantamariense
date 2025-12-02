<?php
$pageTitle = 'Treinamentos';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get all active courses
$courses = $db->query(
    "SELECT c.*,
            COUNT(DISTINCT e.id) as total_enrollments,
            (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons
     FROM courses c
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE c.is_active = true
     GROUP BY c.id
     ORDER BY c.created_at DESC"
);

// Get user's enrolled courses
$myCourses = $db->query(
    "SELECT c.*, e.progress, e.enrolled_at, e.completed_at
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.user_id = :user_id
     ORDER BY e.enrolled_at DESC",
    ['user_id' => $_SESSION['user_id']]
);

$myCoursesIds = array_column($myCourses, 'id');

// Handle enrollment
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['enroll'])) {
    $courseId = (int) $_POST['course_id'];

    if (!in_array($courseId, $myCoursesIds)) {
        $db->insert('enrollments', [
            'user_id' => $_SESSION['user_id'],
            'course_id' => $courseId,
            'progress' => 0,
            'enrolled_at' => date('Y-m-d H:i:s')
        ]);
        setFlash('success', 'Inscrição realizada com sucesso!');
        redirect(APP_URL . '/training.php');
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
?>

<div class="mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Cursos Disponíveis</h2>
            <p class="text-gray-500 mt-1">Desenvolva suas habilidades com nossos cursos</p>
        </div>
    </div>
</div>

<!-- My Courses Progress -->
<?php if (!empty($myCourses)): ?>
<div class="mb-8">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Meus Cursos</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($myCourses as $course): ?>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <?php if ($course['thumbnail']): ?>
            <img src="<?= sanitize($course['thumbnail']) ?>" alt="" class="w-full h-32 object-cover">
            <?php else: ?>
            <div class="w-full h-32 bg-gradient-to-r from-maternar-pink to-purple-600 flex items-center justify-center">
                <i data-lucide="book-open" class="w-12 h-12 text-white/50"></i>
            </div>
            <?php endif; ?>
            <div class="p-4">
                <h4 class="font-semibold text-gray-800 mb-2"><?= sanitize($course['title']) ?></h4>
                <div class="mb-3">
                    <div class="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span><?= $course['progress'] ?>%</span>
                    </div>
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-maternar-pink rounded-full" style="width: <?= $course['progress'] ?>%"></div>
                    </div>
                </div>
                <a href="course.php?id=<?= $course['id'] ?>" class="block w-full text-center py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                    <?= $course['progress'] == 100 ? 'Revisar' : 'Continuar' ?>
                </a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>
<?php endif; ?>

<!-- All Courses -->
<h3 class="text-lg font-semibold text-gray-800 mb-4">Todos os Cursos</h3>
<?php if (empty($courses)): ?>
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
    <i data-lucide="book-open" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum curso disponível</h3>
    <p class="text-gray-500">Novos cursos serão adicionados em breve.</p>
</div>
<?php else: ?>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach ($courses as $course): ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <?php if ($course['thumbnail']): ?>
        <img src="<?= sanitize($course['thumbnail']) ?>" alt="" class="w-full h-40 object-cover">
        <?php else: ?>
        <div class="w-full h-40 bg-gradient-to-r from-maternar-blue to-purple-600 flex items-center justify-center">
            <i data-lucide="book-open" class="w-16 h-16 text-white/50"></i>
        </div>
        <?php endif; ?>
        <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full <?= $getDifficultyColor($course['difficulty']) ?>">
                    <?= $getDifficultyLabel($course['difficulty']) ?>
                </span>
                <?php if ($course['category']): ?>
                <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    <?= sanitize($course['category']) ?>
                </span>
                <?php endif; ?>
            </div>

            <h4 class="font-semibold text-gray-800 mb-2"><?= sanitize($course['title']) ?></h4>
            <p class="text-sm text-gray-500 mb-4 line-clamp-2"><?= sanitize($course['description']) ?></p>

            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div class="flex items-center">
                    <i data-lucide="book" class="w-4 h-4 mr-1"></i>
                    <?= $course['total_lessons'] ?> aulas
                </div>
                <div class="flex items-center">
                    <i data-lucide="clock" class="w-4 h-4 mr-1"></i>
                    <?= $course['estimated_time'] ?> min
                </div>
                <div class="flex items-center">
                    <i data-lucide="star" class="w-4 h-4 mr-1 text-yellow-500"></i>
                    +<?= $course['xp_reward'] ?> XP
                </div>
            </div>

            <?php if (in_array($course['id'], $myCoursesIds)): ?>
            <a href="course.php?id=<?= $course['id'] ?>" class="block w-full text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <i data-lucide="play" class="w-4 h-4 inline mr-1"></i> Continuar
            </a>
            <?php else: ?>
            <form method="POST">
                <input type="hidden" name="course_id" value="<?= $course['id'] ?>">
                <button type="submit" name="enroll" class="w-full py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
                    <i data-lucide="plus" class="w-4 h-4 inline mr-1"></i> Inscrever-se
                </button>
            </form>
            <?php endif; ?>
        </div>
    </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
