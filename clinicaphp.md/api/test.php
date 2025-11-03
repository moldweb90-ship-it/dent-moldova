<?php
/**
 * Простой тестовый API для диагностики
 */

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => 'ok',
    'message' => 'Test API works',
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'php' => PHP_VERSION,
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI']
], JSON_UNESCAPED_UNICODE);


