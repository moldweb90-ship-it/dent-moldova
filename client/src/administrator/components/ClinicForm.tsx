import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Plus, Trash2, Upload, X, Star, User, Calendar, DollarSign, Wrench, Flame, AlertTriangle, Shield, Award } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { getCurrencyName } from '@/lib/currency';
import { WorkingHoursEditor } from '@/components/WorkingHoursEditor';

interface ClinicFormProps {
  clinic?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

interface Service {
  id?: string;
  name: string;
  price: number;
  priceType: 'fixed' | 'from';
  currency: string;
}



export default function ClinicForm({ clinic, onCancel, onSuccess }: ClinicFormProps) {
  const { language } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<'ru' | 'ro'>('ru');
  const [servicesRu, setServicesRu] = useState<Service[]>(clinic?.servicesRu || []);
  const [servicesRo, setServicesRo] = useState<Service[]>(clinic?.servicesRo || []);
  
  // Load clinic with services if editing
  const { data: clinicWithServices } = useQuery({
    queryKey: ['/api/admin/clinics', clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return null;
      const response = await apiRequest('GET', `/api/admin/clinics/${clinic.id}`);
      return response.json();
    },
    enabled: !!clinic?.id, // Only run if we have a clinic ID (editing mode)
  });

  // Update services when clinic data is loaded
  useEffect(() => {
    if (clinicWithServices) {
      console.log('🔍 ClinicForm: loaded clinic with services:', clinicWithServices);
      setServicesRu(clinicWithServices.servicesRu || []);
      setServicesRo(clinicWithServices.servicesRo || []);
    }
    }, [clinicWithServices]);

  // Update working hours when clinic data is loaded (after form initialization)
  // useEffect(() => {
  //   console.log('🔍 useEffect for working hours triggered');
  //   console.log('🔍 clinicWithServices?.workingHours:', clinicWithServices?.workingHours);
  //   console.log('🔍 form exists:', !!form);
  //   
  //   if (clinicWithServices?.workingHours && form && form.getValues) {
  //     console.log('🔍 Setting working hours in form:', clinicWithServices.workingHours);
  //     // Используем setTimeout чтобы убедиться что форма полностью инициализирована
  //     setTimeout(() => {
  //       form.setValue('workingHours', clinicWithServices.workingHours);
  //       console.log('🔍 Working hours set in form');
  //     }, 0);
  //   }
  // }, [clinicWithServices?.workingHours, form]);

  // Debug logging
  console.log('🔍 ClinicForm: clinic data:', clinic);
  console.log('🔍 ClinicForm: servicesRu:', servicesRu);
  console.log('🔍 ClinicForm: servicesRo:', servicesRo);
  const [newService, setNewService] = useState<Service>({ name: '', price: 0, priceType: 'fixed', currency: 'MDL' });
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(clinic?.logoUrl || '');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: citiesData } = useQuery({
    queryKey: ['/api/admin/cities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/cities');
      return response.json();
    }
  });

  const cities = citiesData?.cities || [];

  // Sync currency when form loads
  useEffect(() => {
    if (clinic?.currency) {
      setNewService(prev => ({...prev, currency: clinic.currency}));
    }
  }, [clinic?.currency]);

  const form = useForm({
    defaultValues: {
      nameRu: clinic?.nameRu || '',
      nameRo: clinic?.nameRo || '',
      cityId: clinic?.cityId || '',
      districtId: clinic?.districtId || '',
      addressRu: clinic?.addressRu || '',
      addressRo: clinic?.addressRo || '',
      phone: clinic?.phone || '',
      website: clinic?.website || '',
      bookingUrl: clinic?.bookingUrl || '',
      currency: clinic?.currency || 'MDL',
      // Google Rating
      googleRating: clinic?.googleRating || '',
      googleReviewsCount: clinic?.googleReviewsCount || '',
      // Doctor Experience
      doctorExperience: clinic?.doctorExperience || 0,
      hasLicenses: clinic?.hasLicenses || false,
      hasCertificates: clinic?.hasCertificates || false,
      // Booking Convenience
      onlineBooking: clinic?.onlineBooking || false,
      weekendWork: clinic?.weekendWork || false,
      eveningWork: clinic?.eveningWork || false,
      urgentCare: clinic?.urgentCare || false,
      convenientLocation: clinic?.convenientLocation || false,
      // Pricing Policy (старые поля)
      installmentPlan: clinic?.installmentPlan || false,
      hasPromotions: clinic?.hasPromotions || false,
      // Pricing Policy (новые поля)
      publishedPricing: clinic?.publishedPricing || false,
      freeConsultation: clinic?.freeConsultation || false,
      interestFreeInstallment: clinic?.interestFreeInstallment || false,
      implantWarranty: clinic?.implantWarranty || false,
      popularServicesPromotions: clinic?.popularServicesPromotions || false,
      onlinePriceCalculator: clinic?.onlinePriceCalculator || false,
      // Additional Features
      pediatricDentistry: clinic?.pediatricDentistry || false,
              parking: clinic?.parking || false,
        sos: clinic?.sos || false,
  
        work24h: clinic?.work24h || false,
      credit: clinic?.credit || false,
      // Status
      verified: clinic?.verified || false,
      availToday: clinic?.availToday || false,
      recommended: clinic?.recommended || false,
      // Promotional Labels
      promotionalLabels: clinic?.promotionalLabels || [],
      // SEO fields
      seoTitleRu: clinic?.seoTitleRu || '',
      seoTitleRo: clinic?.seoTitleRo || '',
      seoDescriptionRu: clinic?.seoDescriptionRu || '',
      seoDescriptionRo: clinic?.seoDescriptionRo || '',
      seoKeywordsRu: clinic?.seoKeywordsRu || '',
      seoKeywordsRo: clinic?.seoKeywordsRo || '',
      seoH1Ru: clinic?.seoH1Ru || '',
      seoH1Ro: clinic?.seoH1Ro || '',
      ogTitleRu: clinic?.ogTitleRu || '',
      ogTitleRo: clinic?.ogTitleRo || '',
      ogDescriptionRu: clinic?.ogDescriptionRu || '',
      ogDescriptionRo: clinic?.ogDescriptionRo || '',
      ogImage: clinic?.ogImage || '',
      seoCanonical: clinic?.seoCanonical || '',
      seoRobots: clinic?.seoRobots || 'index,follow',
      seoPriority: clinic?.seoPriority || 0.5,
      seoSchemaType: clinic?.seoSchemaType || 'Dentist',
      seoSchemaData: clinic?.seoSchemaData || {},
      workingHours: clinic?.workingHours || [],
      sosEnabled: clinic?.sosEnabled || false,
    }
  });


  const createClinicMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔍 createClinicMutation: starting...');
      console.log('🔍 Form data:', data);
      console.log('🔍 Current servicesRu:', servicesRu);
      console.log('🔍 Current servicesRo:', servicesRo);
      
      const formData = new FormData();
      
      // Add basic data
      Object.keys(data).forEach(key => {
        if (key === 'promotionalLabels' || key === 'seoSchemaData') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Add default ratings (since we removed the calculation)
      formData.append('priceIndex', '70');
      formData.append('trustIndex', '70');
      formData.append('reviewsIndex', '70');
      formData.append('accessIndex', '70');
      formData.append('dScore', '70');

      // Add services
      const servicesRuJson = JSON.stringify(servicesRu);
      const servicesRoJson = JSON.stringify(servicesRo);
      console.log('🔍 Services RU JSON:', servicesRuJson);
      console.log('🔍 Services RO JSON:', servicesRoJson);
      
      formData.append('servicesRu', servicesRuJson);
      formData.append('servicesRo', servicesRoJson);

      // Add working hours
      const workingHours = form.watch('workingHours');
      if (workingHours && workingHours.length > 0) {
        formData.append('workingHours', JSON.stringify(workingHours));
      }

      // Add logo
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await apiRequest('POST', '/api/admin/clinics', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      toast({
        title: 'Успешно',
        description: 'Клиника создана'
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать клинику',
        variant: 'destructive'
      });
    }
  });

  const updateClinicMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔍 updateClinicMutation: starting...');
      console.log('🔍 Form data:', data);
      console.log('🔍 sosEnabled value:', data.sosEnabled);
      console.log('🔍 sosEnabled type:', typeof data.sosEnabled);
      console.log('🔍 Current servicesRu:', servicesRu);
      console.log('🔍 Current servicesRo:', servicesRo);
      
      const formData = new FormData();
      
      // Add basic data
      Object.keys(data).forEach(key => {
        if (key === 'promotionalLabels' || key === 'seoSchemaData') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Add default ratings (since we removed the calculation)
      formData.append('priceIndex', '70');
      formData.append('trustIndex', '70');
      formData.append('reviewsIndex', '70');
      formData.append('accessIndex', '70');
      formData.append('dScore', '70');

      // Add services
      const servicesRuJson = JSON.stringify(servicesRu);
      const servicesRoJson = JSON.stringify(servicesRo);
      console.log('🔍 Services RU JSON:', servicesRuJson);
      console.log('🔍 Services RO JSON:', servicesRoJson);
      
      formData.append('servicesRu', servicesRuJson);
      formData.append('servicesRo', servicesRoJson);

      // Add working hours
      const workingHours = form.watch('workingHours');
      if (workingHours && workingHours.length > 0) {
        formData.append('workingHours', JSON.stringify(workingHours));
      }

      // Add logo
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await apiRequest('PUT', `/api/admin/clinics/${clinic.id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      toast({
        title: 'Успешно',
        description: 'Клиника обновлена'
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить клинику',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (clinic) {
        await updateClinicMutation.mutateAsync(data);
      } else {
        await createClinicMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving clinic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addService = () => {
    console.log('🔍 Adding service:', newService);
    console.log('🔍 Current language:', currentLanguage);
    console.log('🔍 Current servicesRu:', servicesRu);
    console.log('🔍 Current servicesRo:', servicesRo);
    
    if (newService.name && newService.price >= 0) {
      const service = { ...newService, id: Date.now().toString() };
      console.log('🔍 New service object:', service);
      
      if (currentLanguage === 'ru') {
        const updatedServices = [...servicesRu, service];
        console.log('🔍 Updated servicesRu:', updatedServices);
        setServicesRu(updatedServices);
      } else {
        const updatedServices = [...servicesRo, service];
        console.log('🔍 Updated servicesRo:', updatedServices);
        setServicesRo(updatedServices);
      }
      setNewService({ name: '', price: 0, priceType: 'fixed', currency: form.watch('currency') });
    }
  };

  const removeService = (id: string) => {
    // Remove from both arrays since we don't know which language it was added in
      setServicesRu(servicesRu.filter(s => s.id !== id));
      setServicesRo(servicesRo.filter(s => s.id !== id));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const promotionalLabels: Array<{id: string, label: string, color: string}> = [
    { id: 'premium', label: 'Премиум', color: 'bg-purple-500' },
    { id: 'discount', label: 'Скидки', color: 'bg-pink-500' },
    { id: 'new', label: 'Новое', color: 'bg-yellow-500' },
    { id: 'popular', label: 'Выбор пациентов', color: 'bg-red-500' },
    { id: 'high_rating', label: 'Высокий рейтинг', color: 'bg-green-500' }
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            📋 Основная информация
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            ⚙️ Настройки и рейтинги
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            🔍 SEO настройки
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6">
          {/* Basic Info and Logo - Better balanced layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Основная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameRu">Название клиники *</Label>
                  <Input
                    id="nameRu"
                    {...form.register('nameRu')}
                    placeholder="Доктор Романюк"
                  />
                </div>

                <div>
                  <Label htmlFor="nameRo">Название клиники (RO) *</Label>
                  <Input
                    id="nameRo"
                    {...form.register('nameRo')}
                    placeholder="Doctor Romaniuc"
                  />
                </div>

                <div>
                  <Label htmlFor="cityId">Город *</Label>
                  <Select
                    value={form.watch('cityId')}
                    onValueChange={(value) => {
                      form.setValue('cityId', value);
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

                <div>
                  <Label htmlFor="districtId">Район</Label>
                  <Select
                    value={form.watch('districtId')}
                    onValueChange={(value) => form.setValue('districtId', value)}
                    disabled={!form.watch('cityId')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите район" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.watch('cityId') && (
                        <DistrictsSelect cityId={form.watch('cityId')} />
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                   <Label htmlFor="currency">Валюта цен</Label>
                   <Select
                     value={form.watch('currency')}
                     onValueChange={(value) => {
                       form.setValue('currency', value);
                       setNewService({...newService, currency: value});
                     }}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Выберите валюту" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="MDL">MDL ({getCurrencyName('MDL', language)})</SelectItem>
                       <SelectItem value="EUR">EUR ({getCurrencyName('EUR', language)})</SelectItem>
                       <SelectItem value="USD">USD ({getCurrencyName('USD', language)})</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="+373 XX XXX XXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addressRu">Адрес</Label>
                  <Input
                    id="addressRu"
                    {...form.register('addressRu')}
                    placeholder="ул. Джинта Латинэ 3/6"
                  />
                </div>

                <div>
                  <Label htmlFor="addressRo">Адрес (RO)</Label>
                  <Input
                    id="addressRo"
                    {...form.register('addressRo')}
                    placeholder="str. Ginta Latina 3/6"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Веб-сайт</Label>
                  <Input
                    id="website"
                    {...form.register('website')}
                    placeholder="http://dr-romaniuc.md/"
                  />
                </div>

                <div>
                  <Label htmlFor="bookingUrl">Ссылка для записи</Label>
                  <Input
                    id="bookingUrl"
                    {...form.register('bookingUrl')}
                    placeholder="https://booking.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Cover Photo Upload - Takes 1 column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Фото обложки</h3>
              
              {logoPreview ? (
                <div className="space-y-4">
                  <div>
                    <Label>Текущее фото обложки</Label>
                    <div className="mt-2">
                      <img 
                        src={logoPreview} 
                        alt="Cover photo preview" 
                        className="w-full max-w-48 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="mt-2 text-sm text-gray-600">
                          Выберите новое фото обложки
                        </div>
                      </div>
                    </Label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2 text-sm text-gray-600">
                        Выберите фото обложки
                      </div>
                    </div>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Время работы клиники</h3>
            <WorkingHoursEditor
              clinicId={clinic?.id || 'new'}
              initialWorkingHours={clinic?.workingHours || []}
              onSave={async (workingHours) => {
                console.log('🔍 WorkingHoursEditor onSave called with:', workingHours);
                
                // Сохраняем время работы в форме
                form.setValue('workingHours', workingHours);
                
                // Если это редактирование существующей клиники, сохраняем на сервер
                if (clinic?.id && clinic.id !== 'new') {
                  console.log('🔍 Saving working hours to server for clinic:', clinic.id);
                  try {
                    console.log('🔍 Sending working hours data:', workingHours);
                    const response = await apiRequest('PUT', `/api/admin/clinics/${clinic.id}/working-hours`, workingHours);
                    
                    console.log('🔍 Server response status:', response.status);
                    
                    if (response.ok) {
                      const responseData = await response.json();
                      console.log('🔍 Server response data:', responseData);
                      

                      // Обновляем кэш клиник
                      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
                      console.log('🔍 Cache invalidated');
                    } else {
                      const errorText = await response.text();
                      console.error('🔍 Server error response:', errorText);
                      throw new Error(`Failed to save working hours: ${response.status} ${errorText}`);
                    }
                  } catch (error) {
                    console.error('❌ Error saving working hours:', error);
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось сохранить время работы',
                      variant: 'destructive'
                    });
                  }
                } else {
                  console.log('🔍 Not saving to server - new clinic or no clinic ID');
                }
              }}
            />
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Услуги и цены</h3>
             
             {/* Language Toggle */}
             <div className="flex items-center space-x-4 mb-4">
               <span className="text-sm font-medium">Язык для добавления услуг:</span>
               <div className="flex bg-gray-100 rounded-lg p-1">
                 <button
                   type="button"
                   onClick={() => setCurrentLanguage('ru')}
                   className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                     currentLanguage === 'ru' 
                       ? 'bg-white text-blue-600 shadow-sm' 
                       : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   🇷🇺 Русский
                 </button>
                 <button
                   type="button"
                   onClick={() => setCurrentLanguage('ro')}
                   className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                     currentLanguage === 'ro' 
                       ? 'bg-white text-green-600 shadow-sm' 
                       : 'text-gray-600 hover:text-gray-900'
                   }`}
                 >
                   🇷🇴 Română
                 </button>
               </div>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Russian Services */}
              <div className="space-y-4">
                <h4 className="font-medium text-blue-600">🇷🇺 Услуги на русском</h4>
                <div className="space-y-2">
                  {servicesRu.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">
                          {service.priceType === 'from' ? 'от ' : ''}{service.price} {service.currency}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(service.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Romanian Services */}
              <div className="space-y-4">
                <h4 className="font-medium text-green-600">🇷🇴 Servicii în română</h4>
                <div className="space-y-2">
                  {servicesRo.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">
                          {service.priceType === 'from' ? 'de la ' : ''}{service.price} {service.currency}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(service.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add New Service */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Добавить услугу</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <Label>Название услуги</Label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                        placeholder={currentLanguage === 'ru' ? "Название услуги" : "Numele serviciului"}
                    />
                  </div>
                  <div>
                    <Label>Валюта</Label>
                    <Select
                      value={newService.currency}
                      onValueChange={(value) => setNewService({...newService, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MDL">MDL</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Тип цены</Label>
                    <RadioGroup
                      value={newService.priceType}
                      onValueChange={(value: 'fixed' | 'from') => setNewService({...newService, priceType: value})}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed" className="text-sm">Фиксированная цена</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="from" id="from" />
                        <Label htmlFor="from" className="text-sm">Цена от</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Цена</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-600">{newService.currency === 'MDL' ? getCurrencyName('MDL', language) : newService.currency}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Button type="button" onClick={addService} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                      <span>Добавить</span>
                  </Button>
                    <span className="text-sm text-gray-500">
                      на языке: {currentLanguage === 'ru' ? 'Русский' : 'Română'}
                    </span>
                </div>
                </CardContent>
              </Card>

              {/* Quick Service Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Быстрые шаблоны услуг</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {currentLanguage === 'ru' ? (
                      <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                          onClick={() => setNewService({...newService, name: 'Консультация'})}
                          className="text-xs"
                      >
                          Консультац
                      </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Профгигиена'})}
                          className="text-xs"
                        >
                          Профгигиее
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Лечение кариеса'})}
                          className="text-xs"
                        >
                          Лечение ка
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Имплант стандарт'})}
                          className="text-xs"
                        >
                          Имплант станда
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Коронка керамика'})}
                          className="text-xs"
                        >
                          Коронка ке
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Лечение каналов'})}
                          className="text-xs"
                        >
                          Лечение кана
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Удаление зуба'})}
                          className="text-xs"
                        >
                          Удаление зуботбеливание
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Виниры'})}
                          className="text-xs"
                        >
                          Виниры
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Брекеты'})}
                          className="text-xs"
                        >
                          Брекеты
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Протезирование'})}
                          className="text-xs"
                        >
                          Протезиров
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Лечение десен'})}
                          className="text-xs"
                        >
                          Лечение десен
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Consultație'})}
                          className="text-xs"
                        >
                          Consultație
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Igienă profesională'})}
                          className="text-xs"
                        >
                          Igienă prof
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Tratament cariu'})}
                          className="text-xs"
                        >
                          Tratament cariu
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Implant standard'})}
                          className="text-xs"
                        >
                          Implant standard
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Coroană ceramică'})}
                          className="text-xs"
                        >
                          Coroană ceramică
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Tratament canal'})}
                          className="text-xs"
                        >
                          Tratament canal
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Extracție dinte'})}
                          className="text-xs"
                        >
                          Extracție dinte
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Fațete'})}
                          className="text-xs"
                        >
                          Fațete
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Aparat dentar'})}
                          className="text-xs"
                        >
                          Aparat dentar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Protezare'})}
                          className="text-xs"
                        >
                          Protezare
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewService({...newService, name: 'Tratament gingii'})}
                          className="text-xs"
                        >
                          Tratament gingii
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Нажмите на шаблон, чтобы добавить название в поле выше, затем укажите цену
                  </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status and Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Статусы и верификация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={form.watch('verified')}
                      onCheckedChange={(checked) => form.setValue('verified', checked as boolean)}
                    />
                    <Label htmlFor="verified">Верифицирована</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="availToday"
                      checked={form.watch('availToday')}
                      onCheckedChange={(checked) => form.setValue('availToday', checked as boolean)}
                    />
                    <Label htmlFor="availToday">Доступно сегодня</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recommended"
                      checked={form.watch('recommended')}
                      onCheckedChange={(checked) => form.setValue('recommended', checked as boolean)}
                    />
                    <Label htmlFor="recommended" className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Рекомендуем (приоритетное размещение)
                    </Label>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sosEnabled"
                        checked={form.watch('sosEnabled')}
                        onCheckedChange={(checked) => form.setValue('sosEnabled', checked as boolean)}
                      />
                      <Label htmlFor="sosEnabled" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        SOS Кнопка
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Показывает анимированную SOS кнопку на странице клиники для экстренной связи. 
                      Кнопка позволяет пользователям быстро позвонить или скопировать номер телефона.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promotional Labels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Рекламные лейблы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {promotionalLabels.map((label) => (
                    <div key={label.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={label.id}
                        checked={form.watch('promotionalLabels').includes(label.id)}
                        onCheckedChange={(checked) => {
                          const currentLabels = form.watch('promotionalLabels');
                          if (checked) {
                            form.setValue('promotionalLabels', [...currentLabels, label.id]);
                          } else {
                            form.setValue('promotionalLabels', currentLabels.filter((id: string) => id !== label.id));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={label.id} 
                        className={`text-sm px-2 py-1 rounded text-white ${label.color} cursor-pointer`}
                      >
                        {label.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Выберите один или несколько лейблов. Можно снять все галочки.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Clinic Characteristics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Convenience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Удобство записи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlineBooking"
                      checked={form.watch('onlineBooking')}
                      onCheckedChange={(checked) => form.setValue('onlineBooking', checked as boolean)}
                    />
                    <Label htmlFor="onlineBooking">Онлайн запись на сайте</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekendWork"
                      checked={form.watch('weekendWork')}
                      onCheckedChange={(checked) => form.setValue('weekendWork', checked as boolean)}
                    />
                    <Label htmlFor="weekendWork">Работает в выходные</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eveningWork"
                      checked={form.watch('eveningWork')}
                      onCheckedChange={(checked) => form.setValue('eveningWork', checked as boolean)}
                    />
                    <Label htmlFor="eveningWork">Работает вечером (после 18:00)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgentCare"
                      checked={form.watch('urgentCare')}
                      onCheckedChange={(checked) => form.setValue('urgentCare', checked as boolean)}
                    />
                    <Label htmlFor="urgentCare">Срочный прием</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="convenientLocation"
                      checked={form.watch('convenientLocation')}
                      onCheckedChange={(checked) => form.setValue('convenientLocation', checked as boolean)}
                    />
                    <Label htmlFor="convenientLocation">Удобное расположение (центр, парковка)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  Ценовая политика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="publishedPricing"
                      checked={form.watch('publishedPricing')}
                      onCheckedChange={(checked) => form.setValue('publishedPricing', checked as boolean)}
                    />
                    <Label htmlFor="publishedPricing">Опубликован прайс на сайте/в приложении</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="freeConsultation"
                      checked={form.watch('freeConsultation')}
                      onCheckedChange={(checked) => form.setValue('freeConsultation', checked as boolean)}
                    />
                    <Label htmlFor="freeConsultation">Бесплатная консультация</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interestFreeInstallment"
                      checked={form.watch('interestFreeInstallment')}
                      onCheckedChange={(checked) => form.setValue('interestFreeInstallment', checked as boolean)}
                    />
                    <Label htmlFor="interestFreeInstallment">Рассрочка без %</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="implantWarranty"
                      checked={form.watch('implantWarranty')}
                      onCheckedChange={(checked) => form.setValue('implantWarranty', checked as boolean)}
                    />
                    <Label htmlFor="implantWarranty">Гарантия на импланты/работы</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="popularServicesPromotions"
                      checked={form.watch('popularServicesPromotions')}
                      onCheckedChange={(checked) => form.setValue('popularServicesPromotions', checked as boolean)}
                    />
                    <Label htmlFor="popularServicesPromotions">Акции на популярные услуги</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlinePriceCalculator"
                      checked={form.watch('onlinePriceCalculator')}
                      onCheckedChange={(checked) => form.setValue('onlinePriceCalculator', checked as boolean)}
                    />
                    <Label htmlFor="onlinePriceCalculator">Онлайн-калькулятор стоимости</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                Дополнительные характеристики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pediatricDentistry"
                    checked={form.watch('pediatricDentistry')}
                    onCheckedChange={(checked) => form.setValue('pediatricDentistry', checked as boolean)}
                  />
                  <Label htmlFor="pediatricDentistry">Детская стоматология</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={form.watch('parking')}
                    onCheckedChange={(checked) => form.setValue('parking', checked as boolean)}
                  />
                  <Label htmlFor="parking">Парковка</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sos"
                    checked={form.watch('sos')}
                    onCheckedChange={(checked) => form.setValue('sos', checked as boolean)}
                  />
                  <Label htmlFor="sos">SOS</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="work24h"
                    checked={form.watch('work24h')}
                    onCheckedChange={(checked) => form.setValue('work24h', checked as boolean)}
                  />
                  <Label htmlFor="work24h">24/7</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="credit"
                    checked={form.watch('credit')}
                    onCheckedChange={(checked) => form.setValue('credit', checked as boolean)}
                  />
                  <Label htmlFor="credit">Рассрочка/кредит</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Basic */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Основные SEO настройки</h3>
              
              <div>
                <Label htmlFor="seoTitleRu">SEO Title (RU)</Label>
                <Input
                  id="seoTitleRu"
                  {...form.register('seoTitleRu')}
                  placeholder="Стоматологическая клиника [Название] - лечение зубов в [Город]"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Заголовок страницы для поисковых систем (до 60 символов)
                </p>
              </div>

              <div>
                <Label htmlFor="seoTitleRo">SEO Title (RO)</Label>
                <Input
                  id="seoTitleRo"
                  {...form.register('seoTitleRo')}
                  placeholder="Clinică stomatologică [Nume] - tratament dentar în [Oraș]"
                  maxLength={60}
                />
              </div>

              <div>
                <Label htmlFor="seoDescriptionRu">Meta Description (RU)</Label>
                <Input
                  id="seoDescriptionRu"
                  {...form.register('seoDescriptionRu')}
                  placeholder="Описание клиники для поисковых систем..."
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Описание для поисковых систем (до 160 символов)
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescriptionRo">Meta Description (RO)</Label>
                <Input
                  id="seoDescriptionRo"
                  {...form.register('seoDescriptionRo')}
                  placeholder="Descrierea clinicii pentru motoarele de căutare..."
                  maxLength={160}
                />
              </div>

              <div>
                <Label htmlFor="seoKeywordsRu">Keywords (RU)</Label>
                <Input
                  id="seoKeywordsRu"
                  {...form.register('seoKeywordsRu')}
                  placeholder="стоматология, лечение зубов, импланты, отбеливание"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ключевые слова через запятую
                </p>
              </div>

              <div>
                <Label htmlFor="seoKeywordsRo">Keywords (RO)</Label>
                <Input
                  id="seoKeywordsRo"
                  {...form.register('seoKeywordsRo')}
                  placeholder="stomatologie, tratament dentar, implanturi, albire"
                />
              </div>

              <div>
                <Label htmlFor="seoH1Ru">H1 Заголовок (RU)</Label>
                <Input
                  id="seoH1Ru"
                  {...form.register('seoH1Ru')}
                  placeholder="Стоматологическая клиника [Название]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Главный заголовок страницы (H1)
                </p>
              </div>

              <div>
                <Label htmlFor="seoH1Ro">H1 Заголовок (RO)</Label>
                <Input
                  id="seoH1Ro"
                  {...form.register('seoH1Ro')}
                  placeholder="Clinică stomatologică [Nume]"
                />
              </div>
            </div>

            {/* Open Graph */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Open Graph (социальные сети)</h3>
              
              <div>
                <Label htmlFor="ogTitleRu">OG Title (RU)</Label>
                <Input
                  id="ogTitleRu"
                  {...form.register('ogTitleRu')}
                  placeholder="Заголовок для соцсетей"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Заголовок при шаринге в соцсетях
                </p>
              </div>

              <div>
                <Label htmlFor="ogTitleRo">OG Title (RO)</Label>
                <Input
                  id="ogTitleRo"
                  {...form.register('ogTitleRo')}
                  placeholder="Titlu pentru rețelele sociale"
                />
              </div>

              <div>
                <Label htmlFor="ogDescriptionRu">OG Description (RU)</Label>
                <Input
                  id="ogDescriptionRu"
                  {...form.register('ogDescriptionRu')}
                  placeholder="Описание для соцсетей..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Описание при шаринге в соцсетях
                </p>
              </div>

              <div>
                <Label htmlFor="ogDescriptionRo">OG Description (RO)</Label>
                <Input
                  id="ogDescriptionRo"
                  {...form.register('ogDescriptionRo')}
                  placeholder="Descriere pentru rețelele sociale..."
                />
              </div>

              <div>
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  {...form.register('ogImage')}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL изображения для соцсетей
                </p>
              </div>
            </div>
          </div>

          {/* Advanced SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Дополнительные настройки</h3>
              
              <div>
                <Label htmlFor="seoCanonical">Canonical URL</Label>
                <Input
                  id="seoCanonical"
                  {...form.register('seoCanonical')}
                  placeholder="https://dentmoldova.md/clinic/[slug]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Канонический URL страницы
                </p>
              </div>

              <div>
                <Label htmlFor="seoRobots">Robots Meta</Label>
                <Select
                  value={form.watch('seoRobots')}
                  onValueChange={(value) => form.setValue('seoRobots', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите robots meta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">index,follow</SelectItem>
                    <SelectItem value="noindex,follow">noindex,follow</SelectItem>
                    <SelectItem value="index,nofollow">index,nofollow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex,nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="seoPriority">Sitemap Priority</Label>
                <Select
                  value={String(form.watch('seoPriority') || 0.5)}
                  onValueChange={(value) => form.setValue('seoPriority', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">1.0 - Высший</SelectItem>
                    <SelectItem value="0.8">0.8 - Высокий</SelectItem>
                    <SelectItem value="0.6">0.6 - Средний</SelectItem>
                    <SelectItem value="0.4">0.4 - Низкий</SelectItem>
                    <SelectItem value="0.2">0.2 - Минимальный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="seoSchemaType">Schema.org Type</Label>
                <Select
                  value={form.watch('seoSchemaType')}
                  onValueChange={(value) => form.setValue('seoSchemaType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип схемы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dentist">Dentist</SelectItem>
                    <SelectItem value="MedicalBusiness">MedicalBusiness</SelectItem>
                    <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Автогенерация SEO</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🚀 Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const nameRu = form.watch('nameRu');
                      const nameRo = form.watch('nameRo');
                      const city = cities.find((c: any) => c.id === form.watch('cityId'));
                      if ((nameRu || nameRo) && city) {
                        const name = nameRu || nameRo;
                        form.setValue('seoTitleRu', `${name} - стоматологическая клиника в ${city.nameRu}`);
                        form.setValue('seoTitleRo', `${name} - clinică stomatologică în ${city.nameRo}`);
                        form.setValue('seoH1Ru', `${name} - стоматологическая клиника`);
                        form.setValue('seoH1Ro', `${name} - clinică stomatologică`);
                        form.setValue('ogTitleRu', `${name} - стоматологическая клиника`);
                        form.setValue('ogTitleRo', `${name} - clinică stomatologică`);
                      }
                    }}
                    className="w-full"
                  >
                    Сгенерировать заголовки
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const nameRu = form.watch('nameRu');
                      const nameRo = form.watch('nameRo');
                      const city = cities.find((c: any) => c.id === form.watch('cityId'));
                      if ((nameRu || nameRo) && city) {
                        const name = nameRu || nameRo;
                        form.setValue('seoDescriptionRu', 
                          `${name} - современная стоматологическая клиника в ${city.nameRu}. Запись онлайн, консультация бесплатно.`
                        );
                        form.setValue('seoDescriptionRo', 
                          `${name} - clinică stomatologică modernă în ${city.nameRo}. Programare online, consultație gratuită.`
                        );
                        form.setValue('ogDescriptionRu', 
                          `${name} - стоматологическая клиника в ${city.nameRu}`
                        );
                        form.setValue('ogDescriptionRo', 
                          `${name} - clinică stomatologică în ${city.nameRo}`
                        );
                      }
                    }}
                    className="w-full"
                  >
                    Сгенерировать описания
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const keywordsRu = [
                        'стоматология',
                        'лечение зубов',
                        'стоматолог',
                        'импланты',
                        'отбеливание',
                        'гигиена'
                      ];
                      const keywordsRo = [
                        'stomatologie',
                        'tratament dentar',
                        'stomatolog',
                        'implanturi',
                        'albire',
                        'igienă'
                      ];
                      form.setValue('seoKeywordsRu', keywordsRu.join(', '));
                      form.setValue('seoKeywordsRo', keywordsRo.join(', '));
                    }}
                    className="w-full"
                  >
                    Сгенерировать ключевые слова
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {clinic ? 'Сохранить изменения' : 'Создать клинику'}
        </Button>
      </div>
    </form>
  );
}

// Districts Select Component
function DistrictsSelect({ cityId }: { cityId: string }) {
  const { data: districtsData, isLoading } = useQuery({
    queryKey: ['/api/admin/cities', cityId, 'districts'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/cities/${cityId}/districts`);
      return response.json();
    },
    enabled: !!cityId
  });

  const districts = districtsData?.districts || [];

  if (isLoading) {
    return <SelectItem value="loading" disabled>Загрузка районов...</SelectItem>;
  }

  if (districts.length === 0) {
    return <SelectItem value="no_districts">Нет районов</SelectItem>;
  }

  return (
    <>
      {districts.map((district: any) => (
        <SelectItem key={district.id} value={district.id}>
          {district.nameRu}
        </SelectItem>
      ))}
    </>
  );
}
