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
      <AdminLogin
        onLogin={handleLogin}
        error={loginError}
        loading={false}
      />
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}