import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Plus, Trash2 } from 'lucide-react';

const clinicSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  cityId: z.string().min(1, 'Выберите город'),
  districtId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  bookingUrl: z.string().optional(),
  languages: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
  cnam: z.boolean().default(false),
  availToday: z.boolean().default(false),
  availTomorrow: z.boolean().default(false),
  priceIndex: z.number().min(0).max(100),
  trustIndex: z.number().min(0).max(100),
  reviewsIndex: z.number().min(0).max(100),
  accessIndex: z.number().min(0).max(100),
  recommended: z.boolean().default(false),
  promotionalLabels: z.array(z.string()).default([]),
  currency: z.string().default('MDL')
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface ClinicFormProps {
  clinic?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClinicForm({ clinic, onSuccess, onCancel }: ClinicFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [services, setServices] = useState<{name: string, price: number, currency: string}[]>([]);
  const [newService, setNewService] = useState({ name: '', price: '', currency: 'MDL' });

  // Initialize form first
  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: clinic?.name || '',
      cityId: clinic?.cityId || '',
      districtId: clinic?.districtId || '',
      address: clinic?.address || '',
      phone: clinic?.phone || '',
      website: clinic?.website || '',
      bookingUrl: clinic?.bookingUrl || '',
      languages: clinic?.languages || [],
      specializations: clinic?.specializations || [],
      tags: clinic?.tags || [],
      verified: clinic?.verified || false,
      cnam: clinic?.cnam || false,
      availToday: clinic?.availToday || false,
      availTomorrow: clinic?.availTomorrow || false,
      priceIndex: clinic?.priceIndex || 50,
      trustIndex: clinic?.trustIndex || 50,
      reviewsIndex: clinic?.reviewsIndex || 50,
      accessIndex: clinic?.accessIndex || 50,
      recommended: clinic?.recommended || false,
      promotionalLabels: clinic?.promotionalLabels || [],
      currency: clinic?.currency || 'MDL'
    }
  });

  const { data: cities } = useQuery({
    queryKey: ['/api/cities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cities');
      return response.json();
    }
  });

  // Watch for city changes to load districts
  const selectedCityId = form.watch('cityId');
  const { data: districts } = useQuery({
    queryKey: ['/api/cities', selectedCityId, 'districts'],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${selectedCityId}/districts`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedCityId
  });

  // Load existing services
  const { data: existingServices } = useQuery({
    queryKey: ['/api/admin/clinics', clinic?.id, 'services'],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const response = await fetch(`/api/admin/clinics/${clinic.id}/services`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!clinic?.id
  });

  useEffect(() => {
    if (existingServices) {
      // Add currency field if missing (for backward compatibility)
      const servicesWithCurrency = existingServices.map((service: any) => ({
        ...service,
        currency: service.currency || clinic?.currency || 'MDL'
      }));
      setServices(servicesWithCurrency);
    }
  }, [existingServices, clinic?.currency]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // First create clinic
      const response = await apiRequest('POST', '/api/admin/clinics', data);
      const result = await response.json();
      
      // Then add services if any
      if (services.length > 0 && result.id) {
        await fetch(`/api/admin/clinics/${result.id}/services`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(services)
        });
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate all clinic-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/clinics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recent-clinics'] });
      toast({
        title: 'Клиника создана',
        description: 'Клиника была успешно добавлена в систему'
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать клинику',
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!clinic?.id) throw new Error('No clinic ID');
      
      // First update clinic data
      const response = await apiRequest('PUT', `/api/admin/clinics/${clinic.id}`, data);
      const result = await response.json();
      
      // Then update services
      await fetch(`/api/admin/clinics/${clinic.id}/services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(services)
      });
      
      return result;
    },
    onSuccess: () => {
      // Invalidate all clinic-related queries to refresh frontend data
      queryClient.invalidateQueries({ queryKey: ['/api/clinics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recent-clinics'] });
      if (clinic?.slug) {
        queryClient.invalidateQueries({ queryKey: ['/api/clinics', clinic.slug] });
      }
      // Clear all cache to ensure fresh data
      queryClient.clear();
      toast({
        title: 'Клиника обновлена',
        description: 'Изменения были успешно сохранены'
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить клинику',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: ClinicFormData) => {
    const formData = new FormData();
    
    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // Add logo file if selected
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    if (clinic) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const specializations = [
    'implants', 'veneers', 'hygiene', 'endo', 'ortho', 'kids'
  ];

  const languages = ['ru', 'ro', 'en'];

  const promotionalLabels = [
    { value: 'top', label: 'ТОП', className: 'bg-yellow-500 text-white' },
    { value: 'high_rating', label: 'Высокий рейтинг', className: 'bg-green-500 text-white' },
    { value: 'premium', label: 'Премиум', className: 'bg-purple-500 text-white' },
    { value: 'verified_plus', label: 'Верифицирован+', className: 'bg-blue-500 text-white' },
    { value: 'popular', label: 'Популярное', className: 'bg-red-500 text-white' },
    { value: 'new', label: 'Новое', className: 'bg-orange-500 text-white' },
    { value: 'discount', label: 'Скидки', className: 'bg-pink-500 text-white' },
    { value: 'fast_service', label: 'Быстро', className: 'bg-teal-500 text-white' }
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Основная информация</h3>
          
          <div>
            <Label htmlFor="name">Название клиники *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Dental Clinic"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cityId">Город *</Label>
            <Select
              value={form.watch('cityId')}
              onValueChange={(value) => {
                form.setValue('cityId', value);
                // Reset district when city changes
                form.setValue('districtId', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.nameRu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Selection */}
          {selectedCityId && districts && districts.length > 0 && (
            <div>
              <Label htmlFor="districtId">Район</Label>
              <Select
                value={form.watch('districtId')}
                onValueChange={(value) => form.setValue('districtId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите район" />
                </SelectTrigger>
                <SelectContent>
                  {districts?.map((district: any) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.nameRu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Currency Selection */}
          <div>
            <Label htmlFor="currency">Валюта цен</Label>
            <Select
              value={form.watch('currency')}
              onValueChange={(value) => {
                form.setValue('currency', value);
                // Update currency for all existing services
                setServices(services.map(s => ({...s, currency: value})));
                setNewService({...newService, currency: value});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MDL">MDL (лей)</SelectItem>
                <SelectItem value="EUR">EUR (евро)</SelectItem>
                <SelectItem value="USD">USD (доллар)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              {...form.register('address')}
              placeholder="ул. Штефан чел Маре, 100"
            />
          </div>

          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+373 22 000 000"
            />
          </div>

          <div>
            <Label htmlFor="website">Веб-сайт</Label>
            <Input
              id="website"
              {...form.register('website')}
              placeholder="https://clinic.md"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Настройки и рейтинги</h3>

          {/* Logo Upload */}
          <div>
            <Label>Логотип клиники</Label>
            <div className="mt-2 space-y-3">
              {/* Current Logo Display */}
              {clinic?.logoUrl && !logoFile && (
                <div className="relative">
                  <img 
                    src={clinic.logoUrl} 
                    alt="Current logo" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <p className="text-sm text-gray-600 mt-1">Текущий логотип</p>
                </div>
              )}
              
              {/* File Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {logoFile ? 
                      `Выбран новый файл: ${logoFile.name}` : 
                      clinic?.logoUrl ? 'Выберите новый логотип' : 'Выберите файл изображения'
                    }
                  </p>
                </div>
              </label>
              
              {logoFile && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">Новый логотип будет загружен при сохранении</p>
                  <button
                    type="button"
                    onClick={() => setLogoFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Отменить выбор файла
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={form.watch('verified')}
                onCheckedChange={(checked) => form.setValue('verified', !!checked)}
              />
              <Label htmlFor="verified">Верифицирована</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cnam"
                checked={form.watch('cnam')}
                onCheckedChange={(checked) => form.setValue('cnam', !!checked)}
              />
              <Label htmlFor="cnam">CNAM</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availToday"
                checked={form.watch('availToday')}
                onCheckedChange={(checked) => form.setValue('availToday', !!checked)}
              />
              <Label htmlFor="availToday">Доступно сегодня</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommended"
                checked={form.watch('recommended')}
                onCheckedChange={(checked) => form.setValue('recommended', !!checked)}
              />
              <Label htmlFor="recommended">🔥 Рекомендуем (приоритетное размещение)</Label>
            </div>
          </div>

          {/* Rating Sliders */}
          <div className="space-y-4">
            <div>
              <Label>Ценовой индекс: {form.watch('priceIndex')}</Label>
              <Slider
                value={[form.watch('priceIndex')]}
                onValueChange={(value) => form.setValue('priceIndex', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Индекс доверия: {form.watch('trustIndex')}</Label>
              <Slider
                value={[form.watch('trustIndex')]}
                onValueChange={(value) => form.setValue('trustIndex', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Индекс отзывов: {form.watch('reviewsIndex')}</Label>
              <Slider
                value={[form.watch('reviewsIndex')]}
                onValueChange={(value) => form.setValue('reviewsIndex', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Индекс доступности: {form.watch('accessIndex')}</Label>
              <Slider
                value={[form.watch('accessIndex')]}
                onValueChange={(value) => form.setValue('accessIndex', value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            
            {/* Promotional Labels */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Рекламные лейблы</Label>
              <div className="grid grid-cols-2 gap-2">
                {promotionalLabels.map((label) => (
                  <div key={label.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`label-${label.value}`}
                      checked={form.watch('promotionalLabels').includes(label.value)}
                      onCheckedChange={(checked) => {
                        const currentLabels = form.watch('promotionalLabels');
                        if (checked) {
                          form.setValue('promotionalLabels', [...currentLabels, label.value]);
                        } else {
                          form.setValue('promotionalLabels', currentLabels.filter(l => l !== label.value));
                        }
                      }}
                    />
                    <Label htmlFor={`label-${label.value}`} className="text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${label.className}`}>
                        {label.label}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Management */}
            <Card>
              <CardHeader>
                <CardTitle>Услуги и цены</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service List */}
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-lg">{service.name}</span>
                      </div>
                      <div className="text-base text-gray-700 font-semibold min-w-[120px] text-right">
                        {service.price} {service.currency === 'MDL' ? 'лей' : service.currency}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedServices = services.filter((_, i) => i !== index);
                          setServices(updatedServices);
                        }}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add New Service */}
                <div className="border-t pt-6">
                  <Label className="text-lg font-medium mb-4 block">Добавить услугу</Label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <Input
                        placeholder="Название услуги (например: Имплант стандарт)"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        className="text-base"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Цена"
                          value={newService.price}
                          onChange={(e) => setNewService({...newService, price: e.target.value})}
                          className="text-base flex-1"
                        />
                        <div className="text-sm text-gray-500 flex items-center px-3 bg-gray-100 rounded border min-w-[60px] justify-center">
                          {form.watch('currency') === 'MDL' ? 'лей' : form.watch('currency')}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        onClick={() => {
                          if (newService.name && newService.price) {
                            setServices([...services, {
                              name: newService.name,
                              price: parseInt(newService.price),
                              currency: form.watch('currency')
                            }]);
                            setNewService({ name: '', price: '', currency: form.watch('currency') });
                          }
                        }}
                        disabled={!newService.name || !newService.price}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Service Templates */}
                <div className="border-t pt-6">
                  <Label className="text-lg font-medium mb-4 block">Быстрые шаблоны услуг</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      'Консультация стоматолога',
                      'Профгигиена', 
                      'Лечение кариеса',
                      'Имплант стандарт',
                      'Коронка керамика',
                      'Лечение каналов',
                      'Удаление зуба',
                      'Отбеливание',
                      'Виниры',
                      'Брекеты',
                      'Протезирование',
                      'Лечение десен'
                    ].map((templateName, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!services.find(s => s.name === templateName)) {
                            setNewService({...newService, name: templateName, currency: form.watch('currency')});
                          }
                        }}
                        disabled={!!services.find(s => s.name === templateName)}
                        className="text-sm justify-start"
                      >
                        {templateName}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Нажмите на шаблон, чтобы добавить название в поле выше, затем укажите цену
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {clinic ? 'Сохранить изменения' : 'Создать клинику'}
        </Button>
      </div>
    </form>
  );
}