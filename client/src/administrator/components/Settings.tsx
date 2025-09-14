import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Globe, FileText, Search, Settings as SettingsIcon, Upload, Image, Monitor, Building2, Briefcase, Clock, DollarSign, MapPin, Link, User, Globe2, Eye, Hash, Tag, Bot, Shield } from 'lucide-react';

const generalSettingsSchema = z.object({
  favicon: z.string().optional(),
  websiteName: z.string().optional(),
  websiteUrl: z.string().optional(),
  organizationName: z.string().optional(),
  organizationDescription: z.string().optional(),
  organizationUrl: z.string().optional(),
  organizationCity: z.string().optional(),
  organizationCountry: z.string().optional(),
  businessType: z.string().optional(),
  businessPriceRange: z.string().optional(),
  businessOpeningHours: z.string().optional(),
});

const seoSettingsSchema = z.object({
  // Russian SEO settings
  siteTitleRu: z.string().optional(),
  metaDescriptionRu: z.string().optional(),
  keywordsRu: z.string().optional(),
  ogTitleRu: z.string().optional(),
  ogDescriptionRu: z.string().optional(),
  ogImageRu: z.string().optional(),
  canonicalRu: z.string().optional(),
  h1Ru: z.string().optional(),
  
  // Romanian SEO settings
  siteTitleRo: z.string().optional(),
  metaDescriptionRo: z.string().optional(),
  keywordsRo: z.string().optional(),
  ogTitleRo: z.string().optional(),
  ogDescriptionRo: z.string().optional(),
  ogImageRo: z.string().optional(),
  canonicalRo: z.string().optional(),
  h1Ro: z.string().optional(),
  
  // Common settings
  robots: z.string().default('index,follow'),
  schemaType: z.string().default('Organization'),
  schemaData: z.string().optional(),
});

const robotsSettingsSchema = z.object({
  robotsTxt: z.string().optional(),
});

type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;
type SEOSettingsData = z.infer<typeof seoSettingsSchema>;
type RobotsSettingsData = z.infer<typeof robotsSettingsSchema>;

