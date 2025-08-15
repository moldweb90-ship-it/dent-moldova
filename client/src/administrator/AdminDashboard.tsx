import { useState, useEffect } from 'react';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { ClinicsManagement } from './components/ClinicsManagement';
import { Dashboard } from './components/Dashboard';
import { PackagesManagement } from './components/PackagesManagement';
import { CitiesManagement } from './components/CitiesManagement';
import { Settings } from './components/Settings';
import { BookingsManagement } from './components/BookingsManagement';

type AdminPage = 'dashboard' | 'clinics' | 'packages' | 'cities' | 'bookings' | 'settings';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'clinics':
        return <ClinicsManagement />;
      case 'packages':
        return <PackagesManagement />;
      case 'cities':
        return <CitiesManagement />;
      case 'bookings':
        return <BookingsManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex">
        <AdminSidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOpen={sidebarOpen}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-6">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  );
}