import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado, no mostrar nada (se está redirigiendo)
  if (user) {
    return null;
  }

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleForgotPassword = () => {
    setMode('forgot-password');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm 
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
          />
        );
      case 'register':
        return (
          <RegisterForm 
            onToggleMode={handleToggleMode}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            onBack={handleBackToLogin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo o branding */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rentability
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Gestión Empresarial
          </p>
        </div>

        {/* Formulario de autenticación */}
        {renderForm()}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Rentability. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
} 