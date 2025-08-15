import { useState, useEffect } from 'react';
import { AdminLogin } from '../administrator/AdminLogin';
import { AdminDashboard } from '../administrator/AdminDashboard';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminModal({ open, onClose }: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (open) {
      checkAuthStatus();
    }
  }, [open]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      await apiRequest('GET', '/api/admin/auth/check');
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setLoginError('');
    try {
      await apiRequest('POST', '/api/admin/auth/login', { username, password });
      setIsAuthenticated(true);
    } catch (error: any) {
      setLoginError(error.message || 'Неверный логин или пароль');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/admin/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    onClose();
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setLoginError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Администрирование</DialogTitle>
          <DialogDescription>Панель администратора для управления клиниками</DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-6">
            <AdminLogin
              onLogin={handleLogin}
              error={loginError}
              loading={false}
            />
          </div>
        ) : (
          <div className="h-[85vh] overflow-hidden">
            <AdminDashboard onLogout={handleLogout} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}