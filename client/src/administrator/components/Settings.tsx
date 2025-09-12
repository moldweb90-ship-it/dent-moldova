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
import { Globe, FileText, Search } from 'lucide-react';

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

type SEOSettingsData = z.infer<typeof seoSettingsSchema>;

export function Settings() {
  console.log('🔧 Settings component is rendering...');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<SEOSettingsData>({
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
      form.reset({
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

  const onSubmit = async (data: SEOSettingsData) => {
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

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <Card>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Russian SEO Settings */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <span className="text-lg font-semibold text-gray-900">🇷🇺 Русский язык</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                      <Label htmlFor="siteTitleRu">Название сайта (Title)</Label>
                  <Input
                        id="siteTitleRu"
                        {...form.register('siteTitleRu')}
                    placeholder="Dent Moldova - Каталог стоматологических клиник"
                    disabled={loading}
                  />
                      {form.formState.errors.siteTitleRu && (
                        <p className="text-sm text-red-600">{form.formState.errors.siteTitleRu.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h1Ru">H1 заголовок</Label>
                      <Input
                        id="h1Ru"
                        {...form.register('h1Ru')}
                        placeholder="Каталог стоматологических клиник в Молдове"
                        disabled={loading}
                      />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="metaDescriptionRu">Описание сайта (Meta Description)</Label>
                  <Textarea
                      id="metaDescriptionRu"
                      {...form.register('metaDescriptionRu')}
                    placeholder="Найдите лучшую стоматологическую клинику в Молдове..."
                    rows={3}
                    disabled={loading}
                    className="resize-none"
                  />
                    {form.formState.errors.metaDescriptionRu && (
                      <p className="text-sm text-red-600">{form.formState.errors.metaDescriptionRu.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywordsRu">Ключевые слова</Label>
                    <Input
                      id="keywordsRu"
                      {...form.register('keywordsRu')}
                      placeholder="стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ogTitleRu">Open Graph Title</Label>
                      <Input
                        id="ogTitleRu"
                        {...form.register('ogTitleRu')}
                        placeholder="Dent Moldova - Каталог стоматологических клиник"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogImageRu">Open Graph Image URL</Label>
                      <Input
                        id="ogImageRu"
                        {...form.register('ogImageRu')}
                        placeholder="https://dentmoldova.md/og-image.jpg"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogDescriptionRu">Open Graph Description</Label>
                    <Textarea
                      id="ogDescriptionRu"
                      {...form.register('ogDescriptionRu')}
                      placeholder="Найдите лучшие стоматологические клиники в Молдове"
                      rows={2}
                      disabled={loading}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonicalRu">Canonical URL</Label>
                    <Input
                      id="canonicalRu"
                      {...form.register('canonicalRu')}
                      placeholder="https://dentmoldova.md"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Romanian SEO Settings */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <span className="text-lg font-semibold text-gray-900">🇷🇴 Румынский язык</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteTitleRo">Название сайта (Title)</Label>
                      <Input
                        id="siteTitleRo"
                        {...form.register('siteTitleRo')}
                        placeholder="Dent Moldova - Catalogul clinicilor stomatologice"
                        disabled={loading}
                      />
                      {form.formState.errors.siteTitleRo && (
                        <p className="text-sm text-red-600">{form.formState.errors.siteTitleRo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h1Ro">H1 заголовок</Label>
                      <Input
                        id="h1Ro"
                        {...form.register('h1Ro')}
                        placeholder="Catalogul clinicilor stomatologice din Moldova"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionRo">Описание сайта (Meta Description)</Label>
                    <Textarea
                      id="metaDescriptionRo"
                      {...form.register('metaDescriptionRo')}
                      placeholder="Găsiți cea mai bună clinică stomatologică din Moldova..."
                      rows={3}
                      disabled={loading}
                      className="resize-none"
                    />
                    {form.formState.errors.metaDescriptionRo && (
                      <p className="text-sm text-red-600">{form.formState.errors.metaDescriptionRo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywordsRo">Ключевые слова</Label>
                    <Input
                      id="keywordsRo"
                      {...form.register('keywordsRo')}
                      placeholder="stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ogTitleRo">Open Graph Title</Label>
                      <Input
                        id="ogTitleRo"
                        {...form.register('ogTitleRo')}
                        placeholder="Dent Moldova - Catalogul clinicilor stomatologice"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogImageRo">Open Graph Image URL</Label>
                      <Input
                        id="ogImageRo"
                        {...form.register('ogImageRo')}
                        placeholder="https://dentmoldova.md/og-image-ro.jpg"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogDescriptionRo">Open Graph Description</Label>
                    <Textarea
                      id="ogDescriptionRo"
                      {...form.register('ogDescriptionRo')}
                      placeholder="Găsiți cele mai bune clinici stomatologice din Moldova"
                      rows={2}
                      disabled={loading}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonicalRo">Canonical URL</Label>
                    <Input
                      id="canonicalRo"
                      {...form.register('canonicalRo')}
                      placeholder="https://dentmoldova.md/ro"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Common Settings */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <span className="text-lg font-semibold text-gray-900">⚙️ Общие настройки</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="robots">Robots meta</Label>
                      <Input
                        id="robots"
                        {...form.register('robots')}
                        placeholder="index,follow"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schemaType">Schema.org Type</Label>
                      <Input
                        id="schemaType"
                        {...form.register('schemaType')}
                        placeholder="Organization"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schemaData">Schema.org Data (JSON)</Label>
                    <Textarea
                      id="schemaData"
                      {...form.register('schemaData')}
                      placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "Dent Moldova"}'
                      rows={4}
                      disabled={loading}
                      className="resize-none font-mono text-sm"
                    />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="robotsTxt" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Содержимое robots.txt</span>
                  </Label>
                  <Textarea
                    id="robotsTxt"
                    {...form.register('robotsTxt')}
                      placeholder="User-agent: *&#10;Disallow: /admin&#10;Disallow: /api"
                    rows={6}
                    disabled={loading}
                    className="resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Инструкции для поисковых роботов (создается файл в корне сайта)
                  </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Предварительный просмотр в Google</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">🇷🇺 Русская версия</h4>
                  <div className="space-y-1">
                    <div className="text-lg text-blue-600 hover:underline cursor-pointer">
                          {form.watch('siteTitleRu') || 'Dent Moldova - Каталог стоматологических клиник'}
                    </div>
                    <div className="text-green-700 text-sm">https://dentmoldova.md</div>
                    <div className="text-gray-600 text-sm">
                          {form.watch('metaDescriptionRu') || 'Найдите лучшую стоматологическую клинику в Молдове...'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">🇷🇴 Румынская версия</h4>
                      <div className="space-y-1">
                        <div className="text-lg text-blue-600 hover:underline cursor-pointer">
                          {form.watch('siteTitleRo') || 'Dent Moldova - Catalogul clinicilor stomatologice'}
                        </div>
                        <div className="text-green-700 text-sm">https://dentmoldova.md/ro</div>
                        <div className="text-gray-600 text-sm">
                          {form.watch('metaDescriptionRo') || 'Găsiți cea mai bună clinică stomatologică din Moldova...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Сохранение...' : 'Сохранить настройки'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}