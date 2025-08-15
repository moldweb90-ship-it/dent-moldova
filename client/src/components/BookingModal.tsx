import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  specializations: string[];
}

interface BookingModalProps {
  clinic: Clinic | null;
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
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
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    contactMethod: 'phone',
    service: '',
    date: '',
    time: '',
    comment: '',
    agreement: false
  });

  if (!clinic) return null;

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\\D/g, '');
    const match = cleaned.match(/^(373)?(\\d{0,2})(\\d{0,3})(\\d{0,3})$/);
    if (match) {
      return ['+373', match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateField('phone', formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
    if (!formData.email.trim()) newErrors.email = 'Введите email';
    if (!formData.service) newErrors.service = 'Выберите услугу';
    if (!formData.date) newErrors.date = 'Выберите дату';
    if (!formData.time) newErrors.time = 'Выберите время';
    if (!formData.agreement) newErrors.agreement = 'Необходимо согласие';

    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    
    toast({
      title: "Запись успешно отправлена!",
      description: `Мы свяжемся с вами в ближайшее время для подтверждения записи в ${clinic.name}.`,
    });
    
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      contactMethod: 'phone',
      service: '',
      date: '',
      time: '',
      comment: '',
      agreement: false
    });
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Запись в {clinic.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+373 XX XXX XXX"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="contactMethod">Предпочтительный способ связи</Label>
            <Select value={formData.contactMethod} onValueChange={(value) => updateField('contactMethod', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Телефон</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service">Услуга *</Label>
            <Select value={formData.service} onValueChange={(value) => updateField('service', value)}>
              <SelectTrigger className={errors.service ? 'border-red-500' : ''}>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Консультация</SelectItem>
                <SelectItem value="hygiene">Профессиональная гигиена</SelectItem>
                <SelectItem value="implants">Имплантация</SelectItem>
                <SelectItem value="veneers">Виниры</SelectItem>
                <SelectItem value="endo">Лечение каналов</SelectItem>
                <SelectItem value="ortho">Ортодонтия</SelectItem>
              </SelectContent>
            </Select>
            {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date">Предпочтительная дата *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <Label htmlFor="time">Время *</Label>
              <Select value={formData.time} onValueChange={(value) => updateField('time', value)}>
                <SelectTrigger className={errors.time ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => updateField('comment', e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreement"
              checked={formData.agreement}
              onCheckedChange={(checked) => updateField('agreement', checked)}
              className={errors.agreement ? 'border-red-500' : ''}
            />
            <label htmlFor="agreement" className="text-sm text-gray-700 leading-tight">
              Я согласен на обработку персональных данных и получение информационных сообщений *
            </label>
          </div>
          {errors.agreement && <p className="text-red-500 text-sm">{errors.agreement}</p>}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Отправляем...' : 'Записаться'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}