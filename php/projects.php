<?php
$pageTitle = 'Projetos';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get projects for current user
$projects = $db->query(
    "SELECT p.*,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'DONE') as completed_tasks,
            (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
     FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = :user_id
     ORDER BY p.created_at DESC",
    ['user_id' => $_SESSION['user_id']]
);

// Status helpers
$getStatusColor = function($status) {
    switch ($status) {
        case 'PLANNING': return 'bg-blue-100 text-blue-800';
        case 'ACTIVE': return 'bg-yellow-100 text-yellow-800';
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'ON_HOLD': return 'bg-gray-100 text-gray-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

$getStatusLabel = function($status) {
    switch ($status) {
        case 'PLANNING': return 'Planejamento';
        case 'ACTIVE': return 'Em Andamento';
        case 'COMPLETED': return 'Concluído';
        case 'ON_HOLD': return 'Pausado';
        case 'CANCELLED': return 'Cancelado';
        default: return $status;
    }
};

$getPriorityColor = function($priority) {
    switch ($priority) {
        case 'URGENT': return 'text-red-600';
        case 'HIGH': return 'text-orange-600';
        case 'MEDIUM': return 'text-yellow-600';
        case 'LOW': return 'text-green-600';
        default: return 'text-gray-600';
    }
};

// Stats
$stats = [
    'total' => count($projects),
    'active' => count(array_filter($projects, fn($p) => $p['status'] === 'ACTIVE')),
    'completed' => count(array_filter($projects, fn($p) => $p['status'] === 'COMPLETED')),
    'on_hold' => count(array_filter($projects, fn($p) => $p['status'] === 'ON_HOLD'))
];
?>

<div class="mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Meus Projetos</h2>
            <p class="text-gray-500 mt-1">Gerencie e acompanhe seus projetos</p>
        </div>
        <?php if ($currentUser['role'] === 'ADMIN' || $currentUser['role'] === 'MANAGER'): ?>
        <a href="project-create.php" class="inline-flex items-center px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
            <i data-lucide="plus" class="w-5 h-5 mr-2"></i>
            Novo Projeto
        </a>
        <?php endif; ?>
    </div>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Total</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['total'] ?></p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i data-lucide="folder-kanban" class="w-5 h-5 text-blue-600"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Em Andamento</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['active'] ?></p>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i data-lucide="play-circle" class="w-5 h-5 text-yellow-600"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Concluídos</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['completed'] ?></p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Pausados</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['on_hold'] ?></p>
            </div>
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <i data-lucide="pause-circle" class="w-5 h-5 text-gray-600"></i>
            </div>
        </div>
    </div>
</div>

<!-- Projects List -->
<?php if (empty($projects)): ?>
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
    <i data-lucide="folder-kanban" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum projeto encontrado</h3>
    <p class="text-gray-500">Você ainda não participa de nenhum projeto.</p>
</div>
<?php else: ?>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach ($projects as $project): ?>
    <?php
    $progress = $project['total_tasks'] > 0
        ? round(($project['completed_tasks'] / $project['total_tasks']) * 100)
        : 0;
    ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full <?= $getStatusColor($project['status']) ?>">
                    <?= $getStatusLabel($project['status']) ?>
                </span>
                <i data-lucide="star" class="w-4 h-4 <?= $getPriorityColor($project['priority']) ?>"></i>
            </div>

            <h4 class="font-semibold text-gray-800 mb-2"><?= sanitize($project['name']) ?></h4>
            <p class="text-sm text-gray-500 mb-4 line-clamp-2"><?= sanitize($project['description']) ?></p>

            <!-- Progress -->
            <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span><?= $progress ?>%</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-maternar-pink rounded-full" style="width: <?= $progress ?>%"></div>
                </div>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div class="flex items-center">
                    <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                    <?= $project['due_date'] ? formatDate($project['due_date']) : 'Sem prazo' ?>
                </div>
                <div class="flex items-center">
                    <i data-lucide="check-square" class="w-4 h-4 mr-1"></i>
                    <?= $project['completed_tasks'] ?>/<?= $project['total_tasks'] ?> tarefas
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center text-sm text-gray-500">
                    <i data-lucide="users" class="w-4 h-4 mr-1"></i>
                    <?= $project['member_count'] ?> membros
                </div>
                <a href="project.php?id=<?= $project['id'] ?>" class="text-maternar-pink hover:underline text-sm font-medium">
                    Ver detalhes →
                </a>
            </div>
        </div>
    </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
