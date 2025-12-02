<?php
$pageTitle = 'Projeto';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get project ID
$projectId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$projectId) {
    redirect('projects.php');
}

// Check if user is member of the project
$membership = $db->queryOne(
    "SELECT * FROM project_members WHERE project_id = :project_id AND user_id = :user_id",
    ['project_id' => $projectId, 'user_id' => $_SESSION['user_id']]
);

if (!$membership) {
    setFlash('error', 'Você não tem acesso a este projeto.');
    redirect('projects.php');
}

// Get project details
$project = $db->queryOne(
    "SELECT p.*,
            u.first_name as owner_first_name,
            u.last_name as owner_last_name,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'DONE') as completed_tasks,
            (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
     FROM projects p
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.id = :id",
    ['id' => $projectId]
);

if (!$project) {
    setFlash('error', 'Projeto não encontrado.');
    redirect('projects.php');
}

$pageTitle = $project['name'];

// Handle task status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_task'])) {
    $taskId = (int)$_POST['task_id'];
    $newStatus = $_POST['status'];

    $task = $db->queryOne(
        "SELECT * FROM tasks WHERE id = :id AND project_id = :project_id",
        ['id' => $taskId, 'project_id' => $projectId]
    );

    if ($task) {
        $db->execute(
            "UPDATE tasks SET status = :status, updated_at = :updated_at WHERE id = :id",
            ['status' => $newStatus, 'updated_at' => date('Y-m-d H:i:s'), 'id' => $taskId]
        );

        // If task completed, award XP
        if ($newStatus === 'DONE' && $task['status'] !== 'DONE') {
            $userClass = new User();
            $xp = $task['priority'] === 'URGENT' ? 50 : ($task['priority'] === 'HIGH' ? 30 : 20);
            $userClass->addXP($_SESSION['user_id'], $xp, 'Tarefa concluída: ' . $task['title']);
            setFlash('success', 'Tarefa concluída! +' . $xp . ' XP');
        }

        redirect('project.php?id=' . $projectId);
    }
}

// Get tasks grouped by status
$tasks = $db->query(
    "SELECT t.*, u.first_name, u.last_name, u.avatar
     FROM tasks t
     LEFT JOIN users u ON t.assigned_to = u.id
     WHERE t.project_id = :project_id
     ORDER BY t.priority DESC, t.due_date ASC",
    ['project_id' => $projectId]
);

$tasksByStatus = [
    'TODO' => [],
    'IN_PROGRESS' => [],
    'IN_REVIEW' => [],
    'DONE' => []
];

foreach ($tasks as $task) {
    $tasksByStatus[$task['status']][] = $task;
}

// Get project members
$members = $db->query(
    "SELECT u.id, u.first_name, u.last_name, u.avatar, u.position, pm.role
     FROM users u
     JOIN project_members pm ON u.id = pm.user_id
     WHERE pm.project_id = :project_id
     ORDER BY pm.role DESC, u.first_name",
    ['project_id' => $projectId]
);

// Progress calculation
$progress = $project['total_tasks'] > 0
    ? round(($project['completed_tasks'] / $project['total_tasks']) * 100)
    : 0;

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

$getTaskStatusLabel = function($status) {
    switch ($status) {
        case 'TODO': return 'A Fazer';
        case 'IN_PROGRESS': return 'Em Andamento';
        case 'IN_REVIEW': return 'Em Revisão';
        case 'DONE': return 'Concluído';
        default: return $status;
    }
};

