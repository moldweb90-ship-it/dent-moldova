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
  siteTitle: z.string().min(1, 'Название сайта обязательно'),
  metaDescription: z.string().min(1, 'Описание сайта обязательно'),
  robotsTxt: z.string().optional(),
});

type SEOSettingsData = z.infer<typeof seoSettingsSchema>;

export function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<SEOSettingsData>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      siteTitle: '',
      metaDescription: '',
      robotsTxt: 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml',
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await apiRequest('GET', '/api/admin/settings');
      
      // Convert array of settings to object
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      form.reset({
        siteTitle: settingsMap.siteTitle || 'Dent Moldova - Каталог стоматологических клиник',
        metaDescription: settingsMap.metaDescription || 'Найдите лучшую стоматологическую клинику в Молдове. Каталог проверенных клиник с ценами, отзывами и рейтингами.',
        robotsTxt: settingsMap.robotsTxt || 'User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://dentmoldova.md/sitemap.xml',
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
      await apiRequest('POST', '/api/admin/settings', data);
      toast({
        title: 'Настройки сохранены',
        description: 'SEO настройки успешно обновлены.',
      });
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Site Title */}
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Название сайта (Title)</Label>
                  <Input
                    id="siteTitle"
                    {...form.register('siteTitle')}
                    placeholder="Dent Moldova - Каталог стоматологических клиник"
                    disabled={loading}
                  />
                  {form.formState.errors.siteTitle && (
                    <p className="text-sm text-red-600">{form.formState.errors.siteTitle.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Отображается в заголовке браузера и результатах поиска
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Описание сайта (Meta Description)</Label>
                  <Textarea
                    id="metaDescription"
                    {...form.register('metaDescription')}
                    placeholder="Найдите лучшую стоматологическую клинику в Молдове..."
                    rows={3}
                    disabled={loading}
                    className="resize-none"
                  />
                  {form.formState.errors.metaDescription && (
                    <p className="text-sm text-red-600">{form.formState.errors.metaDescription.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Описание сайта для поисковых систем (160-320 символов)
                  </p>
                </div>

                {/* Robots.txt */}
                <div className="space-y-2">
                  <Label htmlFor="robotsTxt" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Содержимое robots.txt</span>
                  </Label>
                  <Textarea
                    id="robotsTxt"
                    {...form.register('robotsTxt')}
                    placeholder="User-agent: *&#10;Disallow: /admin"
                    rows={6}
                    disabled={loading}
                    className="resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Инструкции для поисковых роботов (создается файл в корне сайта)
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Предварительный просмотр в Google</h3>
                  <div className="space-y-1">
                    <div className="text-lg text-blue-600 hover:underline cursor-pointer">
                      {form.watch('siteTitle') || 'Dent Moldova - Каталог стоматологических клиник'}
                    </div>
                    <div className="text-green-700 text-sm">https://dentmoldova.md</div>
                    <div className="text-gray-600 text-sm">
                      {form.watch('metaDescription') || 'Найдите лучшую стоматологическую клинику в Молдове...'}
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