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
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

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
  accessIndex: z.number().min(0).max(100)
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface ClinicFormProps {
  clinic?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClinicForm({ clinic, onSuccess, onCancel }: ClinicFormProps) {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: cities } = useQuery({
    queryKey: ['/api/cities'],
    queryFn: () => apiRequest('/api/cities')
  });

  const { data: districts } = useQuery({
    queryKey: ['/api/cities', clinic?.cityId || '', 'districts'],
    queryFn: () => clinic?.cityId ? apiRequest(`/api/cities/${clinic.cityId}/districts`) : [],
    enabled: !!clinic?.cityId
  });

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
      accessIndex: clinic?.accessIndex || 50
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest('/api/admin/clinics', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
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
    mutationFn: (data: FormData) => apiRequest(`/api/admin/clinics/${clinic.id}`, {
      method: 'PUT',
      body: data
    }),
    onSuccess: () => {
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
              onValueChange={(value) => form.setValue('cityId', value)}
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
            <div className="mt-2">
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
                    {logoFile ? logoFile.name : 'Выберите файл изображения'}
                  </p>
                </div>
              </label>
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