export function Settings() {
  console.log('🔧 Settings component is rendering...');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [crawling, setCrawling] = useState(false);
  const [crawlResults, setCrawlResults] = useState<any>(() => {
    // Загружаем результаты из localStorage при инициализации
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crawler-results');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const generalForm = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      favicon: '',
      websiteName: '',
      websiteUrl: '',
      organizationName: '',
      organizationDescription: '',
      organizationUrl: '',
      organizationCity: '',
      organizationCountry: '',
      businessType: '',
      businessPriceRange: '',
      businessOpeningHours: '',
    }
  });

  const seoForm = useForm<SEOSettingsData>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      // Russian defaults
      siteTitleRu: '',
      metaDescriptionRu: '',
      keywordsRu: '',
      ogTitleRu: '',
      ogDescriptionRu: '',
      ogImageRu: '',
      canonicalRu: '',
      h1Ru: '',
      
      // Romanian defaults
      siteTitleRo: '',
      metaDescriptionRo: '',
      keywordsRo: '',
      ogTitleRo: '',
      ogDescriptionRo: '',
      ogImageRo: '',
      canonicalRo: '',
      h1Ro: '',
      
      // Common defaults
      robots: 'index,follow',
      schemaType: 'Organization',
      schemaData: '',
    }
  });

  const robotsForm = useForm<RobotsSettingsData>({
    resolver: zodResolver(robotsSettingsSchema),
    defaultValues: {
      robotsTxt: 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/settings');
      const settings = await response.json();
      
      // Convert array of settings to object
      const settingsMap = Array.isArray(settings) 
        ? settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {})
        : settings || {};

      // Load general settings
      generalForm.reset({
        favicon: settingsMap.favicon || '',
        websiteName: settingsMap.websiteName || 'Dent Moldova',
        websiteUrl: settingsMap.websiteUrl || 'https://dentmoldova.md',
        organizationName: settingsMap.organizationName || 'Dent Moldova',
        organizationDescription: settingsMap.organizationDescription || 'Каталог стоматологических клиник в Молдове',
        organizationUrl: settingsMap.organizationUrl || 'https://dentmoldova.md',
        organizationCity: settingsMap.organizationCity || 'Кишинёв',
        organizationCountry: settingsMap.organizationCountry || 'MD',
        businessType: settingsMap.businessType || 'Dentist',
        businessPriceRange: settingsMap.businessPriceRange || '$$',
        businessOpeningHours: settingsMap.businessOpeningHours || 'Mo-Fr 09:00-18:00',
      });

      // Load SEO settings
      seoForm.reset({
        // Russian settings
        siteTitleRu: settingsMap.siteTitleRu || 'Dent Moldova - Каталог стоматологических клиник',
        metaDescriptionRu: settingsMap.metaDescriptionRu || 'Найдите лучшую стоматологическую клинику в Молдове. Каталог проверенных клиник с ценами, отзывами и рейтингами.',
        keywordsRu: settingsMap.keywordsRu || 'стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв',
        ogTitleRu: settingsMap.ogTitleRu || 'Dent Moldova - Каталог стоматологических клиник',
        ogDescriptionRu: settingsMap.ogDescriptionRu || 'Найдите лучшие стоматологические клиники в Молдове',
        ogImageRu: settingsMap.ogImageRu || '',
        canonicalRu: settingsMap.canonicalRu || 'https://dentmoldova.md',
        h1Ru: settingsMap.h1Ru || 'Каталог стоматологических клиник в Молдове',
        
        // Romanian settings
        siteTitleRo: settingsMap.siteTitleRo || 'Dent Moldova - Catalogul clinicilor stomatologice',
        metaDescriptionRo: settingsMap.metaDescriptionRo || 'Găsiți cea mai bună clinică stomatologică din Moldova. Catalogul clinicilor verificate cu prețuri, recenzii și evaluări.',
        keywordsRo: settingsMap.keywordsRo || 'stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău',
        ogTitleRo: settingsMap.ogTitleRo || 'Dent Moldova - Catalogul clinicilor stomatologice',
        ogDescriptionRo: settingsMap.ogDescriptionRo || 'Găsiți cele mai bune clinici stomatologice din Moldova',
        ogImageRo: settingsMap.ogImageRo || '',
        canonicalRo: settingsMap.canonicalRo || 'https://dentmoldova.md/ro',
        h1Ro: settingsMap.h1Ro || 'Catalogul clinicilor stomatologice din Moldova',
        
        // Common settings
        robots: settingsMap.robots || 'index,follow',
        schemaType: settingsMap.schemaType || 'Organization',
        schemaData: settingsMap.schemaData || '',
      });

      // Load robots settings
      robotsForm.reset({
        robotsTxt: settingsMap.robotsTxt || 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const onGeneralSubmit = async (data: GeneralSettingsData) => {
    setLoading(true);
    try {
      const result = await apiRequest('POST', '/api/admin/settings', data);
      toast({
        title: 'Настройки сохранены',
        description: 'Общие настройки успешно обновлены.',
      });
      // Перезагружаем настройки для обновления формы
      loadSettings();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSEOSubmit = async (data: SEOSettingsData) => {
    setLoading(true);
    try {
      const result = await apiRequest('POST', '/api/admin/settings', data);
      toast({
        title: 'Настройки сохранены',
        description: 'SEO настройки успешно обновлены.',
      });
      // Перезагружаем настройки для обновления формы
      loadSettings();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRobotsSubmit = async (data: RobotsSettingsData) => {
    setLoading(true);
    try {
      const result = await apiRequest('POST', '/api/admin/settings', data);
      toast({
        title: 'Robots.txt обновлен',
        description: 'Файл robots.txt успешно сохранен и доступен по адресу /robots.txt',
      });
      // Перезагружаем настройки для обновления формы
      loadSettings();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить robots.txt.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onCrawlStart = async () => {
    setCrawling(true);
    setCrawlResults(null);
    try {
      const response = await apiRequest('POST', '/api/admin/crawler/start');
      const result = await response.json();
      console.log('Crawler result:', result); // Debug log
      setCrawlResults(result);
      // Сохраняем результаты в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('crawler-results', JSON.stringify(result));
      }
      toast({
        title: 'Краулинг завершен',
        description: `Найдено ${result.totalPages || 0} страниц. Sitemap обновлен.`,
      });
    } catch (error: any) {
      console.error('Error during crawling:', error);
      // Очищаем результаты при ошибке
      setCrawlResults(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('crawler-results');
      }
      toast({
        title: 'Ошибка краулинга',
        description: error.message || 'Не удалось выполнить краулинг страниц.',
        variant: 'destructive',
      });
    } finally {
      setCrawling(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите файл изображения.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'favicon');

      const response = await apiRequest('POST', '/api/admin/upload', formData);
      const result = await response.json();
      
      if (result.success) {
        generalForm.setValue('favicon', result.url);
        toast({
          title: 'Фавикон загружен',
          description: 'Фавикон успешно загружен.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить фавикон.',
        variant: 'destructive',
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        </div>
        
        {/* Кнопка сохранения наверху - только для активной вкладки */}
        {activeTab === 'general' && (
          <Button
            onClick={generalForm.handleSubmit(onGeneralSubmit)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Сохранение...</span>
                <span className="sm:hidden">Сохранение...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Сохранить общие настройки</span>
                <span className="sm:hidden">Общие</span>
              </>
            )}
          </Button>
        )}
        {activeTab === 'seo' && (
          <Button
            onClick={seoForm.handleSubmit(onSEOSubmit)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-4 sm:px-6 py-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Сохранение...</span>
                <span className="sm:hidden">Сохранение...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Сохранить SEO настройки</span>
                <span className="sm:hidden">SEO</span>
              </>
            )}
          </Button>
        )}
        {activeTab === 'robots' && (
          <Button
            onClick={robotsForm.handleSubmit(onRobotsSubmit)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Сохранение...</span>
                <span className="sm:hidden">Сохранение...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Сохранить Robots.txt</span>
                <span className="sm:hidden">Robots</span>
              </>
            )}
          </Button>
        )}
        {activeTab === 'crawler' && (
          <Button
            onClick={onCrawlStart}
            disabled={crawling}
            className="bg-purple-600 hover:bg-purple-700 px-4 sm:px-6 py-2 text-sm sm:text-base"
          >
            {crawling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Краулинг...</span>
                <span className="sm:hidden">Краулинг...</span>
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Запустить краулер</span>
                <span className="sm:hidden">Краулер</span>
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Общие</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="crawler" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>Краулер</span>
          </TabsTrigger>
          <TabsTrigger value="robots" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Robots.txt</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>Общие настройки</span>
              </CardTitle>
              <CardDescription>
                Основные настройки сайта, организация и контактная информация
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Favicon Upload Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Image className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Фавикон сайта</h3>
                      <p className="text-sm text-gray-600">Иконка, отображаемая в браузере</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                    {generalForm.watch('favicon') && (
                      <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center bg-white shadow-sm">
                        <img 
                          src={generalForm.watch('favicon')} 
                          alt="Favicon" 
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          id="favicon-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          disabled={uploadingFavicon}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('favicon-upload')?.click()}
                          disabled={uploadingFavicon}
                          className="flex items-center space-x-2 border-blue-200 hover:bg-blue-50"
                        >
                          <Upload className="h-4 w-4" />
                          <span>{uploadingFavicon ? 'Загрузка...' : 'Выбрать файл'}</span>
                        </Button>
                        {generalForm.watch('favicon') && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => generalForm.setValue('favicon', '')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Рекомендуемый размер: 32x32px, формат: PNG, ICO, JPG. Максимум 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Settings Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Website Settings Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Globe2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Настройки сайта</CardTitle>
                          <CardDescription>Основная информация о веб-сайте</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="websiteName" className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <span>Название сайта</span>
                        </Label>
                        <Input
                          id="websiteName"
                          {...generalForm.register('websiteName')}
                          placeholder="Dent Moldova"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl" className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-gray-500" />
                          <span>URL сайта</span>
                        </Label>
                        <Input
                          id="websiteUrl"
                          {...generalForm.register('websiteUrl')}
                          placeholder="https://dentmoldova.md"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Organization Settings Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Организация</CardTitle>
                          <CardDescription>Информация о вашей компании</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="organizationName" className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span>Название организации</span>
                        </Label>
                        <Input
                          id="organizationName"
                          {...generalForm.register('organizationName')}
                          placeholder="Dent Moldova"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationUrl" className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-gray-500" />
                          <span>URL организации</span>
                        </Label>
                        <Input
                          id="organizationUrl"
                          {...generalForm.register('organizationUrl')}
                          placeholder="https://dentmoldova.md"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationDescription" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>Описание организации</span>
                        </Label>
                        <Textarea
                          id="organizationDescription"
                          {...generalForm.register('organizationDescription')}
                          placeholder="Каталог стоматологических клиник в Молдове"
                          rows={3}
                          disabled={loading}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="organizationCity" className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>Город</span>
                          </Label>
                          <Input
                            id="organizationCity"
                            {...generalForm.register('organizationCity')}
                            placeholder="Кишинёв"
                            disabled={loading}
                            className="pl-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organizationCountry" className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span>Страна</span>
                          </Label>
                          <Input
                            id="organizationCountry"
                            {...generalForm.register('organizationCountry')}
                            placeholder="MD"
                            disabled={loading}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Business Information Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Briefcase className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Бизнес информация</CardTitle>
                        <CardDescription>Детали о вашем бизнесе</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Тип бизнеса</span>
                        </Label>
                        <Input
                          id="businessType"
                          {...generalForm.register('businessType')}
                          placeholder="Dentist"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessPriceRange" className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Ценовой диапазон</span>
                        </Label>
                        <Input
                          id="businessPriceRange"
                          {...generalForm.register('businessPriceRange')}
                          placeholder="$$"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessOpeningHours" className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Часы работы</span>
                        </Label>
                        <Input
                          id="businessOpeningHours"
                          {...generalForm.register('businessOpeningHours')}
                          placeholder="Mo-Fr 09:00-18:00"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Настройки SEO</span>
              </CardTitle>
              <CardDescription>
                Управление метатегами, описанием сайта и поисковой оптимизацией
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Language Tabs */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Russian SEO Settings */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <span className="text-lg">🇷🇺</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">Русский язык</CardTitle>
                          <CardDescription>SEO настройки для русской версии</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteTitleRu" className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <span>Название сайта (Title)</span>
                        </Label>
                        <Input
                          id="siteTitleRu"
                          {...seoForm.register('siteTitleRu')}
                          placeholder="Dent Moldova - Каталог стоматологических клиник"
                          disabled={loading}
                          className="pl-10"
                        />
                        {seoForm.formState.errors.siteTitleRu && (
                          <p className="text-sm text-red-600">{seoForm.formState.errors.siteTitleRu.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="h1Ru" className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span>H1 заголовок</span>
                        </Label>
                        <Input
                          id="h1Ru"
                          {...seoForm.register('h1Ru')}
                          placeholder="Каталог стоматологических клиник в Молдове"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metaDescriptionRu" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>Описание сайта (Meta Description)</span>
                        </Label>
                        <Textarea
                          id="metaDescriptionRu"
                          {...seoForm.register('metaDescriptionRu')}
                          placeholder="Найдите лучшую стоматологическую клинику в Молдове..."
                          rows={3}
                          disabled={loading}
                          className="resize-none"
                        />
                        {seoForm.formState.errors.metaDescriptionRu && (
                          <p className="text-sm text-red-600">{seoForm.formState.errors.metaDescriptionRu.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keywordsRu" className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span>Ключевые слова</span>
                        </Label>
                        <Input
                          id="keywordsRu"
                          {...seoForm.register('keywordsRu')}
                          placeholder="стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogTitleRu" className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>Open Graph Title</span>
                        </Label>
                        <Input
                          id="ogTitleRu"
                          {...seoForm.register('ogTitleRu')}
                          placeholder="Dent Moldova - Каталог стоматологических клиник"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogDescriptionRu" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>Open Graph Description</span>
                        </Label>
                        <Textarea
                          id="ogDescriptionRu"
                          {...seoForm.register('ogDescriptionRu')}
                          placeholder="Найдите лучшие стоматологические клиники в Молдове"
                          rows={2}
                          disabled={loading}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogImageRu" className="flex items-center space-x-2">
                          <Image className="h-4 w-4 text-gray-500" />
                          <span>Open Graph Image URL</span>
                        </Label>
                        <Input
                          id="ogImageRu"
                          {...seoForm.register('ogImageRu')}
                          placeholder="https://dentmoldova.md/og-image.jpg"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="canonicalRu" className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-gray-500" />
                          <span>Canonical URL</span>
                        </Label>
                        <Input
                          id="canonicalRu"
                          {...seoForm.register('canonicalRu')}
                          placeholder="https://dentmoldova.md"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Romanian SEO Settings */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <span className="text-lg">🇷🇴</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">Румынский язык</CardTitle>
                          <CardDescription>SEO настройки для румынской версии</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteTitleRo" className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <span>Название сайта (Title)</span>
                        </Label>
                        <Input
                          id="siteTitleRo"
                          {...seoForm.register('siteTitleRo')}
                          placeholder="Dent Moldova - Catalogul clinicilor stomatologice"
                          disabled={loading}
                          className="pl-10"
                        />
                        {seoForm.formState.errors.siteTitleRo && (
                          <p className="text-sm text-red-600">{seoForm.formState.errors.siteTitleRo.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="h1Ro" className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span>H1 заголовок</span>
                        </Label>
                        <Input
                          id="h1Ro"
                          {...seoForm.register('h1Ro')}
                          placeholder="Catalogul clinicilor stomatologice din Moldova"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metaDescriptionRo" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>Описание сайта (Meta Description)</span>
                        </Label>
                        <Textarea
                          id="metaDescriptionRo"
                          {...seoForm.register('metaDescriptionRo')}
                          placeholder="Găsiți cea mai bună clinică stomatologică din Moldova..."
                          rows={3}
                          disabled={loading}
                          className="resize-none"
                        />
                        {seoForm.formState.errors.metaDescriptionRo && (
                          <p className="text-sm text-red-600">{seoForm.formState.errors.metaDescriptionRo.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keywordsRo" className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span>Ключевые слова</span>
                        </Label>
                        <Input
                          id="keywordsRo"
                          {...seoForm.register('keywordsRo')}
                          placeholder="stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogTitleRo" className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>Open Graph Title</span>
                        </Label>
                        <Input
                          id="ogTitleRo"
                          {...seoForm.register('ogTitleRo')}
                          placeholder="Dent Moldova - Catalogul clinicilor stomatologice"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogDescriptionRo" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>Open Graph Description</span>
                        </Label>
                        <Textarea
                          id="ogDescriptionRo"
                          {...seoForm.register('ogDescriptionRo')}
                          placeholder="Găsiți cele mai bune clinici stomatologice din Moldova"
                          rows={2}
                          disabled={loading}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogImageRo" className="flex items-center space-x-2">
                          <Image className="h-4 w-4 text-gray-500" />
                          <span>Open Graph Image URL</span>
                        </Label>
                        <Input
                          id="ogImageRo"
                          {...seoForm.register('ogImageRo')}
                          placeholder="https://dentmoldova.md/og-image-ro.jpg"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="canonicalRo" className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-gray-500" />
                          <span>Canonical URL</span>
                        </Label>
                        <Input
                          id="canonicalRo"
                          {...seoForm.register('canonicalRo')}
                          placeholder="https://dentmoldova.md/ro"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Common Settings */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <SettingsIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Общие настройки</CardTitle>
                        <CardDescription>Технические настройки для поисковых систем</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="robots" className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-500" />
                          <span>Robots meta</span>
                        </Label>
                        <Input
                          id="robots"
                          {...seoForm.register('robots')}
                          placeholder="index,follow"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schemaType" className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span>Schema.org Type</span>
                        </Label>
                        <Input
                          id="schemaType"
                          {...seoForm.register('schemaType')}
                          placeholder="Organization"
                          disabled={loading}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="schemaData" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>Schema.org Data (JSON)</span>
                      </Label>
                      <Textarea
                        id="schemaData"
                        {...seoForm.register('schemaData')}
                        placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "Dent Moldova"}'
                        rows={4}
                        disabled={loading}
                        className="resize-none font-mono text-sm"
                      />
                    </div>

                  </CardContent>
                </Card>

                {/* Preview */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Предварительный просмотр в Google</CardTitle>
                        <CardDescription>Как будет выглядеть ваш сайт в поисковой выдаче</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                          <span>🇷🇺</span>
                          <span>Русская версия</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="text-lg text-blue-600 hover:underline cursor-pointer font-medium">
                            {seoForm.watch('siteTitleRu') || 'Dent Moldova - Каталог стоматологических клиник'}
                          </div>
                          <div className="text-green-700 text-sm">https://dentmoldova.md</div>
                          <div className="text-gray-600 text-sm leading-relaxed">
                            {seoForm.watch('metaDescriptionRu') || 'Найдите лучшую стоматологическую клинику в Молдове...'}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                          <span>🇷🇴</span>
                          <span>Румынская версия</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="text-lg text-blue-600 hover:underline cursor-pointer font-medium">
                            {seoForm.watch('siteTitleRo') || 'Dent Moldova - Catalogul clinicilor stomatologice'}
                          </div>
                          <div className="text-green-700 text-sm">https://dentmoldova.md/ro</div>
                          <div className="text-gray-600 text-sm leading-relaxed">
                            {seoForm.watch('metaDescriptionRo') || 'Găsiți cea mai bună clinică stomatologică din Moldova...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crawler">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span>Краулер сайта</span>
              </CardTitle>
              <CardDescription>
                Автоматическое сканирование страниц и генерация sitemap.xml
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Что делает краулер */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Что делает краулер:</h3>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Сканирует все активные страницы сайта</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Проверяет доступность страниц</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Генерирует sitemap.xml для поисковых систем</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Обновляет структуру сайта автоматически</span>
                    </li>
                  </ul>
                </div>

                {/* Результаты последнего краулинга - всегда показываем */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Результаты последнего краулинга:</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-2xl font-bold text-green-600">{crawlResults?.totalPages || 0}</div>
                      <div className="text-sm text-gray-600">Всего страниц</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-2xl font-bold text-blue-600">{crawlResults?.clinicPages || 0}</div>
                      <div className="text-sm text-gray-600">Страниц клиник</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-2xl font-bold text-purple-600">{crawlResults?.mainPages || 0}</div>
                      <div className="text-sm text-gray-600">Основных страниц</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-green-700">
                      <strong>Sitemap доступен по адресу:</strong> 
                      <a 
                        href="/sitemap.xml" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        {window.location.origin}/sitemap.xml
                      </a>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Последнее обновление: {crawlResults?.lastUpdated ? new Date(crawlResults.lastUpdated).toLocaleString('ru-RU') : 'Краулинг не выполнялся'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Включаемые страницы:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Основные страницы:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Главная страница (/)</li>
                      <li>• Главная страница RO (/ro)</li>
                      <li>• Страница цен (/pricing)</li>
                      <li>• Страница цен RO (/ro/pricing)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Страницы клиник:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Только верифицированные клиники</li>
                      <li>• Только активные клиники</li>
                      <li>• Русская и румынская версии</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Важно:</h3>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• Краулер работает только с публичными страницами</li>
                  <li>• Админ панель и API не включаются в sitemap</li>
                  <li>• Sitemap автоматически обновляется при запуске краулера</li>
                  <li>• Рекомендуется запускать краулер после добавления новых клиник</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Robots.txt</span>
              </CardTitle>
              <CardDescription>
                Управление файлом robots.txt для поисковых систем
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Что такое robots.txt:</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Указывает поисковым роботам, какие страницы можно индексировать</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Помогает контролировать индексацию сайта</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Указывает расположение sitemap.xml</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Доступен по адресу /robots.txt</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="robotsTxt" className="text-base font-medium">
                    Содержимое robots.txt
                  </Label>
                  <Textarea
                    id="robotsTxt"
                    {...robotsForm.register('robotsTxt')}
                    placeholder="User-agent: *&#10;Disallow: /admin&#10;Disallow: /api&#10;&#10;Sitemap: https://dentmoldova.md/sitemap.xml"
                    className="min-h-[200px] font-mono text-sm"
                    rows={10}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Введите содержимое файла robots.txt. Каждая директива должна быть на новой строке.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Рекомендации:</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• <code>User-agent: *</code> - применяется ко всем роботам</li>
                  <li>• <code>Disallow: /admin</code> - запрещает индексацию админ панели</li>
                  <li>• <code>Disallow: /api</code> - запрещает индексацию API</li>
                  <li>• <code>Sitemap:</code> - указывает путь к sitemap.xml</li>
                  <li>• Файл автоматически сохраняется в корне сайта</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Текущий robots.txt:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Файл доступен по адресу: 
                  <a 
                    href="/robots.txt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {window.location.origin}/robots.txt
                  </a>
                </p>
                <div className="bg-white p-3 rounded border font-mono text-xs text-gray-700 whitespace-pre-wrap">
                  {robotsForm.watch('robotsTxt') || 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}