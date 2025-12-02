<?php
$pageTitle = 'Nova Tarefa';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get project ID
$projectId = isset($_GET['project']) ? (int)$_GET['project'] : 0;

if (!$projectId) {
    setFlash('error', 'Projeto não especificado.');
    redirect('projects.php');
}

// Check if user is member of the project
$membership = $db->queryOne(
    "SELECT * FROM project_members WHERE project_id = :project_id AND user_id = :user_id",
    ['project_id' => $projectId, 'user_id' => $_SESSION['user_id']]
);

if (!$membership && $currentUser['role'] !== 'ADMIN') {
    setFlash('error', 'Você não tem acesso a este projeto.');
    redirect('projects.php');
}

// Get project
$project = $db->queryOne("SELECT * FROM projects WHERE id = :id", ['id' => $projectId]);

if (!$project) {
    setFlash('error', 'Projeto não encontrado.');
    redirect('projects.php');
}

// Get project members for assignment
$members = $db->query(
    "SELECT u.id, u.first_name, u.last_name
     FROM users u
     JOIN project_members pm ON u.id = pm.user_id
     WHERE pm.project_id = :project_id
     ORDER BY u.first_name",
    ['project_id' => $projectId]
);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $priority = $_POST['priority'] ?? 'MEDIUM';
    $assignedTo = $_POST['assigned_to'] ? (int)$_POST['assigned_to'] : null;
    $dueDate = $_POST['due_date'] ?: null;

    if ($title) {
        $db->insert('tasks', [
            'project_id' => $projectId,
            'title' => $title,
            'description' => $description,
            'priority' => $priority,
            'status' => 'TODO',
            'assigned_to' => $assignedTo,
            'due_date' => $dueDate,
            'created_by' => $_SESSION['user_id'],
            'created_at' => date('Y-m-d H:i:s')
        ]);

        setFlash('success', 'Tarefa criada com sucesso!');
        redirect('project.php?id=' . $projectId);
    } else {
        $error = 'O título da tarefa é obrigatório.';
    }
}
?>

<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <a href="project.php?id=<?= $projectId ?>" class="inline-flex items-center text-gray-500 hover:text-maternar-pink">
            <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
            Voltar para <?= sanitize($project['name']) ?>
        </a>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-maternar-pink/5 to-purple-500/5">
            <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <i data-lucide="plus-square" class="w-6 h-6 mr-3 text-maternar-pink"></i>
                Nova Tarefa
            </h2>
            <p class="text-gray-500 mt-1">Projeto: <?= sanitize($project['name']) ?></p>
        </div>

        <?php if (isset($error)): ?>
        <div class="mx-6 mt-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <?= sanitize($error) ?>
        </div>
        <?php endif; ?>

        <form method="POST" class="p-6 space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input type="text" name="title" required
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink focus:ring-2 focus:ring-maternar-pink/20"
                       placeholder="O que precisa ser feito?">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea name="description" rows="4"
                          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink focus:ring-2 focus:ring-maternar-pink/20"
                          placeholder="Detalhes da tarefa..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                    <select name="priority" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM" selected>Média</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prazo</label>
                    <input type="date" name="due_date"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Atribuir a</label>
                <select name="assigned_to" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                    <option value="">Não atribuído</option>
                    <?php foreach ($members as $member): ?>
                    <option value="<?= $member['id'] ?>" <?= $member['id'] === $_SESSION['user_id'] ? 'selected' : '' ?>>
                        <?= sanitize($member['first_name'] . ' ' . $member['last_name']) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="flex gap-4 pt-4">
                <button type="submit" class="flex-1 px-6 py-3 bg-maternar-pink text-white rounded-xl hover:bg-maternar-pink/90 transition-colors font-medium">
                    <i data-lucide="check" class="w-5 h-5 inline mr-2"></i>
                    Criar Tarefa
                </button>
                <a href="project.php?id=<?= $projectId ?>" class="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Cancelar
                </a>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
