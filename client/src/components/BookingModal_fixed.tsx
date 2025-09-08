import { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { getClinicName } from '../lib/utils';
import { Calendar, Clock, User, Phone, Mail, MessageCircle, Stethoscope, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Clinic {
  id: string;
  name: string;
  nameRu?: string;
  nameRo?: string;
  specializations: string[];
  phone?: string;
  website?: string;
  workingHours?: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breakStartTime: string;
    breakEndTime: string;
    is24Hours: boolean;
  }>;
}

interface BookingModalProps {
  clinic: Clinic | null;
  open: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  phone: string;
  email: string;
  contactMethod: string;
  service: string;
  date: string;
  time: string;
  comment: string;
  agreement: boolean;
}

export function BookingModal({ clinic, open, onClose }: BookingModalProps) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clinicServices, setClinicServices] = useState<{id: string, name: string, price: number, currency: string}[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    phone: '',
    email: '',
    contactMethod: 'phone',
    service: '',
    date: '',
    time: '',
    comment: '',
    agreement: false
  });

  // Загружаем услуги клиники
  useEffect(() => {
    const loadClinicServices = async () => {
      if (!clinic?.id) {
        console.log('BookingModal: Нет ID клиники');
        setClinicServices([]);
        return;
      }
      
      try {
        console.log('BookingModal: Загружаем услуги для клиники:', clinic.id, 'язык:', language);
        const response = await apiRequest('GET', `/api/clinics/${clinic.id}/services?language=${language}`);
        const services = await response.json();
        console.log('BookingModal: Получены услуги:', services);
        setClinicServices(services);
      } catch (error) {
        console.error('BookingModal: Ошибка загрузки услуг клиники:', error);
        // Если не удалось загрузить, используем пустой массив
        setClinicServices([]);
      }
    };

    loadClinicServices();
  }, [clinic?.id, language]);

  // Функция для генерации временных слотов на основе рабочих часов клиники
  const generateTimeSlots = (selectedDate: string) => {
    if (!selectedDate || !clinic?.workingHours || clinic.workingHours.length === 0) {
      // Возвращаем стандартные слоты если нет данных о рабочих часах
      return [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00'
      ];
    }

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Находим рабочие часы для выбранного дня
    const dayWorkingHours = clinic.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    
    if (!dayWorkingHours || !dayWorkingHours.isOpen) {
      return []; // Клиника не работает в этот день
    }

    if (dayWorkingHours.is24Hours) {
      const slots = [];
      for (let hour = 0; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    }

    if (!dayWorkingHours.openTime || !dayWorkingHours.closeTime) {
      return [];
    }

    const slots = [];
    const openTime = dayWorkingHours.openTime;
    const closeTime = dayWorkingHours.closeTime;
    const breakStart = dayWorkingHours.breakStartTime;
    const breakEnd = dayWorkingHours.breakEndTime;

    const openHour = parseInt(openTime.split(':')[0]);
    const openMinute = parseInt(openTime.split(':')[1]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    const closeMinute = parseInt(closeTime.split(':')[1]);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Проверяем, не попадает ли время в перерыв
      if (breakStart && breakEnd) {
        const breakStartHour = parseInt(breakStart.split(':')[0]);
        const breakStartMinute = parseInt(breakStart.split(':')[1]);
        const breakEndHour = parseInt(breakEnd.split(':')[0]);
        const breakEndMinute = parseInt(breakEnd.split(':')[1]);
        
        const isInBreak = (
          (currentHour > breakStartHour || (currentHour === breakStartHour && currentMinute >= breakStartMinute)) &&
          (currentHour < breakEndHour || (currentHour === breakEndHour && currentMinute < breakEndMinute))
        );
        
        if (!isInBreak) {
          slots.push(timeString);
        }
      } else {
        slots.push(timeString);
      }

      // Увеличиваем время на 30 минут
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Генерируем временные слоты на основе выбранной даты
  const timeSlots = generateTimeSlots(formData.date);

  // Сбрасываем выбранное время при изменении даты
  useEffect(() => {
    if (formData.time && timeSlots.length > 0 && !timeSlots.includes(formData.time)) {
      updateField('time', '');
    }
  }, [formData.date, timeSlots]);

  const formatPhoneNumber = (value: string) => {
    // Убираем форматирование, позволяем вводить любой код страны
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateField('phone', formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    } else if (formData.phone.replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Введите корректный номер телефона (минимум 7 цифр)';
    }
    if (!formData.agreement) newErrors.agreement = 'Необходимо согласие';

    // Email validation - только если поле заполнено
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Неверный формат email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const bookingData = {
        clinicId: clinic!.id,
        firstName: formData.firstName.trim(),
        phone: formData.phone,
        email: formData.email.trim() || undefined,
        contactMethod: formData.contactMethod,
        service: formData.service,
        preferredDate: formData.date,
        preferredTime: formData.time,
        notes: formData.comment.trim() || undefined,
      };

      console.log('Sending booking data:', bookingData);

      await apiRequest('POST', '/api/bookings', bookingData);
      
      toast({
        title: t('bookingSuccess'),
        description: `${t('bookingSuccessDesc')} ${getClinicName(clinic!, language)}.`,
      });
      
      onClose();
      
      setFormData({
        firstName: '',
        phone: '',
        email: '',
        contactMethod: 'phone',
        service: '',
        date: '',
        time: '',
        comment: '',
        agreement: false
      });
    } catch (error: any) {
      toast({
        title: t('bookingError'),
        description: error.message || t('bookingErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!clinic) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-auto bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="border-b border-gray-200 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 p-6 rounded-t-lg">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4 text-white" />
            </div>
            {t('bookingToClinic')} {getClinicName(clinic, language) || t('clinic')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Имя и Телефон в одной строке */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <User className="h-3 w-3 text-blue-600" />
                </span>
                {t('firstName')} *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder={t('firstNamePlaceholder')}
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
                             {errors.firstName && <p className="text-red-500 text-sm mt-1 flex items-center">
                 <AlertTriangle className="h-3 w-3 mr-1" />
                 {errors.firstName}
               </p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Phone className="h-3 w-3 text-green-600" />
                </span>
                {t('phone')} *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={t('phonePlaceholder')}
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-green-400 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
                             {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center">
                 <AlertTriangle className="h-3 w-3 mr-1" />
                 {errors.phone}
               </p>}
            </div>
          </div>

          {/* Email и Способ связи в одной строке */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <Mail className="h-3 w-3 text-purple-600" />
                </span>
                {t('emailOptional')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder={t('emailPlaceholder')}
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-purple-400 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
                             {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center">
                 <AlertTriangle className="h-3 w-3 mr-1" />
                 {errors.email}
               </p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactMethod" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                  <MessageCircle className="h-3 w-3 text-orange-600" />
                </span>
                {t('contactMethod')}
              </Label>
              <Select value={formData.contactMethod} onValueChange={(value) => updateField('contactMethod', value)}>
                <SelectTrigger className="border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-orange-400 border-gray-200 hover:border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">{t('phone')}</SelectItem>
                  <SelectItem value="email">{t('email')}</SelectItem>
                  <SelectItem value="whatsapp">{t('whatsapp')}</SelectItem>
                  <SelectItem value="telegram">{t('telegram')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Услуга */}
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                                 <Stethoscope className="h-3 w-3 text-indigo-600" />
              </span>
              {t('service')}
            </Label>
            <Select value={formData.service} onValueChange={(value) => updateField('service', value)}>
              <SelectTrigger className="border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-indigo-400 border-gray-200 hover:border-gray-300">
                <SelectValue placeholder={t('servicePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {clinicServices.length > 0 ? (
                  clinicServices.map(service => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name} {service.price > 0 && `(${service.price} ${service.currency})`}
                    </SelectItem>
                  ))
                ) : (
                  clinic.specializations?.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Дата и Время в одной строке */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center mr-2">
                  <Calendar className="h-3 w-3 text-pink-600" />
                </span>
                {t('preferredDate')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-pink-400 border-gray-200 hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                  <Clock className="h-3 w-3 text-teal-600" />
                </span>
                {t('time')}
              </Label>
              <Select value={formData.time} onValueChange={(value) => updateField('time', value)}>
                <SelectTrigger className="border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-teal-400 border-gray-200 hover:border-gray-300">
                  <SelectValue placeholder={t('timePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length > 0 ? (
                    timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {formData.date ? 'Клиника не работает в этот день' : 'Выберите дату'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                                 <MessageSquare className="h-3 w-3 text-yellow-600" />
              </span>
              {t('comment')}
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => updateField('comment', e.target.value)}
              placeholder={t('commentPlaceholder')}
              rows={3}
              className="border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-yellow-400 border-gray-200 hover:border-gray-300"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreement"
                checked={formData.agreement}
                onCheckedChange={(checked) => updateField('agreement', checked)}
                className={`mt-1 ${errors.agreement ? 'border-red-500' : ''}`}
              />
              <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium text-blue-900">{t('agreement')}</span> *
              </label>
            </div>
                         {errors.agreement && <p className="text-red-500 text-sm mt-2 flex items-center">
               <AlertTriangle className="h-3 w-3 mr-1" />
               {errors.agreement}
             </p>}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white -m-6 p-6 rounded-b-lg">
            <Button type="button" variant="outline" onClick={onClose} className="border-2 hover:bg-gray-50">
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('sending')}
                </div>
              ) : (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('bookAppointment')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

