import { useState } from 'react';
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
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  service: z.string().min(1, 'Выберите услугу'),
  preferredDate: z.string().min(1, 'Выберите предпочтительную дату'),
  preferredTime: z.string().min(1, 'Выберите предпочтительное время'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  clinic: {
    id: string;
    name: string;
    phone?: string;
    specializations?: string[];
  } | null;
  open: boolean;
  onClose: () => void;
}

export function BookingForm({ clinic, open, onClose }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      service: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        ...data,
        clinicId: clinic?.id
      };
      
      await apiRequest('POST', '/api/bookings', bookingData);
      
      toast({
        title: 'Заявка отправлена!',
        description: `Ваша заявка на запись в ${clinic?.name} успешно отправлена. Мы свяжемся с вами в ближайшее время.`,
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить заявку. Попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clinic) return null;

  const services = clinic.specializations || [
    'Консультация стоматолога',
    'Лечение кариеса',
    'Профессиональная чистка',
    'Отбеливание зубов',
    'Имплантация',
    'Ортодонтия',
    'Удаление зубов'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Записаться на прием</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">{clinic.name}</p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Имя</span>
              </Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                placeholder="Ваше имя"
                className="mt-1"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                placeholder="Ваша фамилия"
                className="mt-1"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <Label htmlFor="phone" className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>Телефон</span>
            </Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+373 XX XXX XXX"
              className="mt-1"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>Email (необязательно)</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="your@email.com"
              className="mt-1"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <Label htmlFor="service">Услуга</Label>
            <select
              id="service"
              {...form.register('service')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите услугу</option>
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            {form.formState.errors.service && (
              <p className="text-sm text-red-600">{form.formState.errors.service.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="preferredDate">Предпочтительная дата</Label>
              <Input
                id="preferredDate"
                type="date"
                {...form.register('preferredDate')}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
              {form.formState.errors.preferredDate && (
                <p className="text-sm text-red-600">{form.formState.errors.preferredDate.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="preferredTime" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Время</span>
              </Label>
              <select
                id="preferredTime"
                {...form.register('preferredTime')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите время</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {form.formState.errors.preferredTime && (
                <p className="text-sm text-red-600">{form.formState.errors.preferredTime.message}</p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Дополнительные пожелания</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Расскажите о ваших пожеланиях или особенностях..."
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Contact Info Display */}
          {clinic.phone && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Для срочной записи:</strong> {clinic.phone}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Отменить
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Отправка...' : 'Записаться'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}