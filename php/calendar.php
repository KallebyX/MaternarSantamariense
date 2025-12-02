<?php
$pageTitle = 'Calendário';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get events for current month
$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('n');
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

// Validate month/year
if ($month < 1) { $month = 12; $year--; }
if ($month > 12) { $month = 1; $year++; }

$startDate = sprintf('%04d-%02d-01', $year, $month);
$endDate = date('Y-m-t', strtotime($startDate));

// Get events
$events = $db->query(
    "SELECT e.*, u.first_name, u.last_name
     FROM events e
     LEFT JOIN users u ON e.created_by = u.id
     WHERE (e.start_date BETWEEN :start AND :end OR e.end_date BETWEEN :start2 AND :end2)
       AND (e.is_public = true OR e.created_by = :user_id OR EXISTS (
           SELECT 1 FROM event_attendees ea WHERE ea.event_id = e.id AND ea.user_id = :user_id2
       ))
     ORDER BY e.start_date ASC",
    [
        'start' => $startDate,
        'end' => $endDate,
        'start2' => $startDate,
        'end2' => $endDate,
        'user_id' => $_SESSION['user_id'],
        'user_id2' => $_SESSION['user_id']
    ]
);

// Get upcoming events (next 7 days)
$today = date('Y-m-d');
$nextWeek = date('Y-m-d', strtotime('+7 days'));
$upcomingEvents = $db->query(
    "SELECT e.*, u.first_name, u.last_name,
            (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendee_count
     FROM events e
     LEFT JOIN users u ON e.created_by = u.id
     WHERE e.start_date BETWEEN :start AND :end
       AND (e.is_public = true OR e.created_by = :user_id OR EXISTS (
           SELECT 1 FROM event_attendees ea WHERE ea.event_id = e.id AND ea.user_id = :user_id2
       ))
     ORDER BY e.start_date ASC
     LIMIT 5",
    [
        'start' => $today,
        'end' => $nextWeek,
        'user_id' => $_SESSION['user_id'],
        'user_id2' => $_SESSION['user_id']
    ]
);

// Calendar helpers
$firstDayOfMonth = date('N', strtotime($startDate));
$daysInMonth = date('t', strtotime($startDate));
$monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Group events by date
$eventsByDate = [];
foreach ($events as $event) {
    $date = date('Y-m-d', strtotime($event['start_date']));
    if (!isset($eventsByDate[$date])) {
        $eventsByDate[$date] = [];
    }
    $eventsByDate[$date][] = $event;
}

$getTypeColor = function($type) {
    switch ($type) {
        case 'MEETING': return 'bg-blue-500';
        case 'TRAINING': return 'bg-purple-500';
        case 'DEADLINE': return 'bg-red-500';
        case 'EVENT': return 'bg-green-500';
        case 'HOLIDAY': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

$getTypeLabel = function($type) {
    switch ($type) {
        case 'MEETING': return 'Reunião';
        case 'TRAINING': return 'Treinamento';
        case 'DEADLINE': return 'Prazo';
        case 'EVENT': return 'Evento';
        case 'HOLIDAY': return 'Feriado';
        default: return $type;
    }
};
?>

<div class="mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Calendário</h2>
            <p class="text-gray-500 mt-1">Acompanhe eventos e compromissos</p>
        </div>
        <?php if ($currentUser['role'] === 'ADMIN' || $currentUser['role'] === 'MANAGER'): ?>
        <a href="event-create.php" class="inline-flex items-center px-4 py-2 bg-maternar-pink text-white rounded-lg hover:bg-maternar-pink/90 transition-colors">
            <i data-lucide="plus" class="w-5 h-5 mr-2"></i>
            Novo Evento
        </a>
        <?php endif; ?>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Calendar -->
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Calendar Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
                <a href="?month=<?= $month - 1 ?>&year=<?= $year ?>" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <i data-lucide="chevron-left" class="w-5 h-5 text-gray-600"></i>
                </a>
                <h3 class="text-lg font-semibold text-gray-800">
                    <?= $monthNames[$month - 1] ?> <?= $year ?>
                </h3>
                <a href="?month=<?= $month + 1 ?>&year=<?= $year ?>" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-600"></i>
                </a>
            </div>

            <!-- Calendar Grid -->
            <div class="p-4">
                <!-- Weekday Headers -->
                <div class="grid grid-cols-7 gap-1 mb-2">
                    <?php foreach (['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as $day): ?>
                    <div class="text-center text-sm font-medium text-gray-500 py-2"><?= $day ?></div>
                    <?php endforeach; ?>
                </div>

                <!-- Days -->
                <div class="grid grid-cols-7 gap-1">
                    <?php
                    // Empty cells before first day
                    for ($i = 1; $i < $firstDayOfMonth; $i++):
                    ?>
                    <div class="h-24 p-1"></div>
                    <?php endfor; ?>

                    <?php
                    // Days of month
                    for ($day = 1; $day <= $daysInMonth; $day++):
                        $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $day);
                        $isToday = $dateStr === date('Y-m-d');
                        $dayEvents = $eventsByDate[$dateStr] ?? [];
                    ?>
                    <div class="h-24 p-1 border border-gray-100 rounded-lg <?= $isToday ? 'bg-maternar-pink/5 border-maternar-pink' : '' ?>">
                        <div class="text-sm font-medium <?= $isToday ? 'text-maternar-pink' : 'text-gray-700' ?> mb-1">
                            <?= $day ?>
                        </div>
                        <div class="space-y-1 overflow-y-auto max-h-16">
                            <?php foreach (array_slice($dayEvents, 0, 3) as $event): ?>
                            <div class="text-xs px-1 py-0.5 rounded truncate <?= $getTypeColor($event['type']) ?> text-white"
                                 title="<?= sanitize($event['title']) ?>">
                                <?= sanitize($event['title']) ?>
                            </div>
                            <?php endforeach; ?>
                            <?php if (count($dayEvents) > 3): ?>
                            <div class="text-xs text-gray-500">+<?= count($dayEvents) - 3 ?> mais</div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex flex-wrap gap-4">
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-blue-500"></div>
                <span class="text-sm text-gray-600">Reunião</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-purple-500"></div>
                <span class="text-sm text-gray-600">Treinamento</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-red-500"></div>
                <span class="text-sm text-gray-600">Prazo</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-green-500"></div>
                <span class="text-sm text-gray-600">Evento</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded bg-yellow-500"></div>
                <span class="text-sm text-gray-600">Feriado</span>
            </div>
        </div>
    </div>

    <!-- Upcoming Events -->
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                <i data-lucide="calendar-clock" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                Próximos Eventos
            </h3>

            <?php if (empty($upcomingEvents)): ?>
            <div class="text-center py-8">
                <i data-lucide="calendar-x" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-500 text-sm">Nenhum evento nos próximos dias</p>
            </div>
            <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($upcomingEvents as $event): ?>
                <div class="border-l-4 <?= $getTypeColor($event['type']) ?> pl-3 py-2">
                    <h4 class="font-medium text-gray-800"><?= sanitize($event['title']) ?></h4>
                    <div class="flex items-center text-sm text-gray-500 mt-1">
                        <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                        <?= formatDate($event['start_date']) ?>
                        <?php if ($event['start_time']): ?>
                        às <?= date('H:i', strtotime($event['start_time'])) ?>
                        <?php endif; ?>
                    </div>
                    <?php if ($event['location']): ?>
                    <div class="flex items-center text-sm text-gray-500 mt-1">
                        <i data-lucide="map-pin" class="w-4 h-4 mr-1"></i>
                        <?= sanitize($event['location']) ?>
                    </div>
                    <?php endif; ?>
                    <div class="flex items-center text-sm text-gray-500 mt-1">
                        <i data-lucide="users" class="w-4 h-4 mr-1"></i>
                        <?= $event['attendee_count'] ?> participantes
                    </div>
                    <span class="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full <?= $getTypeColor($event['type']) ?> text-white">
                        <?= $getTypeLabel($event['type']) ?>
                    </span>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <!-- Today Button -->
            <div class="mt-6">
                <a href="?month=<?= date('n') ?>&year=<?= date('Y') ?>"
                   class="block w-full text-center px-4 py-2 border border-maternar-pink text-maternar-pink rounded-lg hover:bg-maternar-pink/5 transition-colors">
                    Ir para Hoje
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
