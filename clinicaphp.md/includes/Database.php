<?php
/**
 * Класс для работы с базой данных
 * 
 * Обертка над PDO для удобной работы с MySQL
 */

class Database {
    private static $instance = null;
    private $pdo;
    private $prefix;
    
    private function __construct() {
        $config = require __DIR__ . '/../config/database.php';
        $this->prefix = $config['prefix'];
        
        try {
            $dsn = sprintf(
                "mysql:host=%s;dbname=%s;charset=%s",
                $config['host'],
                $config['dbname'],
                $config['charset']
            );
            
            $this->pdo = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                $config['options']
            );
        } catch (PDOException $e) {
            if (defined('DEBUG_MODE') && DEBUG_MODE) {
                die("Database connection failed: " . $e->getMessage());
            } else {
                die("Database connection failed");
            }
        }
    }
    
    /**
     * Получить единственный экземпляр класса (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Получить PDO объект
     */
    public function getPdo() {
        return $this->pdo;
    }
    
    /**
     * Получить префикс таблиц
     */
    public function getPrefix() {
        return $this->prefix;
    }
    
    /**
     * Добавить префикс к имени таблицы
     */
    public function table($name) {
        return $this->prefix . $name;
    }
    
    /**
     * Выполнить запрос SELECT
     */
    public function select($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        // Декодируем JSON поля для MySQL 5.6
        return array_map([$this, 'decodeJsonFields'], $results);
    }
    
    /**
     * Выполнить запрос SELECT и вернуть одну строку
     */
    public function selectOne($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        
        if ($result) {
            return $this->decodeJsonFields($result);
        }
        
        return null;
    }
    
    /**
     * Декодировать JSON поля для совместимости с MySQL 5.6
     */
    private function decodeJsonFields($row) {
        if (!is_array($row)) {
            return $row;
        }
        
        $jsonFields = ['languages', 'specializations', 'tags', 'promotional_labels', 'seo_schema_data'];
        
        foreach ($jsonFields as $field) {
            if (isset($row[$field]) && !empty($row[$field])) {
                $decoded = json_decode($row[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row[$field] = $decoded;
                } else {
                    $row[$field] = null;
                }
            } elseif (isset($row[$field]) && $row[$field] === '') {
                $row[$field] = null;
            }
        }
        
        return $row;
    }
    
    /**
     * Выполнить INSERT запрос
     */
    public function insert($table, $data) {
        $table = $this->table($table);
        
        // Кодируем JSON поля для MySQL 5.6
        $data = $this->encodeJsonFields($data);
        
        $fields = array_keys($data);
        $placeholders = array_map(function($field) {
            return ':' . $field;
        }, $fields);
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $table,
            implode(', ', $fields),
            implode(', ', $placeholders)
        );
        
        $stmt = $this->pdo->prepare($sql);
        $success = $stmt->execute($data);
        
        if (!$success) {
            $errorInfo = $stmt->errorInfo();
            throw new Exception('Database insert failed: ' . ($errorInfo[2] ?? 'Unknown error'));
        }
        
        return $this->pdo->lastInsertId();
    }
    
    /**
     * Кодировать JSON поля для совместимости с MySQL 5.6
     */
    private function encodeJsonFields($data) {
        $jsonFields = ['languages', 'specializations', 'tags', 'promotional_labels', 'seo_schema_data'];
        
        foreach ($jsonFields as $field) {
            if (isset($data[$field])) {
                if (is_array($data[$field]) || is_object($data[$field])) {
                    $data[$field] = json_encode($data[$field], JSON_UNESCAPED_UNICODE);
                } elseif ($data[$field] === null) {
                    $data[$field] = null;
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Выполнить UPDATE запрос
     */
    public function update($table, $data, $where, $whereParams = []) {
        $table = $this->table($table);
        
        // Кодируем JSON поля для MySQL 5.6
        $data = $this->encodeJsonFields($data);
        
        $set = [];
        
        foreach ($data as $field => $value) {
            $set[] = "$field = :$field";
        }
        
        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s",
            $table,
            implode(', ', $set),
            $where
        );
        
        $params = array_merge($data, $whereParams);
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }
    
    /**
     * Выполнить DELETE запрос
     */
    public function delete($table, $where, $params = []) {
        $table = $this->table($table);
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }
    
    /**
     * Подсчитать количество записей
     */
    public function count($table, $where = '1=1', $params = []) {
        $table = $this->table($table);
        $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$where}";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return (int)$result['count'];
    }
    
    /**
     * Начать транзакцию
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }
    
    /**
     * Подтвердить транзакцию
     */
    public function commit() {
        return $this->pdo->commit();
    }
    
    /**
     * Откатить транзакцию
     */
    public function rollback() {
        return $this->pdo->rollBack();
    }
    
    /**
     * Выполнить произвольный SQL запрос
     */
    public function query($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    /**
     * Получить настройку сайта по ключу
     */
    public function getSiteSetting($key) {
        $table = $this->table('site_settings');
        $sql = "SELECT * FROM {$table} WHERE `setting_key` = ? LIMIT 1";
        return $this->selectOne($sql, [$key]);
    }
    
    /**
     * Установить настройку сайта
     */
    public function setSiteSetting($key, $value) {
        $table = $this->table('site_settings');
        $existing = $this->getSiteSetting($key);
        
        if ($existing) {
            $sql = "UPDATE {$table} SET `setting_value` = ?, `updated_at` = NOW() WHERE `setting_key` = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$value, $key]);
            return $this->getSiteSetting($key);
        } else {
            $sql = "INSERT INTO {$table} (`setting_key`, `setting_value`) VALUES (?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$key, $value]);
            return $this->getSiteSetting($key);
        }
    }
    
    /**
     * Получить все настройки сайта
     */
    public function getAllSiteSettings() {
        $table = $this->table('site_settings');
        // Проверяем существование таблицы и структуру
        try {
            $sql = "SELECT * FROM {$table} ORDER BY `setting_key`";
            return $this->select($sql);
        } catch (PDOException $e) {
            // Если таблицы нет, возвращаем пустой массив
            if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), "Unknown column") !== false) {
                return [];
            }
            throw $e;
        }
    }
}

