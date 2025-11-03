<?php
/**
 * Контроллер страницы Privacy Policy
 */

class PrivacyController {
    /**
     * Страница Privacy Policy
     */
    public function index() {
        $language = getLanguage();
        $isRomanian = $language === 'ro';

        // SEO метаданные
        $seoTitle = $isRomanian 
            ? 'Politica de confidențialitate MDent.md | Protecția datelor personale în Moldova'
            : 'Политика конфиденциальности MDent.md | Защита персональных данных в Молдове';

        $seoDescription = $isRomanian
            ? 'Politica de confidențialitate și protecția datelor personale MDent.md. Aflați cum colectăm, stocăm și procesăm informațiile dvs. în conformitate cu GDPR și legislația Moldovei.'
            : 'Политика конфиденциальности и защиты персональных данных MDent.md. Узнайте, как мы собираем, храним и обрабатываем вашу информацию в соответствии с GDPR и законодательством Молдовы.';

        $seoKeywords = $isRomanian
            ? 'politică confidențialitate, protecția datelor moldova, GDPR moldova, date personale, privacy policy, procesare date, securitate date, legea 133/2011'
            : 'политика конфиденциальности, защита данных молдова, GDPR молдова, персональные данные, privacy policy, обработка данных, безопасность данных, закон 133/2011';

        $h1 = $isRomanian ? 'Politica de confidențialitate' : 'Политика приватности';
        $ogTitle = $isRomanian 
            ? 'Politica de confidențialitate MDent.md'
            : 'Политика конфиденциальности MDent.md';

        $ogDescription = $isRomanian
            ? 'Aflați cum protejăm datele dvs. personale în conformitate cu GDPR și legislația Moldovei.'
            : 'Узнайте, как мы защищаем ваши персональные данные в соответствии с GDPR и законодательством Молдовы.';

        $canonical = BASE_URL . ($isRomanian ? '/ro/privacy' : '/privacy');

        ob_start();
        ?>
<div class="min-h-screen bg-white">
    <!-- Breadcrumbs -->
    <div class="bg-gray-50 border-b border-gray-200 pt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav class="flex items-center space-x-2 text-sm text-gray-600">
                <a href="<?= BASE_URL ?>/<?= $isRomanian ? 'ro' : '' ?>" class="hover:text-gray-900 transition-colors cursor-pointer">
                    <?= t('home') ?>
                </a>
                <span class="text-gray-400">/</span>
                <span class="text-gray-900 font-medium">
                    <?= $h1 ?>
                </span>
            </nav>
        </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            <?= $h1 ?>
        </h1>
        <p class="text-gray-600 mb-6">
            <?= $isRomanian
                ? 'Ultima actualizare: 23 septembrie 2025'
                : 'Последнее обновление: 23 сентября 2025' ?>
        </p>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <div class="prose prose-sm sm:prose md:prose-lg max-w-none">
                <!-- 1. Cine suntem / Кто мы -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '1. Cine suntem' : '1. Кто мы' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'MDent.md – portalul unic al clinicilor stomatologice din Republica Moldova ("MDent", "noi"). Suntem Operatorul de date cu caracter personal în sensul Legii nr. 133/2011 și al GDPR.'
                            : 'MDent.md — единый портал стоматологических клиник Республики Молдова ("MDent", "мы"). Мы являемся Оператором персональных данных в смысле Закона № 133/2011 и GDPR.' ?>
                    </p>
                </section>

                <!-- 2. Datele pe care le prelucrăm / Какие данные обрабатываем -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '2. Ce date prelucrăm' : '2. Какие данные мы обрабатываем' ?></h2>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700">
                        <li><?= $isRomanian ? 'Date de identificare clinică (denumire, adresă, telefon, website).' : 'Идентификационные данные клиники (название, адрес, телефон, сайт).' ?></li>
                        <li><?= $isRomanian ? 'Date de contact ale solicitantului (nume, telefon, email) la rezervare/verificare.' : 'Контактные данные заявителя (имя, телефон, email) при записи/верификации.' ?></li>
                        <li><?= $isRomanian ? 'Date tehnice (IP, tip dispozitiv, pagini vizualizate, cookie-uri necesare).' : 'Технические данные (IP, тип устройства, просмотренные страницы, необходимые cookie).' ?></li>
                    </ul>
                </section>

                <!-- 3. Scopuri și temei / Цели и основания -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '3. Scopuri și temei legal' : '3. Цели и правовые основания' ?></h2>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700">
                        <li><?= $isRomanian ? 'Furnizarea platformei și afișarea informațiilor despre clinici – interes legitim (art. 6(1)(f) GDPR).' : 'Предоставление платформы и отображение информации о клиниках — законный интерес (ст. 6(1)(f) GDPR).' ?></li>
                        <li><?= $isRomanian ? 'Procesarea cererilor de programare și verificare – executarea contractului/pas precontractual (art. 6(1)(b) GDPR).' : 'Обработка заявок на запись и верификацию — исполнение договора/преддоговорные меры (ст. 6(1)(b) GDPR).' ?></li>
                        <li><?= $isRomanian ? 'Comunicări privind statusul cererilor – interes legitim sau consimțământ, după caz.' : 'Коммуникации о статусе заявок — законный интерес или согласие, в зависимости от случая.' ?></li>
                        <li><?= $isRomanian ? 'Îmbunătățirea serviciului, securitate și prevenirea abuzurilor – interes legitim.' : 'Улучшение сервиса, безопасность и предотвращение злоупотреблений — законный интерес.' ?></li>
                        <li><?= $isRomanian ? 'Respectarea obligațiilor legale aplicabile în Republica Moldova.' : 'Соблюдение применимых юридических обязанностей в Республике Молдова.' ?></li>
                    </ul>
                </section>

                <!-- 4. Cookie-uri / Cookies -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '4. Cookie-uri' : '4. Cookie‑файлы' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'Folosim cookie-uri strict necesare pentru funcționarea site-ului (autentificare, preferințe limbă, securitate). Nu folosim cookie-uri pentru publicitate comportamentală.'
                            : 'Мы используем строго необходимые cookie для работы сайта (аутентификация, языковые предпочтения, безопасность). Мы не используем cookie для поведенческой рекламы.' ?>
                    </p>
                </section>

                <!-- 5. Păstrarea datelor / Сроки хранения -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '5. Păstrarea datelor' : '5. Сроки хранения данных' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'Păstrăm datele doar cât este necesar pentru scopurile indicate sau cât impune legea. Datele cererilor (programări/verificări) se păstrează, de regulă, până la 24 luni.'
                            : 'Мы храним данные только столько, сколько необходимо для указанных целей или требуется законом. Данные заявок (запись/верификация) обычно хранятся до 24 месяцев.' ?>
                    </p>
                </section>

                <!-- 6. Dezvăluirea / Передача -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '6. Dezvăluirea datelor' : '6. Передача данных' ?></h2>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700">
                        <li><?= $isRomanian ? 'Prestatori IT (găzduire, mentenanță) sub acorduri de confidențialitate și protecție a datelor.' : 'IT‑подрядчики (хостинг, поддержка) по соглашениям о конфиденциальности и защите данных.' ?></li>
                        <li><?= $isRomanian ? 'Autorități publice, atunci când legea o cere.' : 'Госорганы — когда это требуется законом.' ?></li>
                        <li><?= $isRomanian ? 'Nu transferăm date în afara SEE fără garanții adecvate (clauze standard, nivel adecvat).' : 'Мы не передаем данные за пределы ЕЭЗ без надлежащих гарантий (стандартные положения, надлежащий уровень).' ?></li>
                    </ul>
                </section>

                <!-- 7. Drepturile persoanei vizate / Права субъекта -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '7. Drepturile dvs.' : '7. Ваши права' ?></h2>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700">
                        <li><?= $isRomanian ? 'Acces, rectificare, ștergere, restricționare, opoziție, portabilitate (conform GDPR și Legii nr. 133/2011).' : 'Доступ, исправление, удаление, ограничение, возражение, переносимость (по GDPR и Закону № 133/2011).' ?></li>
                        <li><?= $isRomanian ? 'Retragerea consimțământului (acolo unde a fost acordat), fără a afecta legalitatea prelucrării anterioare.' : 'Отзыв согласия (если было дано) без влияния на законность предыдущей обработки.' ?></li>
                        <li><?= $isRomanian ? 'Plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP).' : 'Жалоба в Национальный центр по защите персональных данных (CNPDCP).' ?></li>
                    </ul>
                </section>

                <!-- 8. Securitate / Безопасность -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '8. Securitatea datelor' : '8. Безопасность данных' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'Aplicăm măsuri tehnice și organizatorice adecvate (criptare în tranzit, control acces, jurnalizare, backup).'
                            : 'Мы применяем надлежащие технические и организационные меры (шифрование в транзите, контроль доступа, журналирование, резервные копии).' ?>
                    </p>
                </section>

                <!-- 9. Minori / Несовершеннолетние -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '9. Minori' : '9. Несовершеннолетние' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'MDent.md nu se adresează în mod intenționat copiilor sub 16 ani. Dacă sunteți părinte și considerați că copilul a furnizat date, contactați-ne.'
                            : 'MDent.md не предназначен для детей младше 16 лет. Если вы родитель и считаете, что ребенок предоставил данные, свяжитесь с нами.' ?>
                    </p>
                </section>

                <!-- 10. Contact / Контакты -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '10. Contact' : '10. Контакты' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'Operator: MDent.md – portal stomatologic al Republicii Moldova.'
                            : 'Оператор: MDent.md — стоматологический портал Республики Молдова.' ?>
                        <br>
                        <?= $isRomanian ? 'Email: ' : 'Email: ' ?><a href="mailto:privacy@mdent.md" class="text-blue-600 hover:text-blue-800">privacy@mdent.md</a>
                    </p>
                </section>

                <!-- 11. Modificări / Изменения политики -->
                <section class="mb-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-3"><?= $isRomanian ? '11. Modificări ale politicii' : '11. Изменения политики' ?></h2>
                    <p class="text-gray-700 leading-relaxed">
                        <?= $isRomanian
                            ? 'Putem actualiza periodic această politică. Vom publica versiunea actuală pe MDent.md și vom indica data ultimei actualizări.'
                            : 'Мы можем периодически обновлять эту политику. Актуальная версия публикуется на MDent.md с указанием даты обновления.' ?>
                    </p>
                </section>
            </div>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();

// Подключаем layout
require __DIR__ . '/components/layout.php';
?>

