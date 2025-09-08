import { Button } from '@/components/ui/button';
import { Menu, LogOut, Settings, ExternalLink } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onLogout, onToggleSidebar, sidebarOpen }: AdminHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        {/* Мобильная кнопка меню */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.location.href = '/admin?tab=dashboard'}
            className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Dent Moldova Admin
          </button>
          <span className="hidden sm:inline bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Панель управления
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="p-2 hidden sm:flex">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={() => window.open('/', '_blank')}
          variant="ghost" 
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 hidden sm:flex"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Открыть сайт</span>
        </Button>
        
        <Button 
          onClick={onLogout}
          variant="ghost" 
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Выход</span>
        </Button>
      </div>
    </header>
  );
}