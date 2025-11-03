<?php
/**
 * Страница цен - шаблон
 */

ob_start();
?>
<div class="pricing-page">
    <div class="container">
        <h1><?= t('pricing') ?></h1>
        
        <?php if (empty($groupedServices)): ?>
            <div class="no-results">
                <p><?= t('noResults') ?></p>
            </div>
        <?php else: ?>
            <?php foreach ($groupedServices as $serviceName => $serviceList): ?>
                <div class="service-group">
                    <h2><?= e($serviceName) ?></h2>
                    <table class="pricing-table">
                        <thead>
                            <tr>
                                <th>Клиника</th>
                                <th>Город</th>
                                <th>Цена</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($serviceList as $service): ?>
                                <tr>
                                    <td>
                                        <a href="<?= BASE_URL ?>/clinic/<?= e($service['clinic_slug']) ?>">
                                            <?= e($service['clinic_name']) ?>
                                        </a>
                                    </td>
                                    <td><?= e($service['city_name']) ?></td>
                                    <td>
                                        <?php if ($service['price_type'] === 'from'): ?>
                                            <?= t('from') ?> 
                                        <?php endif; ?>
                                        <?= formatPrice($service['price'], $service['currency'], $language) ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';

