<?php
$pageTitle = 'Chat';
require_once __DIR__ . '/includes/header.php';
requireLogin();

$db = Database::getInstance();

// Get user's channels
$channels = $db->query(
    "SELECT c.*,
            (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) as member_count,
            (SELECT MAX(created_at) FROM messages WHERE channel_id = c.id) as last_message_at
     FROM channels c
     JOIN channel_members cm ON c.id = cm.channel_id
     WHERE cm.user_id = :user_id
     ORDER BY last_message_at DESC NULLS LAST, c.name ASC",
    ['user_id' => $_SESSION['user_id']]
);

// Get selected channel
$selectedChannelId = isset($_GET['channel']) ? (int)$_GET['channel'] : ($channels[0]['id'] ?? null);
$selectedChannel = null;

if ($selectedChannelId) {
    $selectedChannel = $db->queryOne(
        "SELECT c.* FROM channels c
         JOIN channel_members cm ON c.id = cm.channel_id
         WHERE c.id = :channel_id AND cm.user_id = :user_id",
        ['channel_id' => $selectedChannelId, 'user_id' => $_SESSION['user_id']]
    );
}

// Handle new message
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['message']) && $selectedChannel) {
    $message = trim($_POST['message']);
    if (!empty($message)) {
        $db->insert('messages', [
            'channel_id' => $selectedChannel['id'],
            'user_id' => $_SESSION['user_id'],
            'content' => $message,
            'created_at' => date('Y-m-d H:i:s')
        ]);

        // Redirect to prevent form resubmission
        redirect('chat.php?channel=' . $selectedChannel['id']);
    }
}

// Get messages for selected channel
$messages = [];
if ($selectedChannel) {
    $messages = $db->query(
        "SELECT m.*, u.first_name, u.last_name, u.avatar
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.channel_id = :channel_id
         ORDER BY m.created_at ASC
         LIMIT 100",
        ['channel_id' => $selectedChannel['id']]
    );
}

// Get channel members
$channelMembers = [];
if ($selectedChannel) {
    $channelMembers = $db->query(
        "SELECT u.id, u.first_name, u.last_name, u.avatar, u.position
         FROM users u
         JOIN channel_members cm ON u.id = cm.user_id
         WHERE cm.channel_id = :channel_id
         ORDER BY u.first_name",
        ['channel_id' => $selectedChannel['id']]
    );
}

// Group messages by date
$messagesByDate = [];
foreach ($messages as $message) {
    $date = date('Y-m-d', strtotime($message['created_at']));
    if (!isset($messagesByDate[$date])) {
        $messagesByDate[$date] = [];
    }
    $messagesByDate[$date][] = $message;
}

$formatMessageDate = function($date) {
    $today = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));

    if ($date === $today) return 'Hoje';
    if ($date === $yesterday) return 'Ontem';
    return formatDate($date);
};
?>

