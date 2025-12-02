<?php
/**
 * Notifications API
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
            // Get notifications
            $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === '1';
            $limit = min((int)($_GET['limit'] ?? 20), 50);

            $sql = "SELECT * FROM notifications WHERE user_id = :user_id";
            $params = ['user_id' => $userId];

            if ($unreadOnly) {
                $sql .= " AND read_at IS NULL";
            }

            $sql .= " ORDER BY created_at DESC LIMIT :limit";
            $params['limit'] = $limit;

            $notifications = $db->query($sql, $params);

            // Get unread count
            $unreadCount = $db->queryOne(
                "SELECT COUNT(*) as count FROM notifications WHERE user_id = :user_id AND read_at IS NULL",
                ['user_id' => $userId]
            );

            echo json_encode([
                'success' => true,
                'notifications' => $notifications,
                'unread_count' => (int)$unreadCount['count']
            ]);
            break;

        case 'read':
            // Mark notification as read
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $notificationId = (int)($input['notification_id'] ?? 0);

            if (!$notificationId) {
                throw new Exception('Notification ID required');
            }

            $db->execute(
                "UPDATE notifications SET read_at = :read_at WHERE id = :id AND user_id = :user_id",
                ['read_at' => date('Y-m-d H:i:s'), 'id' => $notificationId, 'user_id' => $userId]
            );

            echo json_encode(['success' => true]);
            break;

        case 'read_all':
            // Mark all notifications as read
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }

            $db->execute(
                "UPDATE notifications SET read_at = :read_at WHERE user_id = :user_id AND read_at IS NULL",
                ['read_at' => date('Y-m-d H:i:s'), 'user_id' => $userId]
            );

            echo json_encode(['success' => true]);
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
