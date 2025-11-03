<?php
/**
 * Страница 404
 */

http_response_code(404);
?>
<!DOCTYPE html>
<html lang="<?= getLanguage() ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - <?= t('siteName') ?></title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
    <div class="error-page">
        <div class="container">
            <h1>404</h1>
            <p>Страница не найдена</p>
            <a href="<?= BASE_URL ?>" class="btn btn-primary"><?= t('home') ?></a>
        </div>
    </div>
</body>
</html>


