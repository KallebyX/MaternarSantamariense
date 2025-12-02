<?php
/**
 * Maternar Santamariense - Configuração do Banco de Dados
 */

// PostgreSQL Configuration
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'maternar_santamariense');
define('DB_USER', 'postgres');
define('DB_PASS', 'postgres');
define('DB_CHARSET', 'utf8');

// Connection string for PostgreSQL
define('DB_DSN', 'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME);

// PDO Options
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);
