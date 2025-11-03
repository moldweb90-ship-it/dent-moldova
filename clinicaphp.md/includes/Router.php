<?php
/**
 * Маршрутизатор
 * 
 * Обрабатывает URL и определяет какой контроллер вызывать
 */

class Router {
    private $routes = [];
    private $currentRoute = null;
    
    /**
     * Добавить маршрут
     */
    public function add($pattern, $controller, $action = 'index') {
        $this->routes[] = [
            'pattern' => $pattern,
            'controller' => $controller,
            'action' => $action
        ];
    }
    
    /**
     * Обработать текущий запрос
     */
    public function dispatch() {
        // Если это API запрос, не обрабатываем здесь
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($requestUri, '/api/') !== false) {
            return; // API обрабатывается отдельно
        }
        
        $route = $this->getCurrentRoute();
        
        if (!$route) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        $controllerFile = __DIR__ . '/../components/' . $route['controller'] . '.php';
        
        if (!file_exists($controllerFile)) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        require $controllerFile;
        
        $controllerName = ucfirst($route['controller']) . 'Controller';
        $action = $route['action'];
        
        if (class_exists($controllerName)) {
            $controller = new $controllerName();
            if (method_exists($controller, $action)) {
                $controller->$action();
            } else {
                // Если метод не найден, пробуем index
                if (method_exists($controller, 'index')) {
                    $controller->index();
                } else {
                    http_response_code(404);
                    require __DIR__ . '/../components/error/404.php';
                }
            }
        } else {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
        }
    }
    
    /**
     * Получить текущий маршрут
     */
    private function getCurrentRoute() {
        $requestUri = $_SERVER['REQUEST_URI'];
        
        // Убираем префикс /clinicaphp.md если есть
        $requestUri = str_replace('/clinicaphp.md', '', $requestUri);
        
        // Парсим URL чтобы получить путь без query параметров
        $parsed = parse_url($requestUri);
        $requestUri = isset($parsed['path']) ? $parsed['path'] : '/';
        $requestUri = trim($requestUri, '/');
        
        // Если есть параметр route из .htaccess, используем его
        if (isset($_GET['route'])) {
            $requestUri = trim($_GET['route'], '/');
        }
        
        // Определяем язык по URL (только из URL, не из параметров)
        $language = 'ru';
        if ($requestUri === 'ro' || strpos($requestUri, 'ro/') === 0) {
            $language = 'ro';
            // Убираем префикс ro из пути
            if ($requestUri === 'ro') {
                $requestUri = ''; // Главная страница на румынском
            } else {
                $requestUri = substr($requestUri, 3); // Убираем 'ro/'
            }
        }
        
        // Сохраняем язык в сессии
        $_SESSION['language'] = $language;
        
        // Определяем маршрут
        foreach ($this->routes as $route) {
            $pattern = $route['pattern'];
            $pattern = str_replace('/', '\/', $pattern);
            $pattern = '/^' . str_replace(['{slug}', '{citySlug}', '{districtSlug}'], ['([^\/]+)', '([^\/]+)', '([^\/]+)'], $pattern) . '$/';
            
            if (preg_match($pattern, $requestUri, $matches)) {
                array_shift($matches); // Убрать первый элемент (полное совпадение)
                
                // Сохраняем параметры в $_GET для использования в контроллерах
                if (!empty($matches[0])) {
                    if (strpos($route['pattern'], '{slug}') !== false) {
                        $_GET['slug'] = $matches[0];
                    } elseif (strpos($route['pattern'], '{citySlug}') !== false) {
                        $_GET['citySlug'] = $matches[0];
                        if (isset($matches[1])) {
                            $_GET['districtSlug'] = $matches[1];
                        }
                    }
                }
                
                $this->currentRoute = [
                    'controller' => $route['controller'],
                    'action' => $route['action'],
                    'params' => $matches,
                    'language' => $language
                ];
                
                return $this->currentRoute;
            }
        }
        
        // Маршрут по умолчанию - главная страница
        if (empty($requestUri)) {
            $this->currentRoute = [
                'controller' => 'home',
                'action' => 'index',
                'params' => [],
                'language' => $language
            ];
            return $this->currentRoute;
        }
        
        return null;
    }
    
    /**
     * Получить текущий маршрут
     */
    public function getRoute() {
        return $this->currentRoute;
    }
}

