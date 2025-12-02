<?php
/**
 * Authentication Class
 */
class Auth {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Register a new user
     */
    public function register($data) {
        // Validate data
        if (empty($data['email']) || empty($data['password']) || empty($data['first_name']) || empty($data['last_name'])) {
            return ['success' => false, 'message' => 'Todos os campos são obrigatórios.'];
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Email inválido.'];
        }

        if (strlen($data['password']) < PASSWORD_MIN_LENGTH) {
            return ['success' => false, 'message' => 'A senha deve ter pelo menos ' . PASSWORD_MIN_LENGTH . ' caracteres.'];
        }

        // Check if email already exists
        $existing = $this->db->queryOne(
            "SELECT id FROM users WHERE email = :email",
            ['email' => strtolower($data['email'])]
        );

        if ($existing) {
            return ['success' => false, 'message' => 'Este email já está cadastrado.'];
        }

        // Generate username from email
        $username = strtolower(explode('@', $data['email'])[0]);
        $username = preg_replace('/[^a-z0-9]/', '', $username);

        // Check if username exists and add number if needed
        $baseUsername = $username;
        $counter = 1;
        while ($this->db->queryOne("SELECT id FROM users WHERE username = :username", ['username' => $username])) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert user
        try {
            $userId = $this->db->insert('users', [
                'email' => strtolower($data['email']),
                'username' => $username,
                'password' => $hashedPassword,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'role' => $data['role'] ?? 'USER',
                'department' => $data['department'] ?? null,
                'position' => $data['position'] ?? null,
                'total_xp' => 0,
                'level' => 1,
                'weekly_xp' => 0,
                'current_streak' => 0,
                'longest_streak' => 0,
                'is_active' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            return ['success' => true, 'message' => 'Conta criada com sucesso!', 'user_id' => $userId];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erro ao criar conta. Tente novamente.'];
        }
    }

    /**
     * Login user
     */
    public function login($email, $password, $remember = false) {
        if (empty($email) || empty($password)) {
            return ['success' => false, 'message' => 'Email e senha são obrigatórios.'];
        }

        $user = $this->db->queryOne(
            "SELECT * FROM users WHERE email = :email AND is_active = true",
            ['email' => strtolower($email)]
        );

        if (!$user || !password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Email ou senha incorretos.'];
        }

        // Update last login and streak
        $this->updateLoginStreak($user['id']);

        // Set session
        $this->setSession($user);

        // Set remember me cookie
        if ($remember) {
            $this->setRememberToken($user['id']);
        }

        return ['success' => true, 'message' => 'Login realizado com sucesso!', 'user' => $this->sanitizeUser($user)];
    }

    /**
     * Logout user
     */
    public function logout() {
        // Remove remember token
        if (isset($_COOKIE['remember_token'])) {
            $this->db->execute(
                "UPDATE users SET remember_token = NULL WHERE id = :id",
                ['id' => $_SESSION['user_id'] ?? 0]
            );
            setcookie('remember_token', '', time() - 3600, '/');
        }

        // Destroy session
        session_unset();
        session_destroy();

        return ['success' => true, 'message' => 'Logout realizado com sucesso!'];
    }

    /**
     * Check if user is logged in
     */
    public function check() {
        if (isset($_SESSION['user_id'])) {
            return true;
        }

        // Check remember token
        if (isset($_COOKIE['remember_token'])) {
            $user = $this->db->queryOne(
                "SELECT * FROM users WHERE remember_token = :token AND is_active = true",
                ['token' => $_COOKIE['remember_token']]
            );

            if ($user) {
                $this->setSession($user);
                return true;
            }
        }

        return false;
    }

    /**
     * Get current user
     */
    public function user() {
        if (!$this->check()) {
            return null;
        }

        return $this->db->queryOne(
            "SELECT * FROM users WHERE id = :id",
            ['id' => $_SESSION['user_id']]
        );
    }

    /**
     * Update password
     */
    public function updatePassword($userId, $currentPassword, $newPassword) {
        $user = $this->db->queryOne("SELECT password FROM users WHERE id = :id", ['id' => $userId]);

        if (!$user || !password_verify($currentPassword, $user['password'])) {
            return ['success' => false, 'message' => 'Senha atual incorreta.'];
        }

        if (strlen($newPassword) < PASSWORD_MIN_LENGTH) {
            return ['success' => false, 'message' => 'A nova senha deve ter pelo menos ' . PASSWORD_MIN_LENGTH . ' caracteres.'];
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->db->execute(
            "UPDATE users SET password = :password, updated_at = :updated_at WHERE id = :id",
            ['password' => $hashedPassword, 'updated_at' => date('Y-m-d H:i:s'), 'id' => $userId]
        );

        return ['success' => true, 'message' => 'Senha atualizada com sucesso!'];
    }

    /**
     * Set session data
     */
    private function setSession($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_avatar'] = $user['avatar'];
    }

    /**
     * Set remember me token
     */
    private function setRememberToken($userId) {
        $token = bin2hex(random_bytes(32));
        $this->db->execute(
            "UPDATE users SET remember_token = :token WHERE id = :id",
            ['token' => $token, 'id' => $userId]
        );
        setcookie('remember_token', $token, time() + (86400 * 30), '/'); // 30 days
    }

    /**
     * Update login streak
     */
    private function updateLoginStreak($userId) {
        $user = $this->db->queryOne(
            "SELECT last_active, current_streak, longest_streak FROM users WHERE id = :id",
            ['id' => $userId]
        );

        $now = new DateTime();
        $lastActive = $user['last_active'] ? new DateTime($user['last_active']) : null;
        $currentStreak = (int) $user['current_streak'];
        $longestStreak = (int) $user['longest_streak'];

        if ($lastActive) {
            $diff = $now->diff($lastActive)->days;
            if ($diff === 1) {
                // Consecutive day
                $currentStreak++;
            } elseif ($diff > 1) {
                // Streak broken
                $currentStreak = 1;
            }
            // Same day - no change
        } else {
            $currentStreak = 1;
        }

        if ($currentStreak > $longestStreak) {
            $longestStreak = $currentStreak;
        }

        // Add XP for login streak
        $xpBonus = $currentStreak * XP_LOGIN_STREAK;

        $this->db->execute(
            "UPDATE users SET
                last_active = :last_active,
                current_streak = :current_streak,
                longest_streak = :longest_streak,
                total_xp = total_xp + :xp_bonus,
                weekly_xp = weekly_xp + :xp_bonus,
                updated_at = :updated_at
            WHERE id = :id",
            [
                'last_active' => $now->format('Y-m-d H:i:s'),
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'xp_bonus' => $xpBonus,
                'updated_at' => $now->format('Y-m-d H:i:s'),
                'id' => $userId
            ]
        );
    }

    /**
     * Remove sensitive data from user array
     */
    private function sanitizeUser($user) {
        unset($user['password']);
        unset($user['remember_token']);
        return $user;
    }
}
