<?php
/**
 * User Class
 */
class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get user by ID
     */
    public function getById($id) {
        return $this->db->queryOne(
            "SELECT * FROM users WHERE id = :id",
            ['id' => $id]
        );
    }

    /**
     * Get user by email
     */
    public function getByEmail($email) {
        return $this->db->queryOne(
            "SELECT * FROM users WHERE email = :email",
            ['email' => strtolower($email)]
        );
    }

    /**
     * Get all users
     */
    public function getAll($limit = 100, $offset = 0) {
        return $this->db->query(
            "SELECT id, email, username, first_name, last_name, role, department, position,
                    avatar, total_xp, level, weekly_xp, current_streak, is_active, created_at
             FROM users
             ORDER BY created_at DESC
             LIMIT :limit OFFSET :offset",
            ['limit' => $limit, 'offset' => $offset]
        );
    }

    /**
     * Get users count
     */
    public function count() {
        return $this->db->count('users');
    }

    /**
     * Update user profile
     */
    public function updateProfile($userId, $data) {
        $allowedFields = ['first_name', 'last_name', 'department', 'position', 'avatar'];
        $updateData = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return ['success' => false, 'message' => 'Nenhum dado para atualizar.'];
        }

        $updateData['updated_at'] = date('Y-m-d H:i:s');

        try {
            $this->db->update('users', $updateData, 'id = :id', ['id' => $userId]);
            return ['success' => true, 'message' => 'Perfil atualizado com sucesso!'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erro ao atualizar perfil.'];
        }
    }

    /**
     * Update user (admin)
     */
    public function update($userId, $data) {
        $allowedFields = ['first_name', 'last_name', 'role', 'department', 'position', 'is_active'];
        $updateData = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return ['success' => false, 'message' => 'Nenhum dado para atualizar.'];
        }

        $updateData['updated_at'] = date('Y-m-d H:i:s');

        try {
            $this->db->update('users', $updateData, 'id = :id', ['id' => $userId]);
            return ['success' => true, 'message' => 'Usuário atualizado com sucesso!'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erro ao atualizar usuário.'];
        }
    }

    /**
     * Delete user
     */
    public function delete($userId) {
        try {
            $this->db->delete('users', 'id = :id', ['id' => $userId]);
            return ['success' => true, 'message' => 'Usuário removido com sucesso!'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erro ao remover usuário.'];
        }
    }

    /**
     * Add XP to user
     */
    public function addXP($userId, $amount, $reason = null) {
        $user = $this->getById($userId);
        if (!$user) return false;

        $newXP = $user['total_xp'] + $amount;
        $newLevel = calculateLevel($newXP);

        $this->db->execute(
            "UPDATE users SET
                total_xp = :total_xp,
                weekly_xp = weekly_xp + :amount,
                level = :level,
                updated_at = :updated_at
            WHERE id = :id",
            [
                'total_xp' => $newXP,
                'amount' => $amount,
                'level' => $newLevel,
                'updated_at' => date('Y-m-d H:i:s'),
                'id' => $userId
            ]
        );

        // Log XP gain
        if ($reason) {
            $this->logActivity($userId, 'xp_gain', $reason, ['amount' => $amount]);
        }

        return true;
    }

    /**
     * Get leaderboard
     */
    public function getLeaderboard($limit = 10) {
        return $this->db->query(
            "SELECT id, first_name, last_name, avatar, total_xp, level, weekly_xp
             FROM users
             WHERE is_active = true
             ORDER BY total_xp DESC
             LIMIT :limit",
            ['limit' => $limit]
        );
    }

    /**
     * Get weekly leaderboard
     */
    public function getWeeklyLeaderboard($limit = 10) {
        return $this->db->query(
            "SELECT id, first_name, last_name, avatar, total_xp, level, weekly_xp
             FROM users
             WHERE is_active = true
             ORDER BY weekly_xp DESC
             LIMIT :limit",
            ['limit' => $limit]
        );
    }

    /**
     * Reset weekly XP (should be called by cron job)
     */
    public function resetWeeklyXP() {
        $this->db->execute("UPDATE users SET weekly_xp = 0");
    }

    /**
     * Log user activity
     */
    public function logActivity($userId, $type, $description, $metadata = []) {
        $this->db->insert('activity_logs', [
            'user_id' => $userId,
            'type' => $type,
            'description' => $description,
            'metadata' => json_encode($metadata),
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Get user activities
     */
    public function getActivities($userId, $limit = 20) {
        return $this->db->query(
            "SELECT * FROM activity_logs
             WHERE user_id = :user_id
             ORDER BY created_at DESC
             LIMIT :limit",
            ['user_id' => $userId, 'limit' => $limit]
        );
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar($userId, $file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Erro no upload do arquivo.'];
        }

        if ($file['size'] > MAX_UPLOAD_SIZE) {
            return ['success' => false, 'message' => 'Arquivo muito grande. Máximo: 5MB'];
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
            return ['success' => false, 'message' => 'Tipo de arquivo não permitido.'];
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'avatar_' . $userId . '_' . time() . '.' . $extension;
        $filepath = UPLOADS_PATH . '/avatars/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'message' => 'Erro ao salvar arquivo.'];
        }

        // Delete old avatar
        $user = $this->getById($userId);
        if ($user['avatar'] && file_exists(UPLOADS_PATH . '/avatars/' . basename($user['avatar']))) {
            unlink(UPLOADS_PATH . '/avatars/' . basename($user['avatar']));
        }

        // Update user
        $avatarUrl = APP_URL . '/uploads/avatars/' . $filename;
        $this->db->execute(
            "UPDATE users SET avatar = :avatar, updated_at = :updated_at WHERE id = :id",
            ['avatar' => $avatarUrl, 'updated_at' => date('Y-m-d H:i:s'), 'id' => $userId]
        );

        return ['success' => true, 'message' => 'Avatar atualizado!', 'avatar' => $avatarUrl];
    }
}
