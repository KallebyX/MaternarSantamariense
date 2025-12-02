<?php
$pageTitle = 'Usuários';
require_once __DIR__ . '/includes/header.php';
requireLogin();

// Only admin can access
if ($currentUser['role'] !== 'ADMIN') {
    setFlash('error', 'Acesso negado.');
    redirect('dashboard.php');
}

$db = Database::getInstance();
$userClass = new User();

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['toggle_status'])) {
        $userId = (int)$_POST['user_id'];
        if ($userId !== $_SESSION['user_id']) {
            $user = $userClass->getById($userId);
            if ($user) {
                $userClass->update($userId, ['is_active' => !$user['is_active']]);
                setFlash('success', 'Status do usuário atualizado.');
            }
        }
        redirect('users.php');
    }

    if (isset($_POST['update_role'])) {
        $userId = (int)$_POST['user_id'];
        $newRole = $_POST['role'];
        if ($userId !== $_SESSION['user_id'] && in_array($newRole, ['ADMIN', 'MANAGER', 'EMPLOYEE'])) {
            $userClass->update($userId, ['role' => $newRole]);
            setFlash('success', 'Função do usuário atualizada.');
        }
        redirect('users.php');
    }

    if (isset($_POST['delete_user'])) {
        $userId = (int)$_POST['user_id'];
        if ($userId !== $_SESSION['user_id']) {
            $userClass->delete($userId);
            setFlash('success', 'Usuário removido.');
        }
        redirect('users.php');
    }
}

// Get search/filter params
$search = trim($_GET['search'] ?? '');
$roleFilter = $_GET['role'] ?? '';
$statusFilter = $_GET['status'] ?? '';

// Build query
$sql = "SELECT id, email, username, first_name, last_name, role, department, position,
               avatar, total_xp, level, is_active, created_at
        FROM users WHERE 1=1";
$params = [];

if ($search) {
    $sql .= " AND (first_name ILIKE :search OR last_name ILIKE :search OR email ILIKE :search)";
    $params['search'] = '%' . $search . '%';
}

if ($roleFilter) {
    $sql .= " AND role = :role";
    $params['role'] = $roleFilter;
}

if ($statusFilter !== '') {
    $sql .= " AND is_active = :status";
    $params['status'] = $statusFilter === '1';
}

$sql .= " ORDER BY created_at DESC";

$users = $db->query($sql, $params);

// Stats
$stats = [
    'total' => count($users),
    'active' => count(array_filter($users, fn($u) => $u['is_active'])),
    'admins' => count(array_filter($users, fn($u) => $u['role'] === 'ADMIN')),
    'managers' => count(array_filter($users, fn($u) => $u['role'] === 'MANAGER'))
];

$getRoleLabel = function($role) {
    switch ($role) {
        case 'ADMIN': return 'Administrador';
        case 'MANAGER': return 'Gerente';
        case 'EMPLOYEE': return 'Colaborador';
        default: return $role;
    }
};

