import { Shield, Building2, MapPin, Calendar, BarChart3, Settings, Database, Package, X, CheckCircle, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  newBookingsCount?: number;
  pendingVerificationCount?: number;
  pendingNewClinicCount?: number;
  onClose?: () => void;
}

export function AdminSidebar({ activeTab, onTabChange, newBookingsCount = 0, pendingVerificationCount = 0, pendingNewClinicCount = 0, onClose }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Панель управления', icon: Shield },
    { id: 'clinics', label: 'Клиники', icon: Building2 },
    { id: 'cities', label: 'Города', icon: MapPin },
    { id: 'bookings', label: 'Заявки пациентов', icon: Calendar },
    { id: 'verification', label: 'Верификация', icon: CheckCircle },
    { id: 'new-clinics', label: 'Новые клиники', icon: Building2 },
    { id: 'packages', label: 'Пакеты услуг', icon: Package },
    { id: 'reviews', label: 'Отзывы', icon: MessageSquare },
    { id: 'statistics', label: 'Статистика', icon: BarChart3 },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Админ панель</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isBookingsTab = item.id === 'bookings';
            const isVerificationTab = item.id === 'verification';
            const isNewClinicsTab = item.id === 'new-clinics';
            
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start relative ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                
                {/* Уведомление о новых заявках */}
                {isBookingsTab && newBookingsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto bg-red-500 text-white text-xs font-bold animate-pulse"
                  >
                    {newBookingsCount > 99 ? '99+' : newBookingsCount}
                  </Badge>
                )}
                
                {/* Уведомление о заявках верификации */}
                {isVerificationTab && pendingVerificationCount > 0 && (
                  <div className="ml-auto flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500 animate-bounce" />
                    <Badge 
                      variant="destructive" 
                      className="bg-orange-500 text-white text-xs font-bold"
                    >
                      {pendingVerificationCount > 99 ? '99+' : pendingVerificationCount}
                    </Badge>
                  </div>
                )}

                {/* Уведомление о новых клиниках */}
                {isNewClinicsTab && pendingNewClinicCount > 0 && (
                  <div className="ml-auto flex items-center gap-2">
                    <Badge 
                      variant="success" 
                      className="bg-green-500 text-white text-xs font-bold"
                    >
                      {pendingNewClinicCount > 99 ? '99+' : pendingNewClinicCount}
                    </Badge>
                  </div>
                )}


              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}