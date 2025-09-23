import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { AddClinicModal } from '@/components/AddClinicModal';
import { Building2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function PrivacyPolicyPage() {
  const [, paramsRo] = useRoute('/ro/privacy');
  const isRomanian = !!paramsRo;
  const { t, changeLanguage } = useTranslation();
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    changeLanguage(isRomanian ? 'ro' : 'ru');
  }, [isRomanian, changeLanguage]);

  // Fetch site settings for logo
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      const settings = await response.json();
      
      // Convert array of settings to object
      const settingsMap = Array.isArray(settings)
        ? settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {})
        : settings || {};
      
      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Отслеживание скролла для анимированного меню
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = 64; // Высота меню - когда оно полностью исчезнет с экрана
      
      // Меню появляется только когда полностью скроллится за пределы экрана
      if (currentScrollY > headerHeight) {
        setIsHeaderVisible(true);
      }
      // Не скрываем меню при возврате в начало - оно остается видимым
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AddClinicModal 
        open={clinicFormOpen} 
        onClose={() => setClinicFormOpen(false)} 
      />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          isHeaderVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0'
        }`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href={isRomanian ? '/ro' : '/'}>
                  <button 
                    className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    title={siteSettings?.logoAlt || t('appTitle')}
                  >
                    {settingsLoading ? (
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : siteSettings?.logo ? (
                      <img 
                        src={siteSettings.logo} 
                        alt={siteSettings.logoAlt || t('appTitle')}
                        style={{ 
                          width: `${siteSettings.logoWidth || 100}px`,
                          height: 'auto'
                        }}
                        className="object-contain"
                      />
                    ) : (
                      <span>{t('appTitle')}</span>
                    )}
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                {/* Navigation Menu */}
                <Link href={isRomanian ? '/ro' : '/'}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>{t('clinicList')}</span>
                  </Button>
                </Link>
                
                {/* Language Toggle - moved before Add Clinic Button for mobile */}
                <div className="flex md:hidden">
                  <LanguageToggle />
                </div>
                
                {/* Add Clinic Button */}
                <Button
                  onClick={() => setClinicFormOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-1 px-2"
                  size="sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">{t('addClinic')}</span>
                </Button>
                
                {/* Language Toggle - for desktop */}
                <div className="hidden md:flex">
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-200 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href={isRomanian ? '/ro' : '/'}>
                <span className="hover:text-gray-900 transition-colors cursor-pointer">
                  {t('home')}
                </span>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {isRomanian ? 'Politica de confidențialitate' : 'Политика приватности'}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {isRomanian ? 'Politica de confidențialitate' : 'Политика приватности'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isRomanian
            ? 'Ultima actualizare: 23 septembrie 2025'
            : 'Последнее обновление: 23 сентября 2025'}
        </p>

        <Card>
          <CardContent className="prose prose-sm sm:prose md:prose-lg max-w-none pt-6">
            {/* 1. Cine suntem / Кто мы */}
            <section>
              <h2>{isRomanian ? '1. Cine suntem' : '1. Кто мы'}</h2>
              <p>
                {isRomanian
                  ? 'MDent.md – portalul unic al clinicilor stomatologice din Republica Moldova ("MDent", "noi").'
                  : 'MDent.md — единый портал стоматологических клиник Республики Молдова ("MDent", "мы").'}
                {' '}
                {isRomanian
                  ? 'Suntem Operatorul de date cu caracter personal în sensul Legii nr. 133/2011 și al GDPR.'
                  : 'Мы являемся Оператором персональных данных в смысле Закона № 133/2011 и GDPR.'}
              </p>
            </section>

            {/* 2. Datele pe care le prelucrăm / Какие данные обрабатываем */}
            <section>
              <h2>{isRomanian ? '2. Ce date prelucrăm' : '2. Какие данные мы обрабатываем'}</h2>
              <ul>
                <li>{isRomanian ? 'Date de identificare clinică (denumire, adresă, telefon, website).' : 'Идентификационные данные клиники (название, адрес, телефон, сайт).'}</li>
                <li>{isRomanian ? 'Date de contact ale solicitantului (nume, telefon, email) la rezervare/verificare.' : 'Контактные данные заявителя (имя, телефон, email) при записи/верификации.'}</li>
                <li>{isRomanian ? 'Date tehnice (IP, tip dispozitiv, pagini vizualizate, cookie-uri necesare).' : 'Технические данные (IP, тип устройства, просмотренные страницы, необходимые cookie).'}
                </li>
              </ul>
            </section>

            {/* 3. Scopuri și temei / Цели и основания */}
            <section>
              <h2>{isRomanian ? '3. Scopuri și temei legal' : '3. Цели и правовые основания'}</h2>
              <ul>
                <li>{isRomanian ? 'Furnizarea platformei și afișarea informațiilor despre clinici – interes legitim (art. 6(1)(f) GDPR).' : 'Предоставление платформы и отображение информации о клиниках — законный интерес (ст. 6(1)(f) GDPR).'}</li>
                <li>{isRomanian ? 'Procesarea cererilor de programare și verificare – executarea contractului/pas precontractual (art. 6(1)(b) GDPR).' : 'Обработка заявок на запись и верификацию — исполнение договора/преддоговорные меры (ст. 6(1)(b) GDPR).'}</li>
                <li>{isRomanian ? 'Comunicări privind statusul cererilor – interes legitim sau consimțământ, după caz.' : 'Коммуникации о статусе заявок — законный интерес или согласие, в зависимости от случая.'}</li>
                <li>{isRomanian ? 'Îmbunătățirea serviciului, securitate și prevenirea abuzurilor – interes legitim.' : 'Улучшение сервиса, безопасность и предотвращение злоупотреблений — законный интерес.'}</li>
                <li>{isRomanian ? 'Respectarea obligațiilor legale aplicabile în Republica Moldova.' : 'Соблюдение применимых юридических обязанностей в Республике Молдова.'}</li>
              </ul>
            </section>

            {/* 4. Cookie-uri / Cookies */}
            <section>
              <h2>{isRomanian ? '4. Cookie-uri' : '4. Cookie‑файлы'}</h2>
              <p>
                {isRomanian
                  ? 'Folosim cookie-uri strict necesare pentru funcționarea site-ului (autentificare, preferințe limbă, securitate). Nu folosim cookie-uri pentru publicitate comportamentală.'
                  : 'Мы используем строго необходимые cookie для работы сайта (аутентификация, языковые предпочтения, безопасность). Мы не используем cookie для поведенческой рекламы.'}
              </p>
            </section>

            {/* 5. Păstrarea datelor / Сроки хранения */}
            <section>
              <h2>{isRomanian ? '5. Păstrarea datelor' : '5. Сроки хранения данных'}</h2>
              <p>
                {isRomanian
                  ? 'Păstrăm datele doar cât este necesar pentru scopurile indicate sau cât impune legea. Datele cererilor (programări/verificări) se păstrează, de regulă, până la 24 luni.'
                  : 'Мы храним данные только столько, сколько необходимо для указанных целей или требуется законом. Данные заявок (запись/верификация) обычно хранятся до 24 месяцев.'}
              </p>
            </section>

            {/* 6. Dezvăluirea / Передача */}
            <section>
              <h2>{isRomanian ? '6. Dezvăluirea datelor' : '6. Передача данных'}</h2>
              <ul>
                <li>{isRomanian ? 'Prestatori IT (găzduire, mentenanță) sub acorduri de confidențialitate și protecție a datelor.' : 'IT‑подрядчики (хостинг, поддержка) по соглашениям о конфиденциальности и защите данных.'}</li>
                <li>{isRomanian ? 'Autorități publice, atunci când legea o cere.' : 'Госорганы — когда это требуется законом.'}</li>
                <li>{isRomanian ? 'Nu transferăm date în afara SEE fără garanții adecvate (clauze standard, nivel adecvat).' : 'Мы не передаем данные за пределы ЕЭЗ без надлежащих гарантий (стандартные положения, надлежащий уровень).'}
                </li>
              </ul>
            </section>

            {/* 7. Drepturile persoanei vizate / Права субъекта */}
            <section>
              <h2>{isRomanian ? '7. Drepturile dvs.' : '7. Ваши права'}</h2>
              <ul>
                <li>{isRomanian ? 'Acces, rectificare, ștergere, restricționare, opoziție, portabilitate (conform GDPR și Legii nr. 133/2011).' : 'Доступ, исправление, удаление, ограничение, возражение, переносимость (по GDPR и Закону № 133/2011).'}
                </li>
                <li>{isRomanian ? 'Retragerea consimțământului (acolo unde a fost acordat), fără a afecta legalitatea prelucrării anterioare.' : 'Отзыв согласия (если было дано) без влияния на законность предыдущей обработки.'}
                </li>
                <li>{isRomanian ? 'Plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP).' : 'Жалоба в Национальный центр по защите персональных данных (CNPDCP).'}
                </li>
              </ul>
            </section>

            {/* 8. Securitate / Безопасность */}
            <section>
              <h2>{isRomanian ? '8. Securitatea datelor' : '8. Безопасность данных'}</h2>
              <p>
                {isRomanian
                  ? 'Aplicăm măsuri tehnice și organizatorice adecvate (criptare în tranzit, control acces, jurnalizare, backup).' 
                  : 'Мы применяем надлежащие технические и организационные меры (шифрование в транзите, контроль доступа, журналирование, резервные копии).'}
              </p>
            </section>

            {/* 9. Minori / Несовершеннолетние */}
            <section>
              <h2>{isRomanian ? '9. Minori' : '9. Несовершеннолетние'}</h2>
              <p>
                {isRomanian
                  ? 'MDent.md nu se adresează în mod intenționat copiilor sub 16 ani. Dacă sunteți părinte și considerați că copilul a furnizat date, contactați-ne.'
                  : 'MDent.md не предназначен для детей младше 16 лет. Если вы родитель и считаете, что ребенок предоставил данные, свяжитесь с нами.'}
              </p>
            </section>

            {/* 10. Contact / Контакты */}
            <section>
              <h2>{isRomanian ? '10. Contact' : '10. Контакты'}</h2>
              <p>
                {isRomanian
                  ? 'Operator: MDent.md – portal stomatologic al Republicii Moldova.'
                  : 'Оператор: MDent.md — стоматологический портал Республики Молдова.'}
                <br />
                {isRomanian ? 'Email: ' : 'Email: '}<a href="mailto:privacy@mdent.md">privacy@mdent.md</a>
              </p>
            </section>

            {/* 11. Modificări / Изменения политики */}
            <section>
              <h2>{isRomanian ? '11. Modificări ale politicii' : '11. Изменения политики'}</h2>
              <p>
                {isRomanian
                  ? 'Putem actualiza periodic această politică. Vom publica versiunea actuală pe MDent.md și vom indica data ultimei actualizări.'
                  : 'Мы можем периодически обновлять эту политику. Актуальная версия публикуется на MDent.md с указанием даты обновления.'}
              </p>
            </section>
          </CardContent>
        </Card>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-8 md:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  © 2024 {t('appTitle')}. {isRomanian ? 'Toate drepturile rezervate.' : 'Все права защищены.'}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex space-x-6 text-sm text-gray-600">
                  <a 
                    href={isRomanian ? '/ro/pricing' : '/pricing'} 
                    className="hover:text-gray-900 transition-colors"
                  >
                    {t('pricing.title')}
                  </a>
                  <a
                    href={isRomanian ? '/ro/privacy' : '/privacy'}
                    className="hover:text-gray-900 transition-colors"
                  >
                    {isRomanian ? 'Politica de confidențialitate' : 'Политика приватности'}
                  </a>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    {isRomanian ? 'Contacte' : 'Контакты'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}