$getRoleColor = function($role) {
    switch ($role) {
        case 'ADMIN': return 'bg-purple-100 text-purple-800';
        case 'MANAGER': return 'bg-blue-100 text-blue-800';
        case 'EMPLOYEE': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
?>

<div class="mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
            <p class="text-gray-500 mt-1">Administre os usuários do sistema</p>
        </div>
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
                <i data-lucide="users" class="w-5 h-5 text-blue-600"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Ativos</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['active'] ?></p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i data-lucide="user-check" class="w-5 h-5 text-green-600"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Administradores</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['admins'] ?></p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i data-lucide="shield" class="w-5 h-5 text-purple-600"></i>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500">Gerentes</p>
                <p class="text-2xl font-bold text-gray-800"><?= $stats['managers'] ?></p>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i data-lucide="briefcase" class="w-5 h-5 text-yellow-600"></i>
            </div>
        </div>
    </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
    <form method="GET" class="flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
            <input type="text" name="search" value="<?= sanitize($search) ?>" placeholder="Buscar por nome ou email..."
                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink">
        </div>
        <div>
            <select name="role" class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                <option value="">Todas as funções</option>
                <option value="ADMIN" <?= $roleFilter === 'ADMIN' ? 'selected' : '' ?>>Administrador</option>
                <option value="MANAGER" <?= $roleFilter === 'MANAGER' ? 'selected' : '' ?>>Gerente</option>
                <option value="EMPLOYEE" <?= $roleFilter === 'EMPLOYEE' ? 'selected' : '' ?>>Colaborador</option>
            </select>
        </div>
        <div>
            <select name="status" class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maternar-pink">
                <option value="">Todos os status</option>
                <option value="1" <?= $statusFilter === '1' ? 'selected' : '' ?>>Ativos</option>
                <option value="0" <?= $statusFilter === '0' ? 'selected' : '' ?>>Inativos</option>
            </select>
        </div>
        <button type="submit" class="px-6 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
            Filtrar
        </button>
    </form>
</div>

<!-- Users Table -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP / Nível</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <?php foreach ($users as $user): ?>
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                            <?php if ($user['avatar']): ?>
                            <img src="<?= sanitize($user['avatar']) ?>" alt="" class="w-10 h-10 rounded-full">
                            <?php else: ?>
                            <div class="w-10 h-10 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                                <span class="text-maternar-pink font-medium"><?= strtoupper(substr($user['first_name'], 0, 1)) ?></span>
                            </div>
                            <?php endif; ?>
                            <div>
                                <p class="font-medium text-gray-800"><?= sanitize($user['first_name'] . ' ' . $user['last_name']) ?></p>
                                <p class="text-sm text-gray-500"><?= sanitize($user['email']) ?></p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-medium rounded-full <?= $getRoleColor($user['role']) ?>">
                            <?= $getRoleLabel($user['role']) ?>
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <p class="text-gray-800"><?= sanitize($user['department'] ?? '-') ?></p>
                        <p class="text-sm text-gray-500"><?= sanitize($user['position'] ?? '') ?></p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <p class="font-medium text-gray-800"><?= number_format($user['total_xp']) ?> XP</p>
                        <p class="text-sm text-gray-500">Nível <?= $user['level'] ?></p>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <?php if ($user['is_active']): ?>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Ativo</span>
                        <?php else: ?>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Inativo</span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <?php if ($user['id'] !== $_SESSION['user_id']): ?>
                        <div class="flex items-center justify-end gap-2">
                            <!-- Toggle Status -->
                            <form method="POST" class="inline">
                                <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                <button type="submit" name="toggle_status"
                                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="<?= $user['is_active'] ? 'Desativar' : 'Ativar' ?>">
                                    <i data-lucide="<?= $user['is_active'] ? 'user-x' : 'user-check' ?>"
                                       class="w-4 h-4 <?= $user['is_active'] ? 'text-red-500' : 'text-green-500' ?>"></i>
                                </button>
                            </form>

                            <!-- Change Role -->
                            <div class="relative inline-block" x-data="{ open: false }">
                                <button @click="open = !open" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Alterar função">
                                    <i data-lucide="shield" class="w-4 h-4 text-gray-500"></i>
                                </button>
                                <div x-show="open" @click.away="open = false"
                                     class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                    <?php foreach (['ADMIN' => 'Administrador', 'MANAGER' => 'Gerente', 'EMPLOYEE' => 'Colaborador'] as $role => $label): ?>
                                    <?php if ($role !== $user['role']): ?>
                                    <form method="POST">
                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                        <input type="hidden" name="role" value="<?= $role ?>">
                                        <button type="submit" name="update_role"
                                                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                                            <?= $label ?>
                                        </button>
                                    </form>
                                    <?php endif; ?>
                                    <?php endforeach; ?>
                                </div>
                            </div>

                            <!-- Delete -->
                            <form method="POST" class="inline" onsubmit="return confirm('Tem certeza que deseja remover este usuário?')">
                                <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                <button type="submit" name="delete_user" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Remover">
                                    <i data-lucide="trash-2" class="w-4 h-4 text-red-500"></i>
                                </button>
                            </form>
                        </div>
                        <?php else: ?>
                        <span class="text-sm text-gray-400">Você</span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <?php if (empty($users)): ?>
    <div class="p-12 text-center">
        <i data-lucide="users" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum usuário encontrado</h3>
        <p class="text-gray-500">Tente ajustar os filtros de busca.</p>
    </div>
    <?php endif; ?>
</div>

<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
