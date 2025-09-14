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
import { Globe, FileText, Search, Settings as SettingsIcon, Upload, Image, Monitor, Building2, Briefcase, Clock, DollarSign, MapPin, Link, User, Globe2, Eye, Hash, Tag } from 'lucide-react';

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
  robotsTxt: z.string().optional(),
  robots: z.string().default('index,follow'),
  schemaType: z.string().default('Organization'),
  schemaData: z.string().optional(),
});

type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;
type SEOSettingsData = z.infer<typeof seoSettingsSchema>;

export function Settings() {
  console.log('🔧 Settings component is rendering...');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

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
      robotsTxt: 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml',
      robots: 'index,follow',
      schemaType: 'Organization',
      schemaData: '',
    }
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
        robotsTxt: settingsMap.robotsTxt || 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml',
        robots: settingsMap.robots || 'index,follow',
        schemaType: settingsMap.schemaType || 'Organization',
        schemaData: settingsMap.schemaData || '',
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
      <div className="flex items-center space-x-2">
        <Globe className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Общие</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
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
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-8">
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

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить общие настройки'
                    )}
                  </Button>
                </div>
              </form>
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
              <form onSubmit={seoForm.handleSubmit(onSEOSubmit)} className="space-y-8">
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

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="robotsTxt" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>Содержимое robots.txt</span>
                      </Label>
                      <Textarea
                        id="robotsTxt"
                        {...seoForm.register('robotsTxt')}
                        placeholder="User-agent: *&#10;Disallow: /admin&#10;Disallow: /api"
                        rows={6}
                        disabled={loading}
                        className="resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Инструкции для поисковых роботов (создается файл в корне сайта)
                      </p>
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

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить SEO настройки'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}