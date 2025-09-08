import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Clock, Phone, User, Mail } from 'lucide-react';

const bookingSchema = z.object({
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(7, 'Введите корректный номер телефона (минимум 7 цифр)'),
  email: z.union([z.literal(''), z.string().email('Введите корректный email')]).optional(),
  contactMethod: z.string().default('phone'),
  service: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
  agreement: z.boolean().refine(val => val === true, 'Необходимо согласие'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  clinic: {
    id: string;
    name: string;
    phone?: string;
    specializations?: string[];
    workingHours?: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime: string;
      closeTime: string;
      breakStartTime: string;
      breakEndTime: string;
      is24Hours: boolean;
    }>;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function BookingForm({ clinic, open, onClose }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicServices, setClinicServices] = useState<{id: string, name: string, price: number, currency: string}[]>([]);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: '',
      phone: '',
      email: '',
      contactMethod: 'phone',
      service: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
      agreement: false,
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        clinicId: clinic?.id,
        firstName: data.firstName.trim(),
        phone: data.phone,
        email: data.email?.trim() || undefined,
        contactMethod: data.contactMethod,
        service: data.service,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        notes: data.notes?.trim() || undefined,
      };
      
      await apiRequest('POST', '/api/bookings', bookingData);
      
      toast({
        title: "Запись успешно отправлена!",
        description: `Мы свяжемся с вами в ближайшее время для подтверждения записи в ${clinic?.name}.`,
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить заявку. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Загружаем услуги клиники
  useEffect(() => {
    const loadClinicServices = async () => {
      if (!clinic?.id) {
        console.log('BookingForm: Нет ID клиники');
        setClinicServices([]);
        return;
      }
      
      try {
        console.log('BookingForm: Загружаем услуги для клиники:', clinic.id);
        const response = await apiRequest('GET', `/api/clinics/${clinic.id}/services?language=ru`);
        const services = await response.json();
        console.log('BookingForm: Получены услуги:', services);
        setClinicServices(services);
      } catch (error) {
        console.error('BookingForm: Ошибка загрузки услуг клиники:', error);
        // Если не удалось загрузить, используем пустой массив
        setClinicServices([]);
      }
    };

    loadClinicServices();
  }, [clinic?.id]);

  if (!clinic) return null;

  // Используем загруженные услуги или fallback
  const services = clinicServices.length > 0 
    ? clinicServices.map(service => service.name)
    : (clinic.specializations || [
        'Консультация стоматолога',
        'Лечение кариеса',
        'Профессиональная чистка',
        'Отбеливание зубов',
        'Имплантация',
        'Ортодонтия',
        'Удаление зубов'
      ]);

  // Функция для генерации временных слотов на основе рабочих часов клиники
  const generateTimeSlots = (selectedDate: string) => {
    if (!selectedDate || !clinic?.workingHours || clinic.workingHours.length === 0) {
      // Возвращаем стандартные слоты если нет данных о рабочих часах
      return [
        '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'
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
      // Для 24-часовой работы генерируем слоты каждый час
      const slots = [];
      for (let hour = 0; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    }

    if (!dayWorkingHours.openTime || !dayWorkingHours.closeTime) {
      return []; // Нет данных о времени работы
    }

    const slots = [];
    const openTime = dayWorkingHours.openTime; // "09:00"
    const closeTime = dayWorkingHours.closeTime; // "18:00"
    const breakStart = dayWorkingHours.breakStartTime; // "13:00"
    const breakEnd = dayWorkingHours.breakEndTime; // "14:00"

    // Парсим время
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

      // Увеличиваем время на час (для BookingForm)
      currentHour++;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots(form.watch('preferredDate'));

  // Сбрасываем выбранное время при изменении даты
  useEffect(() => {
    const currentTime = form.watch('preferredTime');
    if (currentTime && timeSlots.length > 0 && !timeSlots.includes(currentTime)) {
      form.setValue('preferredTime', '');
    }
  }, [form.watch('preferredDate'), timeSlots, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Запись в {clinic?.name || 'клинику'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Имя и Телефон в одной строке */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Имя *</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                placeholder="Ваше имя"
                className={form.formState.errors.firstName ? 'border-red-500' : ''}
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+373 XX XXX XXX"
                className={form.formState.errors.phone ? 'border-red-500' : ''}
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Email и Способ связи в одной строке */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email (необязательно)</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="your@email.com"
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactMethod">Предпочтительный способ связи</Label>
              <select
                id="contactMethod"
                {...form.register('contactMethod')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="phone">Телефон</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
          </div>

          {/* Услуга */}
          <div>
            <Label htmlFor="service">Услуга</Label>
            <select
              id="service"
              {...form.register('service')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value="">Выберите услугу</option>
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Дата и Время */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="preferredDate">Предпочтительная дата</Label>
              <Input
                id="preferredDate"
                type="date"
                {...form.register('preferredDate')}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <Label htmlFor="preferredTime">Время</Label>
              <select
                id="preferredTime"
                {...form.register('preferredTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="">Выберите время</option>
                {timeSlots.length > 0 ? (
                  timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))
                ) : (
                  <option value="" disabled>
                    {form.watch('preferredDate') ? 'Клиника не работает в этот день' : 'Выберите дату'}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Комментарий */}
          <div>
            <Label htmlFor="notes">Комментарий</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          {/* Согласие на обработку данных */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="agreement"
              {...form.register('agreement')}
              className={`mt-1 h-4 w-4 rounded border-gray-300 focus:border-blue-500 ${form.formState.errors.agreement ? 'border-red-500' : ''}`}
            />
            <label htmlFor="agreement" className="text-sm text-gray-700 leading-tight">
              Я согласен на обработку персональных данных и получение информационных сообщений *
            </label>
          </div>
          {form.formState.errors.agreement && <p className="text-red-500 text-sm">{form.formState.errors.agreement.message}</p>}

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Отправляем...' : 'Запись'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}