<?php
/**
 * Страница района - шаблон
 */

ob_start();
?>
<div class="district-page">
    <div class="container">
        <h1><?= e($district["name_{$language}"]) ?>, <?= e($city["name_{$language}"]) ?></h1>
        
        <!-- Список клиник -->
        <div class="clinics-grid">
            <?php if (empty($clinics)): ?>
                <div class="no-results">
                    <p><?= t('noResults') ?></p>
                </div>
            <?php else: ?>
                <?php foreach ($clinics as $clinic): ?>
                    <div class="clinic-card">
                        <div class="clinic-logo">
                            <?php if ($clinic['logo_url']): ?>
                                <img src="<?= imageUrl($clinic['logo_url']) ?>" alt="<?= e($clinic["name_{$language}"]) ?>">
                            <?php else: ?>
                                <div class="logo-placeholder"><?= mb_substr($clinic["name_{$language}"], 0, 1) ?></div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="clinic-info">
                            <h3>
                                <a href="<?= BASE_URL ?>/clinic/<?= e($clinic['slug']) ?>">
                                    <?= e($clinic["name_{$language}"]) ?>
                                </a>
                            </h3>
                            
                            <?php if ($clinic['verified']): ?>
                                <span class="badge verified"><?= t('verified') ?></span>
                            <?php endif; ?>
                            
                            <div class="clinic-rating">
                                <div class="d-score">
                                    <strong><?= $clinic['d_score'] ?></strong>
                                    <span>/100</span>
                                </div>
                            </div>
                            
                            <div class="clinic-actions">
                                <a href="<?= BASE_URL ?>/clinic/<?= e($clinic['slug']) ?>" class="btn btn-primary">
                                    <?= t('viewDetails') ?>
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';

