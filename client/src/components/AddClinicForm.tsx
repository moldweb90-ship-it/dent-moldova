import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Building2, MapPin, Globe, Mail, Phone, FileText, CheckCircle } from 'lucide-react';

interface AddClinicFormProps {
  open: boolean;
  onClose: () => void;
}

export function AddClinicForm({ open, onClose }: AddClinicFormProps) {
  const { t, i18n } = useTranslation();
  const isRomanian = i18n.language === 'ro';
  
  const [loading, setLoading] = useState(false);

  // Fetch cities
  const { data: cities = [], isLoading: citiesLoading } = useQuery<any[]>({
    queryKey: ['/api/cities', i18n.language],
    queryFn: async () => {
      const response = await fetch('/api/cities');
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      return data;
    }
  });
  
  const [formData, setFormData] = useState({
    clinicName: '',
    city: '',
    address: '',
    website: '',
    email: '',
    phone: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clinicName.trim()) {
      newErrors.clinicName = isRomanian ? 'Numele clinicii este obligatoriu' : 'Название клиники обязательно';
    }
    if (!formData.city.trim()) {
      newErrors.city = isRomanian ? 'Orașul este obligatoriu' : 'Город обязателен';
    }
    if (!formData.address.trim()) {
      newErrors.address = isRomanian ? 'Adresa este obligatorie' : 'Адрес обязателен';
    }
    if (!formData.email.trim()) {
      newErrors.email = isRomanian ? 'Email-ul este obligatoriu' : 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRomanian ? 'Format email incorect' : 'Неверный формат email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = isRomanian ? 'Telefonul este obligatoriu' : 'Телефон обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Submitting clinic data:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormData({
        clinicName: '',
        city: '',
        address: '',
        website: '',
        email: '',
        phone: '',
        description: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting clinic:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] max-w-4xl h-[85vh] max-h-[85vh] overflow-hidden p-0 border-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Заголовок */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {isRomanian ? 'Adăugare clinică' : 'Размещение клиники'}
          </DialogTitle>
        </DialogHeader>

        {/* Контент */}
        <div className="p-6 overflow-y-auto h-full">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Название клиники и Город */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <Building2 className="h-3 w-3 text-blue-600" />
                  </span>
                  {isRomanian ? 'Numele clinicii' : 'Название клиники'} *
                </Label>
                <Input
                  id="clinicName"
                  value={formData.clinicName}
                  onChange={(e) => updateField('clinicName', e.target.value)}
                  placeholder={isRomanian ? 'Introduceți numele clinicii' : 'Введите название клиники'}
                  className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 ${errors.clinicName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                />
                {errors.clinicName && <p className="text-red-500 text-sm">{errors.clinicName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <MapPin className="h-3 w-3 text-green-600" />
                  </span>
                  {isRomanian ? 'Orașul' : 'Город'} *
                </Label>
                <Select value={formData.city} onValueChange={(value) => updateField('city', value)}>
                  <SelectTrigger className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <SelectValue placeholder={isRomanian ? 'Selectați orașul' : 'Выберите город'} />
                  </SelectTrigger>
                  <SelectContent>
                    {citiesLoading ? (
                      <SelectItem value="" disabled>
                        {isRomanian ? 'Se încarcă...' : 'Загрузка...'}
                      </SelectItem>
                    ) : (
                      cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {isRomanian ? city.nameRo || city.nameRu : city.nameRu || city.nameRo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>
            </div>

            {/* Адрес и Сайт */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <MapPin className="h-3 w-3 text-purple-600" />
                  </span>
                  {isRomanian ? 'Adresa' : 'Адрес'} *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={isRomanian ? 'Introduceți adresa' : 'Введите адрес'}
                  className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                    <Globe className="h-3 w-3 text-orange-600" />
                  </span>
                  {isRomanian ? 'Website' : 'Сайт'}
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder={isRomanian ? 'Introduceți website-ul' : 'Введите адрес сайта'}
                  className="border-2 border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email и Телефон */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                    <Mail className="h-3 w-3 text-red-600" />
                  </span>
                  {isRomanian ? 'Email' : 'Email'} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder={isRomanian ? 'Introduceți email-ul' : 'Введите email'}
                  className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                    <Phone className="h-3 w-3 text-teal-600" />
                  </span>
                  {isRomanian ? 'Telefonul' : 'Телефон'} *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder={isRomanian ? 'Introduceți telefonul' : 'Введите телефон'}
                  className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FileText className="h-3 w-3 text-indigo-600" />
                </span>
                {isRomanian ? 'Descrierea' : 'Описание'}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={isRomanian ? 'Introduceți descrierea clinicii' : 'Введите описание клиники'}
                rows={4}
                className="border-2 border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-400 transition-all duration-200 resize-none"
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all duration-300"
              >
                {isRomanian ? 'Anulare' : 'Отмена'}
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isRomanian ? 'Se trimite...' : 'Отправка...'}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isRomanian ? 'Trimite cererea' : 'Отправить заявку'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}