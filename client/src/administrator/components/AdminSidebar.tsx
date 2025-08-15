import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  MapPin,
  BarChart3,
  Users,
  Settings,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type AdminPage = 'dashboard' | 'clinics' | 'packages' | 'cities' | 'bookings' | 'settings';

interface AdminSidebarProps {
  currentPage: AdminPage;
  onPageChange: (page: AdminPage) => void;
  isOpen: boolean;
}

export function AdminSidebar({ currentPage, onPageChange, isOpen }: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as AdminPage,
      label: 'Главная',
      icon: LayoutDashboard,
      description: 'Обзор и статистика'
    },
    {
      id: 'clinics' as AdminPage,
      label: 'Клиники',
      icon: Building2,
      description: 'Управление клиниками'
    },
    {
      id: 'packages' as AdminPage,
      label: 'Пакеты услуг',
      icon: Package,
      description: 'Цены и услуги'
    },
    {
      id: 'cities' as AdminPage,
      label: 'Города',
      icon: MapPin,
      description: 'Города и районы'
    },
    {
      id: 'bookings' as AdminPage,
      label: 'Заявки',
      icon: Calendar,
      description: 'Заявки на запись'
    },
    {
      id: 'settings' as AdminPage,
      label: 'Настройки',
      icon: Settings,
      description: 'SEO и конфигурация'
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full justify-start h-auto p-3 ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              } ${!isOpen ? 'px-2' : ''}`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${!isOpen ? 'mx-auto' : 'mr-3'}`} />
              
              {isOpen && (
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </Button>
          );
        })}
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="font-medium">Администратор</div>
              <div className="text-xs">admin@dentmoldova.md</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}