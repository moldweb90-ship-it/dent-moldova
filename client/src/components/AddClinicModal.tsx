import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

interface AddClinicModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  clinicName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  address: string;
  website: string;
  specializations: string[];
  description: string;
}

export function AddClinicModal({ open, onClose }: AddClinicModalProps) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    clinicName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    address: '',
    website: '',
    specializations: [],
    description: ''
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clinicName.trim()) newErrors.clinicName = 'Введите название клиники';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Введите email';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Введите телефон';
    if (!formData.city.trim()) newErrors.city = 'Выберите город';
    if (!formData.address.trim()) newErrors.address = 'Введите адрес';
    if (!formData.description.trim()) newErrors.description = 'Введите описание';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Неверный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    
    toast({
      title: "Заявка отправлена!",
      description: "Мы рассмотрим вашу заявку в течение 24 часов и свяжемся с вами для обсуждения деталей размещения.",
    });
    
    onClose();
    
    // Reset form
    setFormData({
      clinicName: '',
      contactEmail: '',
      contactPhone: '',
      city: '',
      address: '',
      website: '',
      specializations: [],
      description: ''
    });
  };

  const cities = [
    { id: 'chisinau', name: 'Кишинев' },
    { id: 'balti', name: 'Бельцы' },
    { id: 'tiraspol', name: 'Тирасполь' },
    { id: 'cahul', name: 'Кахул' },
    { id: 'orhei', name: 'Орхей' },
    { id: 'comrat', name: 'Комрат' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-blue-600" />
            {t('clinicFormTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p>Размещение клиники в каталоге Dent Moldova поможет вам привлечь новых пациентов. Заполните форму, и мы свяжемся с вами в ближайшее время.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clinicName">{t('clinicName')} *</Label>
              <Input
                id="clinicName"
                value={formData.clinicName}
                onChange={(e) => updateField('clinicName', e.target.value)}
                placeholder="Например: Dent Perfect"
                className={errors.clinicName ? 'border-red-500' : ''}
              />
              {errors.clinicName && <p className="text-red-500 text-sm mt-1">{errors.clinicName}</p>}
            </div>

            <div>
              <Label htmlFor="city">Город *</Label>
              <Select value={formData.city} onValueChange={(value) => updateField('city', value)}>
                <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="ул. Штефан чел Маре, 123"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contactEmail">{t('clinicEmail')} *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="info@clinic.md"
                className={errors.contactEmail ? 'border-red-500' : ''}
              />
              {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
            </div>

            <div>
              <Label htmlFor="contactPhone">{t('clinicPhone')} *</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                placeholder="+373 XX XXX XXX"
                className={errors.contactPhone ? 'border-red-500' : ''}
              />
              {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="website">Сайт клиники</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://clinic.md"
            />
          </div>

          <div>
            <Label htmlFor="description">{t('clinicDescription')} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Расскажите о ваших услугах, специализациях, преимуществах, оборудовании..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('close')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Отправляем...' : t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}