<?php
$pageTitle = 'Novo Evento';
require_once __DIR__ . '/includes/header.php';
requireLogin();

// Check permission
if (!in_array($currentUser['role'], ['ADMIN', 'MANAGER'])) {
    setFlash('error', 'Você não tem permissão para criar eventos.');
    redirect('calendar.php');
}

$db = Database::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $type = $_POST['type'] ?? 'EVENT';
    $startDate = $_POST['start_date'] ?? '';
    $endDate = $_POST['end_date'] ?? $startDate;
    $startTime = $_POST['start_time'] ?? null;
    $endTime = $_POST['end_time'] ?? null;
    $location = trim($_POST['location'] ?? '');
    $isPublic = isset($_POST['is_public']);

    if ($title && $startDate) {
        $eventId = $db->insert('events', [
            'title' => $title,
            'description' => $description,
            'type' => $type,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start_time' => $startTime ?: null,
            'end_time' => $endTime ?: null,
            'location' => $location ?: null,
            'is_public' => $isPublic,
            'created_by' => $_SESSION['user_id'],
            'created_at' => date('Y-m-d H:i:s')
        ]);

        // Add creator as attendee
        $db->insert('event_attendees', [
            'event_id' => $eventId,
            'user_id' => $_SESSION['user_id'],
            'status' => 'CONFIRMED',
            'created_at' => date('Y-m-d H:i:s')
        ]);

        setFlash('success', 'Evento criado com sucesso!');
        redirect('calendar.php');
    } else {
        $error = 'Preencha todos os campos obrigatórios.';
    }
}
?>

<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <a href="calendar.php" class="inline-flex items-center text-gray-500 hover:text-maternar-pink">
            <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
            Voltar para calendário
        </a>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-maternar-pink/5 to-purple-500/5">
            <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <i data-lucide="calendar-plus" class="w-6 h-6 mr-3 text-maternar-pink"></i>
                Criar Novo Evento
            </h2>
            <p class="text-gray-500 mt-1">Preencha as informações do evento</p>
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
                       placeholder="Nome do evento">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea name="description" rows="3"
                          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink focus:ring-2 focus:ring-maternar-pink/20"
                          placeholder="Descrição do evento"></textarea>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento *</label>
                <select name="type" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                    <option value="EVENT">Evento</option>
                    <option value="MEETING">Reunião</option>
                    <option value="TRAINING">Treinamento</option>
                    <option value="DEADLINE">Prazo</option>
                    <option value="HOLIDAY">Feriado</option>
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
                    <input type="date" name="start_date" required
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Data de Término</label>
                    <input type="date" name="end_date"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Horário de Início</label>
                    <input type="time" name="start_time"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Horário de Término</label>
                    <input type="time" name="end_time"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Local</label>
                <input type="text" name="location"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maternar-pink"
                       placeholder="Local do evento">
            </div>

            <div class="flex items-center">
                <input type="checkbox" name="is_public" id="is_public" checked
                       class="w-4 h-4 text-maternar-pink border-gray-300 rounded focus:ring-maternar-pink">
                <label for="is_public" class="ml-2 text-sm text-gray-700">
                    Evento público (visível para todos os usuários)
                </label>
            </div>

            <div class="flex gap-4 pt-4">
                <button type="submit" class="flex-1 px-6 py-3 bg-maternar-pink text-white rounded-xl hover:bg-maternar-pink/90 transition-colors font-medium">
                    <i data-lucide="check" class="w-5 h-5 inline mr-2"></i>
                    Criar Evento
                </button>
                <a href="calendar.php" class="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Cancelar
                </a>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
