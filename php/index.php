<?php
session_start();
require_once __DIR__ . '/config/config.php';

// Redirect to appropriate page
if (isLoggedIn()) {
    redirect(APP_URL . '/dashboard.php');
} else {
    redirect(APP_URL . '/login.php');
}
