<?php
session_start();
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

$auth = new Auth();
$auth->logout();

setFlash('success', 'Você saiu do sistema.');
redirect(APP_URL . '/login.php');
