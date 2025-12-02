<?php
$pageTitle = 'Novo Projeto';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get all users for team selection
$users = $db->query(
    "SELECT id, first_name, last_name, department FROM users WHERE is_active = true ORDER BY first_name"
);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $priority = $_POST['priority'] ?? 'MEDIUM';
    $dueDate = $_POST['due_date'] ?: null;
    $members = $_POST['members'] ?? [];

    if ($name) {
        $projectId = $db->insert('projects', [
            'name' => $name,
            'description' => $description,
            'status' => 'PLANNING',
            'priority' => $priority,
            'due_date' => $dueDate,
            'created_by' => $_SESSION['user_id'],
            'created_at' => date('Y-m-d H:i:s')
        ]);

        // Add creator as owner
        $db->insert('project_members', [
            'project_id' => $projectId,
            'user_id' => $_SESSION['user_id'],
            'role' => 'OWNER',
            'joined_at' => date('Y-m-d H:i:s')
        ]);

        // Add other members
        foreach ($members as $memberId) {
            if ($memberId != $_SESSION['user_id']) {
                $db->insert('project_members', [
                    'project_id' => $projectId,
                    'user_id' => (int)$memberId,
                    'role' => 'MEMBER',
                    'joined_at' => date('Y-m-d H:i:s')
                ]);
            }
        }

        setFlash('success', 'Projeto criado com sucesso!');
        redirect('project.php?id=' . $projectId);
    } else {
        $error = 'O nome do projeto é obrigatório.';
    }
}
?>

<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <a href="projects.php" class="inline-flex items-center text-gray-500 hover:text-maternar-pink">
            <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
            Voltar para projetos
        </a>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-maternar-pink/5 to-purple-500/5">
            <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <i data-lucide="folder-plus" class="w-6 h-6 mr-3 text-maternar-pink"></i>
                Criar Novo Projeto
            </h2>
            <p class="text-gray-500 mt-1">Preencha as informações do projeto</p>
        </div>

        <?php if (isset($error)): ?>
        <div class="mx-6 mt-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <?= sanitize($error) ?>
        </div>
        <?php endif; ?>

        <form method="POST" class="p-6 space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Projeto *</label>
                <input type="text" name="name" required
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink focus:ring-2 focus:ring-maternar-pink/20"
                       placeholder="Nome do projeto">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea name="description" rows="4"
                          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink focus:ring-2 focus:ring-maternar-pink/20"
                          placeholder="Descreva o objetivo do projeto..."></textarea>
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
                <label class="block text-sm font-medium text-gray-700 mb-2">Equipe</label>
                <p class="text-sm text-gray-500 mb-3">Selecione os membros do projeto</p>
                <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2">
                    <?php foreach ($users as $user): ?>
                    <label class="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input type="checkbox" name="members[]" value="<?= $user['id'] ?>"
                               <?= $user['id'] === $_SESSION['user_id'] ? 'checked disabled' : '' ?>
                               class="w-4 h-4 text-maternar-pink border-gray-300 rounded focus:ring-maternar-pink">
                        <span class="ml-3 text-sm text-gray-700">
                            <?= sanitize($user['first_name'] . ' ' . $user['last_name']) ?>
                            <?php if ($user['department']): ?>
                            <span class="text-gray-400">- <?= sanitize($user['department']) ?></span>
                            <?php endif; ?>
                            <?php if ($user['id'] === $_SESSION['user_id']): ?>
                            <span class="text-maternar-pink">(Você - Responsável)</span>
                            <?php endif; ?>
                        </span>
                    </label>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="flex gap-4 pt-4">
                <button type="submit" class="flex-1 px-6 py-3 bg-maternar-pink text-white rounded-xl hover:bg-maternar-pink/90 transition-colors font-medium">
                    <i data-lucide="check" class="w-5 h-5 inline mr-2"></i>
                    Criar Projeto
                </button>
                <a href="projects.php" class="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Cancelar
                </a>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
