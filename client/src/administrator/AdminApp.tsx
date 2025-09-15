import { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { apiRequest } from '@/lib/queryClient';

export function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if admin is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await apiRequest('GET', '/api/admin/auth/check');
      
      // Если пользователь авторизован, но в URL есть параметры от предыдущей сессии,
      // очищаем их и перенаправляем на главную панель
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('tab') || urlParams.has('clinicId') || urlParams.has('id') || 
          urlParams.has('edit') || urlParams.has('new') || urlParams.has('status')) {
        localStorage.removeItem('adminActiveTab');
        const url = new URL(window.location.href);
        url.searchParams.delete('tab');
        url.searchParams.delete('clinicId');
        url.searchParams.delete('id');
        url.searchParams.delete('edit');
        url.searchParams.delete('new');
        url.searchParams.delete('status');
        window.history.replaceState({}, '', url.toString());
      }
      
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
      
      // Очищаем localStorage и URL параметры при успешном логине
      localStorage.removeItem('adminActiveTab');
      const url = new URL(window.location.href);
      url.searchParams.delete('tab');
      url.searchParams.delete('clinicId');
      url.searchParams.delete('id');
      url.searchParams.delete('edit');
      url.searchParams.delete('new');
      url.searchParams.delete('status');
      window.history.replaceState({}, '', url.toString());
      
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
    // Очищаем localStorage при выходе из админки
    localStorage.removeItem('adminActiveTab');
    // Очищаем URL параметры при выходе
    const url = new URL(window.location.href);
    url.searchParams.delete('tab');
    url.searchParams.delete('clinicId');
    url.searchParams.delete('id');
    url.searchParams.delete('edit');
    url.searchParams.delete('new');
    url.searchParams.delete('status');
    window.history.replaceState({}, '', url.toString());
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminLogin
          onLogin={handleLogin}
          error={loginError}
          loading={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminDashboard onLogout={handleLogout} />
    </div>
  );
}