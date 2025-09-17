import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  CreditCard, 
  Package,
  Star,
  Shield,
  Zap,
  Crown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Package {
  id: string;
  nameRu: string;
  nameRo: string;
  descriptionRu: string;
  descriptionRo: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClinicSubscription {
  id: string;
  clinicId: string;
  clinicName: string;
  packageId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentDate: string;
  nextPaymentDate: string;
  autoRenewal: boolean;
  paymentMethod: string;
  // Добавляем связь с платежами
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

interface PaymentHistory {
  id: string;
  clinicId: string;
  clinicName: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export function PackagesManagement() {
  const { t, language } = useTranslation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClinicSubscription[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateSubscriptionDialogOpen, setIsCreateSubscriptionDialogOpen] = useState(false);
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'subscription' | 'direct'>('direct');
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    nameRu: '',
    nameRo: '',
    descriptionRu: '',
    descriptionRo: '',
    price: 0,
    currency: 'MDL',
    durationDays: 30,
    features: [] as string[],
    isActive: true
  });

  const [subscriptionFormData, setSubscriptionFormData] = useState({
    clinicId: '',
    packageId: '',
    startDate: new Date().toISOString().split('T')[0],
    autoRenewal: true,
    paymentMethod: 'card'
  });

  const [paymentFormData, setPaymentFormData] = useState({
    clinicId: '',
    subscriptionId: '',
    packageId: 'none',
    amount: 0,
    currency: 'MDL',
    paymentMethod: 'card',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'completed' as 'completed' | 'pending' | 'failed',
    notes: ''
  });

  // Fetch real clinics data
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('/api/admin/clinics');
        const data = await response.json();
        setClinics(data.clinics || []);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        // Fallback to mock data if API fails
        const mockClinics = [
          { id: '1', nameRu: 'Dental Clinic 1', nameRo: 'Clinica Dentală 1', verified: true },
          { id: '2', nameRu: 'Dental Clinic 2', nameRo: 'Clinica Dentală 2', verified: true },
          { id: '3', nameRu: 'Dental Clinic 3', nameRo: 'Clinica Dentală 3', verified: false },
          { id: '4', nameRu: 'Dental Clinic 4', nameRo: 'Clinica Dentală 4', verified: true },
          { id: '5', nameRu: 'Dental Clinic 5', nameRo: 'Clinica Dentală 5', verified: false }
        ];
        setClinics(mockClinics);
      }
    };

    fetchClinics();
  }, []);

  // Load data from localStorage or use mock data
  useEffect(() => {
    // Загружаем сохраненные данные
    const savedPackages = localStorage.getItem('packages-management-packages');
    const savedSubscriptions = localStorage.getItem('packages-management-subscriptions');
    const savedPayments = localStorage.getItem('packages-management-payments');
    
    const mockPackages: Package[] = [
      {
        id: '1',
        nameRu: 'Basic',
        nameRo: 'Basic',
        descriptionRu: 'Идеально, чтобы начать и быть в системе',
        descriptionRo: 'Perfect pentru a începe și a fi în sistem',
        price: 0,
        currency: 'MDL',
        durationDays: 30,
        features: ['name', 'address', 'google_rating'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '2',
        nameRu: 'Verified',
        nameRo: 'Verified',
        descriptionRu: 'Оптимальный пакет для клиник, которые хотят получать пациентов онлайн',
        descriptionRo: 'Pachetul optim pentru clinicile care vor să primească pacienți online',
        price: 990,
        currency: 'MDL',
        durationDays: 30,
        features: ['all_basic', 'online_booking', 'photos', 'services', 'filters', 'reviews', 'priority'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '3',
        nameRu: 'Premium',
        nameRo: 'Premium',
        descriptionRu: 'Максимальная видимость и продвижение вашей клиники',
        descriptionRo: 'Vizibilitate maximă și promovarea clinicii dvs.',
        price: 2490,
        currency: 'MDL',
        durationDays: 30,
        features: ['all_verified', 'top_placement', 'recommended', 'advertising', 'analytics', 'separate_page', 'manager'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ];

    const mockSubscriptions: ClinicSubscription[] = [
      {
        id: '1',
        clinicId: '1',
        clinicName: 'Dental Clinic 1',
        packageId: '2',
        packageName: 'Verified',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        status: 'active',
        paymentDate: '2024-01-01',
        nextPaymentDate: '2024-02-01',
        autoRenewal: true,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        lastPaymentAmount: 990,
        lastPaymentDate: '2024-01-01'
      },
      {
        id: '2',
        clinicId: '2',
        clinicName: 'Dental Clinic 2',
        packageId: '3',
        packageName: 'Premium',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        status: 'active',
        paymentDate: '2024-01-15',
        nextPaymentDate: '2024-02-15',
        autoRenewal: true,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        lastPaymentAmount: 1990,
        lastPaymentDate: '2024-01-15'
      },
      {
        id: '3',
        clinicId: '3',
        clinicName: 'Dental Clinic 3',
        packageId: '2',
        packageName: 'Verified',
        startDate: '2024-01-20',
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Завтра
        status: 'active',
        paymentDate: '2024-01-20',
        nextPaymentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        autoRenewal: false,
        paymentMethod: 'cash',
        paymentStatus: 'unpaid',
        lastPaymentAmount: undefined,
        lastPaymentDate: undefined
      }
    ];

    const mockPayments: PaymentHistory[] = [
      {
        id: '1',
        clinicId: '1',
        clinicName: 'Dental Clinic 1',
        packageId: '2',
        packageName: 'Verified',
        amount: 990,
        currency: 'MDL',
        paymentDate: '2024-01-01',
        paymentMethod: 'card',
        status: 'completed'
      }
    ];

    // Используем сохраненные данные или моки
    try {
      setPackages(savedPackages ? JSON.parse(savedPackages) : mockPackages);
      setSubscriptions(savedSubscriptions ? JSON.parse(savedSubscriptions) : mockSubscriptions);
      setPayments(savedPayments ? JSON.parse(savedPayments) : mockPayments);
    } catch (error) {
      console.error('Error parsing saved data:', error);
      // Если ошибка парсинга, используем моки
      setPackages(mockPackages);
      setSubscriptions(mockSubscriptions);
      setPayments(mockPayments);
    }
    
    setLoading(false);
  }, []);

  // Функции для сохранения в localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const updateSubscriptions = (newSubscriptions: ClinicSubscription[]) => {
    setSubscriptions(newSubscriptions);
    saveToLocalStorage('packages-management-subscriptions', newSubscriptions);
  };

  const updatePackages = (newPackages: Package[]) => {
    setPackages(newPackages);
    saveToLocalStorage('packages-management-packages', newPackages);
  };

  const updatePayments = (newPayments: PaymentHistory[]) => {
    setPayments(newPayments);
    saveToLocalStorage('packages-management-payments', newPayments);
  };

  // Функция для сброса данных (для тестирования)
  const resetData = () => {
    if (confirm('Сбросить все данные к демо версии? Это действие нельзя отменить.')) {
      localStorage.removeItem('packages-management-packages');
      localStorage.removeItem('packages-management-subscriptions');
      localStorage.removeItem('packages-management-payments');
      window.location.reload(); // Перезагружаем страницу
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {language === 'ru' ? 
          (status === 'active' ? 'Активна' : 
           status === 'expired' ? 'Истекла' : 
           status === 'cancelled' ? 'Отменена' : 'Ожидает') :
          (status === 'active' ? 'Activă' : 
           status === 'expired' ? 'Expirată' : 
           status === 'cancelled' ? 'Anulată' : 'În așteptare')
        }
      </Badge>
    );
  };

  const getPackageIcon = (packageName: string) => {
    const icons = {
      'Basic': Package,
      'Verified': Shield,
      'Premium': Crown,
      'Базовый': Package,
      'Верифицированный': Shield,
      'Премиум': Crown,
      'Bazic': Package,
      'Verificat': Shield
    };
    const Icon = icons[packageName as keyof typeof icons] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const handleCreatePackage = () => {
    // TODO: Implement API call
    console.log('Creating package:', formData);
    setIsCreateDialogOpen(false);
    setFormData({
      nameRu: '',
      nameRo: '',
      descriptionRu: '',
      descriptionRo: '',
      price: 0,
      currency: 'MDL',
      durationDays: 30,
      features: [],
      isActive: true
    });
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      nameRu: pkg.nameRu,
      nameRo: pkg.nameRo,
      descriptionRu: pkg.descriptionRu,
      descriptionRo: pkg.descriptionRo,
      price: pkg.price,
      currency: pkg.currency,
      durationDays: pkg.durationDays,
      features: pkg.features,
      isActive: pkg.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePackage = () => {
    // TODO: Implement API call
    console.log('Updating package:', formData);
    setIsEditDialogOpen(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = (packageId: string) => {
    // TODO: Implement API call
    console.log('Deleting package:', packageId);
  };

  // Auto-create payment when subscription is created
  const createPaymentForSubscription = (subscription: ClinicSubscription) => {
    const selectedPackage = packages.find(p => p.id === subscription.packageId);
    const selectedClinic = clinics.find(c => c.id === subscription.clinicId);
    if (!selectedPackage || !selectedClinic) return;

    const newPayment: PaymentHistory = {
      id: Date.now().toString(),
      clinicId: subscription.clinicId,
      clinicName: language === 'ru' ? selectedClinic.nameRu : selectedClinic.nameRo,
      packageId: subscription.packageId,
      packageName: subscription.packageName,
      amount: selectedPackage.price,
      currency: selectedPackage.currency,
      paymentDate: subscription.paymentDate,
      paymentMethod: subscription.paymentMethod,
      status: 'completed'
    };

    updatePayments([...payments, newPayment]);
  };

  const handleCreateSubscription = () => {
    const selectedClinic = clinics.find(c => c.id === subscriptionFormData.clinicId);
    const selectedPackage = packages.find(p => p.id === subscriptionFormData.packageId);
    
    if (!selectedClinic || !selectedPackage) {
      alert('Пожалуйста, выберите клинику и пакет');
      return;
    }

    const startDate = new Date(subscriptionFormData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + selectedPackage.durationDays);

    const newSubscription: ClinicSubscription = {
      id: Date.now().toString(),
      clinicId: subscriptionFormData.clinicId,
      clinicName: language === 'ru' ? selectedClinic.nameRu : selectedClinic.nameRo,
      packageId: subscriptionFormData.packageId,
      packageName: language === 'ru' ? selectedPackage.nameRu : selectedPackage.nameRo,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      paymentDate: new Date().toISOString().split('T')[0],
      nextPaymentDate: endDate.toISOString().split('T')[0],
      autoRenewal: subscriptionFormData.autoRenewal,
      paymentMethod: subscriptionFormData.paymentMethod,
      paymentStatus: 'paid', // Автоматически оплачена при создании
      lastPaymentAmount: selectedPackage.price,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };

    updateSubscriptions([...subscriptions, newSubscription]);
    // Auto-create payment for new subscription
    createPaymentForSubscription(newSubscription);
    setIsCreateSubscriptionDialogOpen(false);
    setSubscriptionFormData({
      clinicId: '',
      packageId: '',
      startDate: new Date().toISOString().split('T')[0],
      autoRenewal: true,
      paymentMethod: 'card'
    });
  };

  const handleDeleteSubscription = (subscriptionId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту подписку?')) {
      updateSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
    }
  };

  // Check for expiring subscriptions (within 2 days)
  const getExpiringSubscriptions = () => {
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      const endDate = new Date(sub.endDate);
      return endDate <= twoDaysFromNow && endDate >= today;
    });
  };

  const expiringSubscriptions = getExpiringSubscriptions();

  const handleCreatePayment = () => {
    try {
      // Если выбран тип "по подписке"
      if (paymentType === 'subscription') {
        if (!paymentFormData.subscriptionId) {
          alert('Пожалуйста, выберите подписку');
          return;
        }
        
        const selectedSubscription = subscriptions.find(s => s.id === paymentFormData.subscriptionId);
        if (!selectedSubscription) {
          alert('Подписка не найдена');
          return;
        }
        
        const selectedClinic = clinics.find(c => c.id === selectedSubscription.clinicId);
        if (!selectedClinic) {
          alert('Клиника не найдена');
          return;
        }

      const newPayment: PaymentHistory = {
        id: Date.now().toString(),
        clinicId: selectedSubscription.clinicId,
        clinicName: language === 'ru' ? selectedClinic.nameRu : selectedClinic.nameRo,
        packageId: selectedSubscription.packageId,
        packageName: selectedSubscription.packageName,
        amount: paymentFormData.amount || 0,
        currency: paymentFormData.currency || 'MDL',
        paymentDate: paymentFormData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentFormData.paymentMethod || 'card',
        status: paymentFormData.status || 'completed',
        invoiceUrl: paymentFormData.notes ? `invoice-${Date.now()}.pdf` : undefined
      };

      updatePayments([...(payments || []), newPayment]);
      
      // Обновляем статус платежа в подписке
      const updatedSubscriptions = (subscriptions || []).map(s => 
        s.id === selectedSubscription.id 
          ? {...s, paymentStatus: 'paid', lastPaymentAmount: paymentFormData.amount, lastPaymentDate: paymentFormData.paymentDate}
          : s
      );
      updateSubscriptions(updatedSubscriptions);
    } else {
      // Если выбран тип "разовый платеж"
      if (!paymentFormData.clinicId) {
        alert('Пожалуйста, выберите клинику');
        return;
      }
      
      const selectedClinic = clinics.find(c => c.id === paymentFormData.clinicId);
      if (!selectedClinic) {
        alert('Клиника не найдена');
        return;
      }
      
      const selectedPackage = packages.find(p => p.id === paymentFormData.packageId);
      
      if (paymentFormData.amount <= 0) {
        alert('Пожалуйста, укажите сумму платежа');
        return;
      }

      const newPayment: PaymentHistory = {
        id: Date.now().toString(),
        clinicId: paymentFormData.clinicId,
        clinicName: language === 'ru' ? selectedClinic.nameRu : selectedClinic.nameRo,
        packageId: paymentFormData.packageId === 'none' ? '' : (paymentFormData.packageId || ''),
        packageName: selectedPackage ? (language === 'ru' ? selectedPackage.nameRu : selectedPackage.nameRo) : 'Разовый платеж',
        amount: paymentFormData.amount || 0,
        currency: paymentFormData.currency || 'MDL',
        paymentDate: paymentFormData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentFormData.paymentMethod || 'card',
        status: paymentFormData.status || 'completed',
        invoiceUrl: paymentFormData.notes ? `invoice-${Date.now()}.pdf` : undefined
      };

      updatePayments([...(payments || []), newPayment]);
      
      // Если это платеж за пакет, обновляем статус подписки
      if (paymentFormData.packageId && paymentFormData.packageId !== 'none') {
        const relatedSubscription = (subscriptions || []).find(s => 
          s.clinicId === paymentFormData.clinicId && s.packageId === paymentFormData.packageId
        );
        if (relatedSubscription) {
          const updatedSubscriptions = (subscriptions || []).map(s => 
            s.id === relatedSubscription.id 
              ? {...s, paymentStatus: 'paid', lastPaymentAmount: paymentFormData.amount, lastPaymentDate: paymentFormData.paymentDate}
              : s
          );
          updateSubscriptions(updatedSubscriptions);
        }
      }
    }

    // Сброс формы после успешного создания
    setIsCreatePaymentDialogOpen(false);
    setPaymentType('direct');
    setPaymentFormData({
      clinicId: '',
      subscriptionId: '',
      packageId: 'none',
      amount: 0,
      currency: 'MDL',
      paymentMethod: 'card',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: ''
    });

  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
    alert('Произошла ошибка при создании платежа. Попробуйте еще раз.');
  }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот платеж?')) {
      updatePayments(payments.filter(payment => payment.id !== paymentId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Пакеты услуг</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expiring subscriptions notification */}
      {expiringSubscriptions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-800">
                  Внимание! {expiringSubscriptions.length} подписк{expiringSubscriptions.length === 1 ? 'а' : expiringSubscriptions.length < 5 ? 'и' : 'ок'} истекает в ближайшие 2 дня
                </h3>
                <div className="text-sm text-orange-700 mt-1">
                  {expiringSubscriptions.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <span>{sub.clinicName} - {sub.packageName}</span>
                      <span className="font-medium">
                        Истекает: {new Date(sub.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Пакеты услуг</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={resetData} className="text-red-600 hover:text-red-700 w-full sm:w-auto">
            Сбросить данные
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Создать пакет
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby="package-dialog-description">
            <DialogHeader>
              <DialogTitle>Создать новый пакет</DialogTitle>
              <div id="package-dialog-description" className="sr-only">
                Форма для создания нового пакета услуг. Заполните название, описание, цену и другие параметры пакета.
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название (RU)</Label>
                  <Input 
                    value={formData.nameRu}
                    onChange={(e) => setFormData({...formData, nameRu: e.target.value})}
                    placeholder="Basic"
                  />
                </div>
                <div>
                  <Label>Название (RO)</Label>
                  <Input 
                    value={formData.nameRo}
                    onChange={(e) => setFormData({...formData, nameRo: e.target.value})}
                    placeholder="Basic"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Описание (RU)</Label>
                  <Textarea 
                    value={formData.descriptionRu}
                    onChange={(e) => setFormData({...formData, descriptionRu: e.target.value})}
                    placeholder="Описание пакета"
                  />
                </div>
                <div>
                  <Label>Описание (RO)</Label>
                  <Textarea 
                    value={formData.descriptionRo}
                    onChange={(e) => setFormData({...formData, descriptionRo: e.target.value})}
                    placeholder="Descrierea pachetului"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Цена</Label>
                  <Input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Валюта</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MDL">MDL</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Длительность (дни)</Label>
                  <Input 
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({...formData, durationDays: Number(e.target.value)})}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
                />
                <Label htmlFor="isActive">Активный пакет</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreatePackage}>
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="packages">Пакеты</TabsTrigger>
          <TabsTrigger value="subscriptions">
            Подписки
            {expiringSubscriptions.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {expiringSubscriptions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <Card key={pkg.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPackageIcon(pkg.nameRu)}
                      <CardTitle className="text-lg">{pkg.nameRu}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'ru' ? pkg.descriptionRu : pkg.descriptionRo}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">
                      {pkg.price} {pkg.currency}
                    </span>
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Длительность: {pkg.durationDays} дней
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Активные подписки</CardTitle>
                <Dialog open={isCreateSubscriptionDialogOpen} onOpenChange={setIsCreateSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить подписку
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md" aria-describedby="subscription-dialog-description">
                    <DialogHeader>
                      <DialogTitle>Создать подписку</DialogTitle>
                      <div id="subscription-dialog-description" className="sr-only">
                        Форма для создания новой подписки. Выберите клинику, пакет услуг и настройте параметры подписки.
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Клиника</Label>
                        <Select 
                          value={subscriptionFormData.clinicId} 
                          onValueChange={(value) => setSubscriptionFormData({...subscriptionFormData, clinicId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите клинику" />
                          </SelectTrigger>
                          <SelectContent>
                            {clinics.map(clinic => (
                              <SelectItem key={clinic.id} value={clinic.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{language === 'ru' ? clinic.nameRu : clinic.nameRo}</span>
                                  {clinic.verified && (
                                    <Badge variant="outline" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Пакет</Label>
                        <Select 
                          value={subscriptionFormData.packageId} 
                          onValueChange={(value) => setSubscriptionFormData({...subscriptionFormData, packageId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите пакет" />
                          </SelectTrigger>
                          <SelectContent>
                            {packages.filter(p => p.isActive).map(pkg => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                <div className="flex items-center space-x-2">
                                  {getPackageIcon(pkg.nameRu)}
                                  <span>{language === 'ru' ? pkg.nameRu : pkg.nameRo}</span>
                                  <span className="text-sm text-gray-500">
                                    ({pkg.price} {pkg.currency})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Дата начала</Label>
                        <Input 
                          type="date"
                          value={subscriptionFormData.startDate}
                          onChange={(e) => setSubscriptionFormData({...subscriptionFormData, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Метод оплаты</Label>
                        <Select 
                          value={subscriptionFormData.paymentMethod} 
                          onValueChange={(value) => setSubscriptionFormData({...subscriptionFormData, paymentMethod: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Банковская карта</SelectItem>
                            <SelectItem value="cash">Наличные</SelectItem>
                            <SelectItem value="transfer">Банковский перевод</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="autoRenewal"
                          checked={subscriptionFormData.autoRenewal}
                          onCheckedChange={(checked) => setSubscriptionFormData({...subscriptionFormData, autoRenewal: checked as boolean})}
                        />
                        <Label htmlFor="autoRenewal">Автопродление</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateSubscriptionDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button onClick={handleCreateSubscription}>
                          Создать подписку
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex space-x-2">
                  <Button
                    variant={subscriptionFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubscriptionFilter('all')}
                  >
                    Все ({subscriptions.length})
                  </Button>
                  <Button
                    variant={subscriptionFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubscriptionFilter('active')}
                  >
                    Активные ({subscriptions.filter(s => s.status === 'active').length})
                  </Button>
                  <Button
                    variant={subscriptionFilter === 'expired' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubscriptionFilter('expired')}
                  >
                    Истекшие ({subscriptions.filter(s => s.status === 'expired').length})
                  </Button>
                  <Button
                    variant={subscriptionFilter === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubscriptionFilter('cancelled')}
                  >
                    Отмененные ({subscriptions.filter(s => s.status === 'cancelled').length})
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                                {subscriptions
                  .filter(sub => subscriptionFilter === 'all' || sub.status === subscriptionFilter)
                  .map(sub => {
                    const isExpiring = expiringSubscriptions.some(exp => exp.id === sub.id);
                    return (
                      <div key={sub.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                        isExpiring ? 'border-orange-300 bg-orange-50' : ''
                      }`}>
                                          <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getPackageIcon(sub.packageName)}
                          <div>
                            <div className="font-medium flex items-center space-x-2">
                              {sub.clinicName}
                              {isExpiring && (
                                <Badge variant="destructive" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Истекает
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{sub.packageName}</div>
                          </div>
                        </div>
                      </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          Следующий платеж: {new Date(sub.nextPaymentDate).toLocaleDateString()}
                        </div>
                        {sub.lastPaymentDate && sub.lastPaymentAmount && (
                          <div className="text-xs text-gray-400">
                            Последний платеж: {new Date(sub.lastPaymentDate).toLocaleDateString()} 
                            ({sub.lastPaymentAmount} MDL)
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {sub.autoRenewal ? 'Автопродление' : 'Без автопродления'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(sub.status)}
                        <Badge variant={
                          (sub.paymentStatus || 'unpaid') === 'paid' ? 'default' : 
                          (sub.paymentStatus || 'unpaid') === 'partial' ? 'secondary' : 'destructive'
                        }>
                          {(sub.paymentStatus || 'unpaid') === 'paid' ? 'Оплачено' : 
                           (sub.paymentStatus || 'unpaid') === 'partial' ? 'Частично' : 'Не оплачено'}
                        </Badge>
                        <div className="flex space-x-1">
                          {sub.status === 'active' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement extend subscription
                                  console.log('Extend subscription:', sub.id);
                                }}
                              >
                                Продлить
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement cancel subscription
                                  const updatedSubscriptions = subscriptions.map(s => 
                                    s.id === sub.id ? {...s, status: 'cancelled' as const} : s
                                  );
                                  updateSubscriptions(updatedSubscriptions);
                                }}
                              >
                                Отменить
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubscription(sub.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                                              </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>История платежей</CardTitle>
                <Dialog open={isCreatePaymentDialogOpen} onOpenChange={setIsCreatePaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить платеж
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md" aria-describedby="payment-dialog-description">
                    <DialogHeader>
                      <DialogTitle>Создать платеж</DialogTitle>
                      <div id="payment-dialog-description" className="sr-only">
                        Форма для создания нового платежа. Выберите тип платежа, клинику или подписку, и заполните остальные поля.
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Тип платежа</Label>
                        <div className="flex space-x-2">
                          <Button
                            variant={paymentType === 'subscription' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPaymentType('subscription')}
                          >
                            По подписке
                          </Button>
                          <Button
                            variant={paymentType === 'direct' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPaymentType('direct')}
                          >
                            Разовый платеж
                          </Button>
                        </div>
                      </div>
                      
                      {paymentType === 'subscription' ? (
                        <div>
                          <Label>Подписка</Label>
                          <Select 
                            value={paymentFormData.subscriptionId} 
                            onValueChange={(value) => setPaymentFormData({...paymentFormData, subscriptionId: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите подписку" />
                            </SelectTrigger>
                            <SelectContent>
                              {subscriptions.filter(s => s.status === 'active').map(sub => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  <div className="flex items-center space-x-2">
                                    <span>{sub.clinicName}</span>
                                    <span className="text-sm text-gray-500">- {sub.packageName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <>
                          <div>
                            <Label>Клиника</Label>
                            <Select 
                              value={paymentFormData.clinicId} 
                              onValueChange={(value) => setPaymentFormData({...paymentFormData, clinicId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите клинику" />
                              </SelectTrigger>
                              <SelectContent>
                                {clinics.map(clinic => (
                                  <SelectItem key={clinic.id} value={clinic.id}>
                                    <div className="flex items-center space-x-2">
                                      <span>{language === 'ru' ? clinic.nameRu : clinic.nameRo}</span>
                                      {clinic.verified && (
                                        <Badge variant="outline" className="text-xs">Verified</Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Пакет (необязательно)</Label>
                            <Select 
                              value={paymentFormData.packageId} 
                              onValueChange={(value) => setPaymentFormData({...paymentFormData, packageId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите пакет или оставьте пустым" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Разовый платеж</SelectItem>
                                {packages.filter(p => p.isActive).map(pkg => (
                                  <SelectItem key={pkg.id} value={pkg.id}>
                                    <div className="flex items-center space-x-2">
                                      {getPackageIcon(pkg.nameRu)}
                                      <span>{language === 'ru' ? pkg.nameRu : pkg.nameRo}</span>
                                      <span className="text-sm text-gray-500">
                                        ({pkg.price} {pkg.currency})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Сумма</Label>
                          <Input 
                            type="number"
                            value={paymentFormData.amount}
                            onChange={(e) => setPaymentFormData({...paymentFormData, amount: Number(e.target.value)})}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Валюта</Label>
                          <Select 
                            value={paymentFormData.currency} 
                            onValueChange={(value) => setPaymentFormData({...paymentFormData, currency: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MDL">MDL</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Дата платежа</Label>
                          <Input 
                            type="date"
                            value={paymentFormData.paymentDate}
                            onChange={(e) => setPaymentFormData({...paymentFormData, paymentDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Метод оплаты</Label>
                          <Select 
                            value={paymentFormData.paymentMethod} 
                            onValueChange={(value) => setPaymentFormData({...paymentFormData, paymentMethod: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="card">Банковская карта</SelectItem>
                              <SelectItem value="cash">Наличные</SelectItem>
                              <SelectItem value="transfer">Банковский перевод</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Статус</Label>
                        <Select 
                          value={paymentFormData.status} 
                          onValueChange={(value) => setPaymentFormData({...paymentFormData, status: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Оплачен</SelectItem>
                            <SelectItem value="pending">В обработке</SelectItem>
                            <SelectItem value="failed">Ошибка</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Примечания</Label>
                        <Textarea 
                          value={paymentFormData.notes}
                          onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                          placeholder="Дополнительная информация..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreatePaymentDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button onClick={handleCreatePayment}>
                          Создать платеж
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Платежей пока нет</p>
                    <p className="text-sm">Платежи создаются автоматически при создании подписок</p>
                  </div>
                ) : (
                  payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{payment.clinicName}</div>
                            <div className="text-sm text-gray-500">{payment.packageName}</div>
                            <div className="text-xs text-gray-400">
                              {payment.paymentMethod === 'card' ? 'Банковская карта' : 
                               payment.paymentMethod === 'cash' ? 'Наличные' : 'Банковский перевод'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {payment.amount} {payment.currency}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                          {payment.invoiceUrl && (
                            <div className="text-xs text-blue-600 hover:underline cursor-pointer">
                              Скачать счет
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            payment.status === 'completed' ? 'default' : 
                            payment.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {payment.status === 'completed' ? 'Оплачен' : 
                             payment.status === 'pending' ? 'В обработке' : 'Ошибка'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{subscriptions.length}</div>
                    <div className="text-sm text-gray-500">Активных подписок</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {payments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + p.amount, 0)} MDL
                    </div>
                    <div className="text-sm text-gray-500">Общий доход</div>
                    <div className="text-xs text-gray-400">
                      {payments.filter(p => p.status === 'completed').length} платежей
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{packages.length}</div>
                    <div className="text-sm text-gray-500">Пакетов услуг</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {subscriptions.filter(s => s.status === 'expired').length}
                    </div>
                    <div className="text-sm text-gray-500">Истекающих подписок</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {payments.length}
                    </div>
                    <div className="text-sm text-gray-500">Всего платежей</div>
                    <div className="text-xs text-gray-400">
                      {payments.filter(p => p.status === 'pending').length} в обработке
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-package-dialog-description">
          <DialogHeader>
            <DialogTitle>Редактировать пакет</DialogTitle>
            <div id="edit-package-dialog-description" className="sr-only">
              Форма для редактирования пакета услуг. Измените название, описание, цену и другие параметры пакета.
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Название (RU)</Label>
                <Input 
                  value={formData.nameRu}
                  onChange={(e) => setFormData({...formData, nameRu: e.target.value})}
                />
              </div>
              <div>
                <Label>Название (RO)</Label>
                <Input 
                  value={formData.nameRo}
                  onChange={(e) => setFormData({...formData, nameRo: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Описание (RU)</Label>
                <Textarea 
                  value={formData.descriptionRu}
                  onChange={(e) => setFormData({...formData, descriptionRu: e.target.value})}
                />
              </div>
              <div>
                <Label>Описание (RO)</Label>
                <Textarea 
                  value={formData.descriptionRo}
                  onChange={(e) => setFormData({...formData, descriptionRo: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Цена</Label>
                <Input 
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Валюта</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MDL">MDL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Длительность (дни)</Label>
                <Input 
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isActiveEdit"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
              />
              <Label htmlFor="isActiveEdit">Активный пакет</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdatePackage}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}