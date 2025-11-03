<?php
/**
 * Страница клиники - шаблон
 */

ob_start();
?>
<div class="clinic-page">
    <div class="container">
        <!-- Заголовок -->
        <div class="clinic-header">
            <div class="clinic-logo-large">
                <?php if ($clinic['logo_url']): ?>
                    <img src="<?= imageUrl($clinic['logo_url']) ?>" alt="<?= e($clinic["name_{$language}"]) ?>">
                <?php else: ?>
                    <div class="logo-placeholder"><?= mb_substr($clinic["name_{$language}"], 0, 1) ?></div>
                <?php endif; ?>
            </div>
            
            <div class="clinic-header-info">
                <h1><?= e($clinic["name_{$language}"]) ?></h1>
                
                <?php if ($clinic['verified']): ?>
                    <span class="badge verified"><?= t('verified') ?></span>
                <?php endif; ?>
                
                <div class="clinic-location">
                    <span><?= e($clinic['city_name']) ?></span>
                    <?php if ($clinic['district_name']): ?>
                        <span> → <?= e($clinic['district_name']) ?></span>
                    <?php endif; ?>
                </div>
                
                <?php if ($clinic['address_' . $language]): ?>
                    <div class="clinic-address">
                        📍 <?= e($clinic['address_' . $language]) ?>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="clinic-rating-large">
                <div class="d-score-large">
                    <strong><?= $clinic['d_score'] ?></strong>
                    <span>/100</span>
                </div>
                <p><?= t('overallRating') ?></p>
            </div>
        </div>
        
        <!-- Детальная информация -->
        <div class="clinic-details">
            <div class="clinic-main">
                <!-- Контакты -->
                <div class="section">
                    <h2><?= t('contact') ?></h2>
                    <?php if ($clinic['phone']): ?>
                        <p><strong><?= t('phone') ?>:</strong> 
                            <a href="tel:<?= e($clinic['phone']) ?>"><?= e($clinic['phone']) ?></a>
                        </p>
                    <?php endif; ?>
                    
                    <?php if ($clinic['website']): ?>
                        <p><strong><?= t('website') ?>:</strong> 
                            <a href="<?= e($clinic['website']) ?>" target="_blank"><?= e($clinic['website']) ?></a>
                        </p>
                    <?php endif; ?>
                </div>
                
                <!-- Услуги -->
                <?php if (!empty($services)): ?>
                    <div class="section">
                        <h2><?= t('services') ?></h2>
                        <div class="services-list">
                            <?php foreach ($services as $service): ?>
                                <div class="service-item">
                                    <span class="service-name"><?= e($service['name']) ?></span>
                                    <span class="service-price">
                                        <?php if ($service['price_type'] === 'from'): ?>
                                            <?= t('from') ?> 
                                        <?php endif; ?>
                                        <?= formatPrice($service['price'], $service['currency'], $language) ?>
                                    </span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="clinic-sidebar">
                <!-- Рейтинги -->
                <div class="section">
                    <h3><?= t('overallRating') ?></h3>
                    <div class="ratings-list">
                        <div class="rating-item">
                            <span><?= t('trust') ?></span>
                            <span class="rating-value"><?= $clinic['trust_index'] ?>/100</span>
                        </div>
                        <div class="rating-item">
                            <span><?= t('reviews') ?></span>
                            <span class="rating-value"><?= $clinic['reviews_index'] ?>/100</span>
                        </div>
                        <div class="rating-item">
                            <span><?= t('access') ?></span>
                            <span class="rating-value"><?= $clinic['access_index'] ?>/100</span>
                        </div>
                        <div class="rating-item">
                            <span><?= t('prices') ?></span>
                            <span class="rating-value"><?= $clinic['price_index'] ?>/100</span>
                        </div>
                    </div>
                </div>
                
                <!-- Действия -->
                <div class="clinic-actions-large">
                    <?php if ($clinic['phone']): ?>
                        <a href="tel:<?= e($clinic['phone']) ?>" class="btn btn-primary btn-block">
                            <?= t('call') ?>
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($clinic['booking_url']): ?>
                        <a href="<?= e($clinic['booking_url']) ?>" class="btn btn-success btn-block" target="_blank">
                            <?= t('bookAppointment') ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>
<?php
$content = ob_get_clean();
$seoTitle = $clinic["seo_title_{$language}"] ?? $clinic["name_{$language}"] . ' - ' . t('siteName');
$seoDescription = $clinic["seo_description_{$language}"] ?? $clinic["address_{$language}"] ?? '';
require __DIR__ . '/../layout.php';