<div class="flex h-[calc(100vh-8rem)] gap-6">
    <!-- Channels Sidebar -->
    <div class="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800 flex items-center">
                <i data-lucide="hash" class="w-5 h-5 mr-2 text-maternar-pink"></i>
                Canais
            </h3>
        </div>
        <div class="flex-grow overflow-y-auto">
            <?php foreach ($channels as $channel): ?>
            <a href="?channel=<?= $channel['id'] ?>"
               class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors <?= $selectedChannelId === $channel['id'] ? 'bg-maternar-pink/5 border-r-2 border-maternar-pink' : '' ?>">
                <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i data-lucide="<?= $channel['type'] === 'PRIVATE' ? 'lock' : 'hash' ?>" class="w-4 h-4 text-gray-500"></i>
                </div>
                <div class="flex-grow min-w-0">
                    <p class="font-medium text-gray-800 truncate"><?= sanitize($channel['name']) ?></p>
                    <p class="text-xs text-gray-500"><?= $channel['member_count'] ?> membros</p>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Chat Area -->
    <div class="flex-grow bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <?php if ($selectedChannel): ?>
        <!-- Channel Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i data-lucide="<?= $selectedChannel['type'] === 'PRIVATE' ? 'lock' : 'hash' ?>" class="w-5 h-5 mr-2 text-gray-400"></i>
                    <?= sanitize($selectedChannel['name']) ?>
                </h3>
                <?php if ($selectedChannel['description']): ?>
                <p class="text-sm text-gray-500 mt-1"><?= sanitize($selectedChannel['description']) ?></p>
                <?php endif; ?>
            </div>
            <div class="flex items-center gap-2">
                <button id="toggleMembers" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Membros">
                    <i data-lucide="users" class="w-5 h-5 text-gray-500"></i>
                </button>
            </div>
        </div>

        <div class="flex-grow flex overflow-hidden">
            <!-- Messages -->
            <div class="flex-grow flex flex-col overflow-hidden">
                <div id="messagesContainer" class="flex-grow overflow-y-auto p-4 space-y-4">
                    <?php if (empty($messages)): ?>
                    <div class="text-center py-12">
                        <i data-lucide="message-circle" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                        <h4 class="font-medium text-gray-800">Nenhuma mensagem ainda</h4>
                        <p class="text-sm text-gray-500 mt-1">Seja o primeiro a enviar uma mensagem!</p>
                    </div>
                    <?php else: ?>
                    <?php foreach ($messagesByDate as $date => $dayMessages): ?>
                    <div class="flex items-center gap-4 my-4">
                        <div class="flex-grow h-px bg-gray-200"></div>
                        <span class="text-xs text-gray-500 font-medium"><?= $formatMessageDate($date) ?></span>
                        <div class="flex-grow h-px bg-gray-200"></div>
                    </div>
                    <?php foreach ($dayMessages as $message): ?>
                    <div class="flex items-start gap-3 <?= $message['user_id'] === $_SESSION['user_id'] ? 'flex-row-reverse' : '' ?>">
                        <?php if ($message['avatar']): ?>
                        <img src="<?= sanitize($message['avatar']) ?>" alt="" class="w-8 h-8 rounded-full flex-shrink-0">
                        <?php else: ?>
                        <div class="w-8 h-8 rounded-full bg-maternar-pink/10 flex items-center justify-center flex-shrink-0">
                            <span class="text-maternar-pink text-sm font-medium"><?= strtoupper(substr($message['first_name'], 0, 1)) ?></span>
                        </div>
                        <?php endif; ?>
                        <div class="max-w-[70%] <?= $message['user_id'] === $_SESSION['user_id'] ? 'text-right' : '' ?>">
                            <div class="flex items-center gap-2 mb-1 <?= $message['user_id'] === $_SESSION['user_id'] ? 'justify-end' : '' ?>">
                                <span class="text-sm font-medium text-gray-800">
                                    <?= $message['user_id'] === $_SESSION['user_id'] ? 'Você' : sanitize($message['first_name']) ?>
                                </span>
                                <span class="text-xs text-gray-400">
                                    <?= date('H:i', strtotime($message['created_at'])) ?>
                                </span>
                            </div>
                            <div class="inline-block px-4 py-2 rounded-2xl <?= $message['user_id'] === $_SESSION['user_id'] ? 'bg-maternar-pink text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm' ?>">
                                <?= nl2br(sanitize($message['content'])) ?>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <?php endforeach; ?>
                    <?php endif; ?>
                </div>

                <!-- Message Input -->
                <div class="p-4 border-t border-gray-100">
                    <form method="POST" class="flex items-center gap-3">
                        <input type="text" name="message" placeholder="Digite sua mensagem..."
                               class="flex-grow px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-maternar-pink focus:ring-1 focus:ring-maternar-pink"
                               autocomplete="off" required>
                        <button type="submit" class="p-2 bg-maternar-pink text-white rounded-full hover:bg-maternar-pink/90 transition-colors">
                            <i data-lucide="send" class="w-5 h-5"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Members Sidebar -->
            <div id="membersSidebar" class="w-64 border-l border-gray-100 p-4 hidden">
                <h4 class="font-medium text-gray-800 mb-4">Membros (<?= count($channelMembers) ?>)</h4>
                <div class="space-y-3">
                    <?php foreach ($channelMembers as $member): ?>
                    <div class="flex items-center gap-3">
                        <?php if ($member['avatar']): ?>
                        <img src="<?= sanitize($member['avatar']) ?>" alt="" class="w-8 h-8 rounded-full">
                        <?php else: ?>
                        <div class="w-8 h-8 rounded-full bg-maternar-pink/10 flex items-center justify-center">
                            <span class="text-maternar-pink text-sm font-medium"><?= strtoupper(substr($member['first_name'], 0, 1)) ?></span>
                        </div>
                        <?php endif; ?>
                        <div>
                            <p class="text-sm font-medium text-gray-800"><?= sanitize($member['first_name'] . ' ' . $member['last_name']) ?></p>
                            <?php if ($member['position']): ?>
                            <p class="text-xs text-gray-500"><?= sanitize($member['position']) ?></p>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php else: ?>
        <div class="flex-grow flex items-center justify-center">
            <div class="text-center">
                <i data-lucide="message-circle" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Selecione um canal</h3>
                <p class="text-gray-500">Escolha um canal para começar a conversar</p>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<script>
// Toggle members sidebar
document.getElementById('toggleMembers')?.addEventListener('click', function() {
    document.getElementById('membersSidebar').classList.toggle('hidden');
});

// Scroll to bottom of messages
const messagesContainer = document.getElementById('messagesContainer');
if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Auto-refresh messages every 5 seconds
<?php if ($selectedChannel): ?>
setInterval(function() {
    // In a production app, you would use AJAX or WebSockets here
    // For simplicity, we'll just reload the page
    // location.reload();
}, 30000);
<?php endif; ?>
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