$getTaskStatusColor = function($status) {
    switch ($status) {
        case 'TODO': return 'bg-gray-100 text-gray-800';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
        case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
        case 'DONE': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
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

$getPriorityLabel = function($priority) {
    switch ($priority) {
        case 'URGENT': return 'Urgente';
        case 'HIGH': return 'Alta';
        case 'MEDIUM': return 'Média';
        case 'LOW': return 'Baixa';
        default: return $priority;
    }
};
?>

<div class="mb-6">
    <a href="projects.php" class="inline-flex items-center text-gray-500 hover:text-maternar-pink mb-4">
        <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
        Voltar para projetos
    </a>
</div>

<!-- Project Header -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 text-sm font-medium rounded-full <?= $getStatusColor($project['status']) ?>">
                    <?= $getStatusLabel($project['status']) ?>
                </span>
                <?php if ($project['priority'] === 'URGENT' || $project['priority'] === 'HIGH'): ?>
                <span class="flex items-center <?= $getPriorityColor($project['priority']) ?>">
                    <i data-lucide="alert-triangle" class="w-4 h-4 mr-1"></i>
                    <?= $getPriorityLabel($project['priority']) ?>
                </span>
                <?php endif; ?>
            </div>
            <h1 class="text-2xl font-bold text-gray-800"><?= sanitize($project['name']) ?></h1>
            <?php if ($project['description']): ?>
            <p class="text-gray-600 mt-2"><?= nl2br(sanitize($project['description'])) ?></p>
            <?php endif; ?>
        </div>
        <?php if ($membership['role'] === 'OWNER' || $currentUser['role'] === 'ADMIN'): ?>
        <a href="project-edit.php?id=<?= $project['id'] ?>" class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i data-lucide="settings" class="w-5 h-5 mr-2"></i>
            Configurações
        </a>
        <?php endif; ?>
    </div>

    <!-- Progress -->
    <div class="mt-6 pt-6 border-t border-gray-100">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">Progresso do Projeto</span>
            <span class="font-medium"><?= $progress ?>%</span>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-maternar-pink rounded-full transition-all duration-500" style="width: <?= $progress ?>%"></div>
        </div>
        <div class="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div class="flex items-center gap-4">
                <span><i data-lucide="check-square" class="w-4 h-4 inline mr-1"></i><?= $project['completed_tasks'] ?>/<?= $project['total_tasks'] ?> tarefas</span>
                <span><i data-lucide="users" class="w-4 h-4 inline mr-1"></i><?= $project['member_count'] ?> membros</span>
            </div>
            <?php if ($project['due_date']): ?>
            <span><i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>Prazo: <?= formatDate($project['due_date']) ?></span>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Kanban Board -->
    <div class="lg:col-span-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <?php foreach (['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as $status): ?>
            <div class="bg-gray-50 rounded-xl p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800"><?= $getTaskStatusLabel($status) ?></h3>
                    <span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                        <?= count($tasksByStatus[$status]) ?>
                    </span>
                </div>
                <div class="space-y-3">
                    <?php foreach ($tasksByStatus[$status] as $task): ?>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs <?= $getPriorityColor($task['priority']) ?> font-medium">
                                <?= $getPriorityLabel($task['priority']) ?>
                            </span>
                            <?php if ($task['due_date']): ?>
                            <span class="text-xs text-gray-500"><?= formatDate($task['due_date']) ?></span>
                            <?php endif; ?>
                        </div>
                        <h4 class="font-medium text-gray-800 mb-2"><?= sanitize($task['title']) ?></h4>
                        <?php if ($task['description']): ?>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2"><?= sanitize($task['description']) ?></p>
                        <?php endif; ?>
                        <div class="flex items-center justify-between">
                            <?php if ($task['first_name']): ?>
                            <div class="flex items-center gap-2">
                                <?php if ($task['avatar']): ?>
                                <img src="<?= sanitize($task['avatar']) ?>" alt="" class="w-6 h-6 rounded-full">
                                <?php else: ?>
                                <div class="w-6 h-6 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                                    <span class="text-maternar-pink text-xs font-medium"><?= strtoupper(substr($task['first_name'], 0, 1)) ?></span>
                                </div>
                                <?php endif; ?>
                                <span class="text-xs text-gray-500"><?= sanitize($task['first_name']) ?></span>
                            </div>
                            <?php else: ?>
                            <span class="text-xs text-gray-400">Não atribuído</span>
                            <?php endif; ?>

                            <?php if ($status !== 'DONE'): ?>
                            <form method="POST" class="inline">
                                <input type="hidden" name="task_id" value="<?= $task['id'] ?>">
                                <input type="hidden" name="status" value="<?= $status === 'TODO' ? 'IN_PROGRESS' : ($status === 'IN_PROGRESS' ? 'IN_REVIEW' : 'DONE') ?>">
                                <button type="submit" name="update_task" class="text-maternar-pink hover:bg-maternar-pink/10 p-1 rounded transition-colors" title="Avançar">
                                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                </button>
                            </form>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>

                    <?php if (empty($tasksByStatus[$status])): ?>
                    <div class="text-center py-8 text-gray-400">
                        <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2"></i>
                        <p class="text-sm">Nenhuma tarefa</p>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-1 space-y-6">
        <!-- Add Task -->
        <?php if ($membership['role'] === 'OWNER' || $membership['role'] === 'MEMBER' || $currentUser['role'] === 'ADMIN'): ?>
        <a href="task-create.php?project=<?= $project['id'] ?>" class="block w-full px-4 py-3 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors text-center font-medium">
            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
            Nova Tarefa
        </a>
        <?php endif; ?>

        <!-- Members -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100">
                <h3 class="font-semibold text-gray-800">Membros</h3>
            </div>
            <div class="divide-y divide-gray-100">
                <?php foreach ($members as $member): ?>
                <div class="p-4 flex items-center gap-3">
                    <?php if ($member['avatar']): ?>
                    <img src="<?= sanitize($member['avatar']) ?>" alt="" class="w-10 h-10 rounded-full">
                    <?php else: ?>
                    <div class="w-10 h-10 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                        <span class="text-maternar-pink font-medium"><?= strtoupper(substr($member['first_name'], 0, 1)) ?></span>
                    </div>
                    <?php endif; ?>
                    <div class="flex-grow min-w-0">
                        <p class="font-medium text-gray-800 truncate"><?= sanitize($member['first_name'] . ' ' . $member['last_name']) ?></p>
                        <p class="text-xs text-gray-500"><?= sanitize($member['position'] ?? ($member['role'] === 'OWNER' ? 'Responsável' : 'Membro')) ?></p>
                    </div>
                    <?php if ($member['role'] === 'OWNER'): ?>
                    <i data-lucide="crown" class="w-4 h-4 text-yellow-500 flex-shrink-0"></i>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Stats -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 class="font-semibold text-gray-800 mb-4">Estatísticas</h3>
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">A Fazer</span>
                    <span class="font-medium"><?= count($tasksByStatus['TODO']) ?></span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Em Andamento</span>
                    <span class="font-medium"><?= count($tasksByStatus['IN_PROGRESS']) ?></span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Em Revisão</span>
                    <span class="font-medium"><?= count($tasksByStatus['IN_REVIEW']) ?></span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">Concluídas</span>
                    <span class="font-medium text-green-600"><?= count($tasksByStatus['DONE']) ?></span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
