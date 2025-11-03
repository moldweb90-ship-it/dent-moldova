<?php
/**
 * Страница города - шаблон
 */

ob_start();
?>
<div class="city-page">
    <div class="container">
        <h1><?= e($city["name_{$language}"]) ?></h1>
        
        <?php if (!empty($districts)): ?>
            <div class="districts-list">
                <h2>Районы:</h2>
                <ul>
                    <?php foreach ($districts as $district): ?>
                        <li>
                            <a href="<?= BASE_URL ?>/city/<?= e($city["slug_{$language}"]) ?>/<?= e($district["slug_{$language}"]) ?>">
                                <?= e($district["name_{$language}"]) ?>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
        
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
                            
                            <div class="clinic-meta">
                                <?php if ($clinic['district_name']): ?>
                                    <span class="district"><?= e($clinic['district_name']) ?></span>
                                <?php endif; ?>
                            </div>
                            
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

