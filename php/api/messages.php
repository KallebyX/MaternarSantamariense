<?php
/**
 * Messages API
 * Simple API for chat functionality
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Database.php';

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$db = Database::getInstance();
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get':
            // Get messages for a channel
            $channelId = (int)($_GET['channel_id'] ?? 0);
            $lastId = (int)($_GET['last_id'] ?? 0);

            if (!$channelId) {
                throw new Exception('Channel ID required');
            }

            // Verify membership
            $membership = $db->queryOne(
                "SELECT id FROM channel_members WHERE channel_id = :channel_id AND user_id = :user_id",
                ['channel_id' => $channelId, 'user_id' => $userId]
            );

            if (!$membership) {
                throw new Exception('Access denied');
            }

            // Get new messages
            $sql = "SELECT m.*, u.first_name, u.last_name, u.avatar
                    FROM messages m
                    JOIN users u ON m.user_id = u.id
                    WHERE m.channel_id = :channel_id";
            $params = ['channel_id' => $channelId];

            if ($lastId > 0) {
                $sql .= " AND m.id > :last_id";
                $params['last_id'] = $lastId;
            }

            $sql .= " ORDER BY m.created_at ASC LIMIT 100";

            $messages = $db->query($sql, $params);

            echo json_encode([
                'success' => true,
                'messages' => $messages
            ]);
            break;

        case 'send':
            // Send a new message
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $channelId = (int)($input['channel_id'] ?? 0);
            $content = trim($input['content'] ?? '');

            if (!$channelId || !$content) {
                throw new Exception('Channel ID and content required');
            }

            // Verify membership
            $membership = $db->queryOne(
                "SELECT id FROM channel_members WHERE channel_id = :channel_id AND user_id = :user_id",
                ['channel_id' => $channelId, 'user_id' => $userId]
            );

            if (!$membership) {
                throw new Exception('Access denied');
            }

            // Insert message
            $messageId = $db->insert('messages', [
                'channel_id' => $channelId,
                'user_id' => $userId,
                'content' => $content,
                'created_at' => date('Y-m-d H:i:s')
            ]);

            // Get the full message with user info
            $message = $db->queryOne(
                "SELECT m.*, u.first_name, u.last_name, u.avatar
                 FROM messages m
                 JOIN users u ON m.user_id = u.id
                 WHERE m.id = :id",
                ['id' => $messageId]
            );

            echo json_encode([
                'success' => true,
                'message' => $message
            ]);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
