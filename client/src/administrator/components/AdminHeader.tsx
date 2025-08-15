import { Button } from '@/components/ui/button';
import { Menu, LogOut, Settings, ExternalLink } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onLogout, onToggleSidebar, sidebarOpen }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-900">Dent Moldova Admin</h1>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Панель управления
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={() => window.open('/', '_blank')}
          variant="ghost" 
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Открыть сайт
        </Button>
        
        <Button 
          onClick={onLogout}
          variant="ghost" 
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выход
        </Button>
      </div>
    </header>
  );
}