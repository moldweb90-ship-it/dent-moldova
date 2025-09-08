import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { Dashboard } from './components/Dashboard';
import { ClinicsManagement } from './components/ClinicsManagement';
import { CitiesManagement } from './components/CitiesManagement';
import { BookingsManagement } from './components/BookingsManagement';
import { VerificationRequests } from './components/VerificationRequests';
import { PackagesManagement } from './components/PackagesManagement';
import { Statistics } from './components/Statistics';
import { Settings } from './components/Settings';
import { NewClinicRequests } from './components/NewClinicRequests';

import { apiRequest } from '@/lib/queryClient';

type TabType = 'dashboard' | 'clinics' | 'cities' | 'bookings' | 'verification' | 'new-clinics' | 'packages' | 'statistics' | 'settings';

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Сначала проверяем URL параметр
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab') as TabType;
    
    if (urlTab && ['dashboard', 'clinics', 'cities', 'bookings', 'verification', 'packages', 'statistics', 'settings'].includes(urlTab)) {
      return urlTab;
    }
    
    // Затем проверяем localStorage
    const savedTab = localStorage.getItem('adminActiveTab') as TabType;
    return savedTab && ['dashboard', 'clinics', 'cities', 'bookings', 'verification', 'packages', 'statistics', 'settings'].includes(savedTab) 
      ? savedTab 
      : 'dashboard';
  });

  // Инициализация URL и обработка изменения URL при навигации браузера
  useEffect(() => {
    // Устанавливаем URL параметр при первой загрузке, если его нет
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('tab')) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    }

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab') as TabType;
      
      if (urlTab && ['dashboard', 'clinics', 'cities', 'bookings', 'verification', 'packages', 'statistics', 'settings'].includes(urlTab)) {
        setActiveTab(urlTab);
        localStorage.setItem('adminActiveTab', urlTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  // Получаем данные о заявках для уведомлений
  const { data: bookingsData } = useQuery({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/bookings');
      return response.json();
    },
    refetchInterval: 5000, // Обновлять каждые 5 секунд
  });

  // Подсчитываем количество новых заявок
  const newBookingsCount = bookingsData?.bookings?.filter((booking: any) => booking.status === 'new').length || 0;

  // Получаем количество ожидающих заявок верификации
  const { data: verificationCountData } = useQuery({
    queryKey: ['/api/admin/pending-verification-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/pending-verification-count');
      return response.json();
    },
    refetchInterval: 5000, // Обновлять каждые 5 секунд
  });

  // Получаем количество ожидающих заявок на новые клиники
  const { data: newClinicCountData } = useQuery({
    queryKey: ['/api/admin/pending-new-clinic-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/pending-new-clinic-count');
      return response.json();
    },
    refetchInterval: 5000, // Обновлять каждые 5 секунд
  });

  const pendingVerificationCount = verificationCountData?.count || 0;
  const pendingNewClinicCount = newClinicCountData?.count || 0;

  // Звуковое уведомление при появлении новых заявок
  useEffect(() => {
    const previousCount = localStorage.getItem('previousNewBookingsCount');
    const currentCount = newBookingsCount.toString();
    
    // Инициализируем счетчик при первой загрузке
    if (!previousCount) {
      localStorage.setItem('previousNewBookingsCount', currentCount);
      return;
    }
    
    if (parseInt(previousCount) < newBookingsCount) {
      // Проверяем, было ли взаимодействие пользователя с страницей
      const hasUserInteracted = localStorage.getItem('userHasInteracted') === 'true';
      
      console.log(`Новые заявки: ${newBookingsCount - parseInt(previousCount)}. User interacted: ${hasUserInteracted}`);
      
      if (hasUserInteracted) {
        // Воспроизводим звук уведомления только после взаимодействия пользователя
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.play().catch(error => {
            console.log('Audio notification failed:', error);
          });
        } catch (error) {
          console.log('Audio notification not supported');
        }
      } else {
        // Альтернативное уведомление - вибрация (если поддерживается)
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(200);
          } catch (error) {
            console.log('Vibration not supported');
          }
        }
      }
    }
    
    localStorage.setItem('previousNewBookingsCount', currentCount);
  }, [newBookingsCount]);

  // Звуковое уведомление при появлении новых заявок верификации
  useEffect(() => {
    const previousCount = localStorage.getItem('previousPendingVerificationCount');
    const currentCount = pendingVerificationCount.toString();
    
    // Инициализируем счетчик при первой загрузке
    if (!previousCount) {
      localStorage.setItem('previousPendingVerificationCount', currentCount);
      return;
    }
    
    if (parseInt(previousCount) < pendingVerificationCount) {
      // Проверяем, было ли взаимодействие пользователя с страницей
      const hasUserInteracted = localStorage.getItem('userHasInteracted') === 'true';
      
      console.log(`Новые заявки верификации: ${pendingVerificationCount - parseInt(previousCount)}. User interacted: ${hasUserInteracted}`);
      
      if (hasUserInteracted) {
        // Воспроизводим звук уведомления только после взаимодействия пользователя
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.play().catch(error => {
            console.log('Audio notification failed:', error);
          });
        } catch (error) {
          console.log('Audio notification not supported');
        }
      } else {
        // Альтернативное уведомление - вибрация (если поддерживается)
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(200);
          } catch (error) {
            console.log('Vibration not supported');
          }
        }
      }
    }
    
    localStorage.setItem('previousPendingVerificationCount', currentCount);
  }, [pendingVerificationCount]);

  // Обновляем заголовок страницы с уведомлением о новых заявках
  useEffect(() => {
    const originalTitle = 'Dent Moldova Admin';
    const totalNotifications = newBookingsCount + pendingVerificationCount;
    if (totalNotifications > 0) {
      document.title = `(${totalNotifications}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  }, [newBookingsCount, pendingVerificationCount]);

  // Обработчик взаимодействия пользователя для разрешения звуковых уведомлений
  useEffect(() => {
    const handleUserInteraction = () => {
      localStorage.setItem('userHasInteracted', 'true');
      // Удаляем обработчики после первого взаимодействия
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // Добавляем обработчики для различных типов взаимодействия
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Сохраняем активную вкладку в localStorage и URL при изменении
  const handleTabChange = (tab: TabType, clinicId?: string) => {
    setActiveTab(tab);
    localStorage.setItem('adminActiveTab', tab);
    

    
    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    if (clinicId) {
      url.searchParams.set('clinicId', clinicId);
    }
    window.history.replaceState({}, '', url.toString());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleTabChange} />;
      case 'clinics':
        return <ClinicsManagement />;
      case 'cities':
        return <CitiesManagement />;
      case 'bookings':
        return <BookingsManagement />;
      case 'verification':
        return <VerificationRequests />;
      case 'new-clinics':
        return <NewClinicRequests />;
      case 'packages':
        return <PackagesManagement />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;

      default:
        return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onLogout={onLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex h-screen">
        {/* Sidebar - адаптивный */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static
          top-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 h-full shadow-lg
          transition-transform duration-300 ease-in-out
        `}>
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              handleTabChange(tab as TabType);
              setSidebarOpen(false); // Закрываем сайдбар на мобилках после выбора
            }}
            newBookingsCount={newBookingsCount}
            pendingVerificationCount={pendingVerificationCount}
            pendingNewClinicCount={pendingNewClinicCount}

            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* Overlay для мобилок */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}