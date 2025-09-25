import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { AlertTriangle } from 'lucide-react';
import { getCityName } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Phone, Globe, MapPin, FileText, Send } from 'lucide-react';
import { WorkingHoursEditor } from './WorkingHoursEditor';

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
  workingHours?: any[];
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
    
    if (!formData.clinicName.trim()) newErrors.clinicName = t('clinicNameError');
    if (!formData.contactPhone.trim()) newErrors.contactPhone = t('contactPhoneError');

    // Email validation (only if provided)
    if (formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        newErrors.contactEmail = t('contactEmailInvalid');
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
      const response = await fetch('/api/new-clinic-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicName: formData.clinicName.trim(),
          contactEmail: formData.contactEmail.trim() || null,
          contactPhone: formData.contactPhone.trim(),
          city: formData.city ? getCityName(cities.find(c => c.id === formData.city), language) : null,
          address: formData.address.trim() || null,
          website: formData.website.trim() || null,
          specializations: formData.specializations,
          description: formData.description.trim() || null,
          workingHours: formData.workingHours || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const result = await response.json();
      
      toast({
        title: t('clinicRequestSent'),
        description: t('clinicRequestDesc'),
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
        description: '',
        workingHours: []
      });
    } catch (error) {
      console.error('Error submitting new clinic request:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorDesc'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cities = [
    { id: 'chisinau', nameRu: 'Кишинев', nameRo: 'Chișinău' },
    { id: 'balti', nameRu: 'Бельцы', nameRo: 'Bălți' },
    { id: 'tiraspol', nameRu: 'Тирасполь', nameRo: 'Tiraspol' },
    { id: 'cahul', nameRu: 'Кахул', nameRo: 'Cahul' },
    { id: 'orhei', nameRu: 'Орхей', nameRo: 'Orhei' },
    { id: 'comrat', nameRu: 'Комрат', nameRo: 'Comrat' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] max-w-2xl h-[85vh] max-h-[85vh] overflow-hidden p-0 add-clinic-modal"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {t('clinicFormTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* Hidden button to receive initial focus */}
          <button tabIndex={-1} className="sr-only" autoFocus></button>
          
          <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Building2 className="h-3 w-3 text-blue-600" />
                </span>
                {t('clinicName')} *
              </Label>
              <Input
                id="clinicName"
                value={formData.clinicName}
                onChange={(e) => updateField('clinicName', e.target.value)}
                placeholder={t('clinicNamePlaceholder')}
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 ${errors.clinicName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
              {errors.clinicName && <p className="text-red-500 text-sm flex items-center"><AlertTriangle className="h-3 w-3 mr-1" />{errors.clinicName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <MapPin className="h-3 w-3 text-green-600" />
                </span>
                {t('cityLabel')}
              </Label>
              <Select value={formData.city} onValueChange={(value) => updateField('city', value)}>
                <SelectTrigger className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <SelectValue placeholder={t('cityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{getCityName(city, language)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-red-500 text-sm flex items-center"><AlertTriangle className="h-3 w-3 mr-1" />{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <MapPin className="h-3 w-3 text-purple-600" />
                </span>
                {t('addressLabel')}
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder={t('addressPlaceholder')}
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
              {errors.address && <p className="text-red-500 text-sm flex items-center"><AlertTriangle className="h-3 w-3 mr-1" />{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Globe className="h-3 w-3 text-blue-600" />
                </span>
                {t('websiteLabel')}
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder={t('websitePlaceholder')}
                className="transition-all duration-200 focus:border-blue-500 shadow-sm hover:shadow-md border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                  <Mail className="h-3 w-3 text-orange-600" />
                </span>
                {t('clinicEmail')}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="info@clinic.md"
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 ${errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
              {errors.contactEmail && <p className="text-red-500 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.contactEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Phone className="h-3 w-3 text-green-600" />
                </span>
                {t('clinicPhone')} *
              </Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                placeholder="+373 XX XXX XXX"
                className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 ${errors.contactPhone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
              />
              {errors.contactPhone && <p className="text-red-500 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.contactPhone}</p>}
            </div>
          </div>



          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                <FileText className="h-3 w-3 text-indigo-600" />
              </span>
              {t('clinicDescription')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className={`border-2 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 focus-visible:ring-offset-0 focus:border-blue-400 resize-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.description}</p>}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-3 sm:py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('sending')}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{t('submit')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}