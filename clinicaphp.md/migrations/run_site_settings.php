<?php
/**
 * Скрипт для выполнения миграции таблицы настроек
 * Запустить один раз: php migrations/run_site_settings.php
 */

define('DENTAL_CMS', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';

$db = Database::getInstance();
$pdo = $db->getPdo();

try {
    // Проверяем существует ли таблица
    $tableName = $db->table('site_settings');
    $checkTable = $pdo->query("SHOW TABLES LIKE '{$tableName}'");
    
    if ($checkTable->rowCount() === 0) {
        echo "Создаем таблицу {$tableName}...\n";
        
        // Для MySQL 5.6 с utf8mb4 максимальная длина индекса - 191 символ
        $sql = "CREATE TABLE `{$tableName}` (
          `id` INT(11) NOT NULL AUTO_INCREMENT,
          `setting_key` VARCHAR(191) NOT NULL,
          `setting_value` TEXT DEFAULT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `idx_setting_key` (`setting_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($sql);
        echo "Таблица {$tableName} успешно создана!\n";
    } else {
        // Проверяем структуру таблицы
        echo "Таблица {$tableName} уже существует. Проверяем структуру...\n";
        $columns = $pdo->query("DESCRIBE {$tableName}");
        $cols = $columns->fetchAll(PDO::FETCH_ASSOC);
        
        $columnNames = array_column($cols, 'Field');
        
        // Проверяем наличие нужных столбцов
        if (!in_array('setting_key', $columnNames)) {
            echo "Добавляем столбец setting_key...\n";
            // Для MySQL 5.6 с utf8mb4 максимальная длина индекса - 191 символ
            $pdo->exec("ALTER TABLE {$tableName} ADD COLUMN `setting_key` VARCHAR(191) NOT NULL AFTER `id`");
            // Создаем уникальный индекс отдельно
            try {
                $pdo->exec("ALTER TABLE {$tableName} ADD UNIQUE KEY `idx_setting_key` (`setting_key`)");
            } catch (PDOException $e) {
                // Индекс может уже существовать
                if (strpos($e->getMessage(), 'Duplicate key name') === false) {
                    throw $e;
                }
            }
        } else {
            // Если столбец существует, проверяем его длину и индекс
            $colInfo = $pdo->query("SHOW COLUMNS FROM {$tableName} WHERE Field = 'setting_key'")->fetch(PDO::FETCH_ASSOC);
            if ($colInfo && strpos($colInfo['Type'], 'varchar(255)') !== false) {
                echo "Изменяем длину столбца setting_key на 191 для совместимости с MySQL 5.6...\n";
                $pdo->exec("ALTER TABLE {$tableName} MODIFY COLUMN `setting_key` VARCHAR(191) NOT NULL");
            }
            // Проверяем индекс
            $indexes = $pdo->query("SHOW INDEXES FROM {$tableName} WHERE Key_name = 'idx_setting_key'")->fetchAll();
            if (empty($indexes)) {
                echo "Создаем индекс idx_setting_key...\n";
                $pdo->exec("ALTER TABLE {$tableName} ADD UNIQUE KEY `idx_setting_key` (`setting_key`)");
            }
        }
        
        if (!in_array('setting_value', $columnNames)) {
            echo "Добавляем столбец setting_value...\n";
            $pdo->exec("ALTER TABLE {$tableName} ADD COLUMN `setting_value` TEXT DEFAULT NULL AFTER `setting_key`");
        }
        
        if (!in_array('created_at', $columnNames)) {
            echo "Добавляем столбец created_at...\n";
            $pdo->exec("ALTER TABLE {$tableName} ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `setting_value`");
        }
        
        if (!in_array('updated_at', $columnNames)) {
            echo "Добавляем столбец updated_at...\n";
            $pdo->exec("ALTER TABLE {$tableName} ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`");
        }
        
        echo "Структура таблицы проверена и обновлена!\n";
    }
    
    echo "Миграция завершена успешно!\n";
} catch (PDOException $e) {
    echo "Ошибка: " . $e->getMessage() . "\n";
    exit(1);
}

