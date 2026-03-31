import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { APP_VERSION } from '../config/version';

export default function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
        alert('✅ Cuenta creada. Inicia sesión ahora.');
        setIsSignUp(false);
      } else {
        await login(email, password);
        console.log('✅ Sesión iniciada');
        setTimeout(() => navigate('/'), 500);
      }
    } catch (err) {
      const errorMessages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/user-not-found': 'Usuario no encontrado. Crea una cuenta primero.',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/operation-not-allowed': 'La autenticación está deshabilitada',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      };
      const message = errorMessages[err.code] || err.message || 'Error de autenticación';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setRecoveryMessage('');
    setLoading(true);

    try {
      const result = await resetPassword(recoveryEmail);
      setRecoveryMessage(result.message);
      setRecoveryEmail('');
      // Auto-redirigir a login después de 3 segundos
      setTimeout(() => {
        setIsRecovery(false);
        setRecoveryMessage('');
      }, 3000);
    } catch (err) {
      const errorMessages = {
        'auth/user-not-found': 'No hay una cuenta asociada a este email',
        'auth/invalid-email': 'Email inválido',
      };
      const message = errorMessages[err.code] || err.message || 'Error al recuperar contraseña';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🍔 FODEXA
            </h1>
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-full font-medium">
              Demo
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema POS - Punto de Venta
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {recoveryMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">{recoveryMessage}</p>
          </div>
        )}

        {/* Password Recovery Form */}
        {isRecovery && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email para recuperación
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
            </button>
          </form>
        )}

        {/* Login/Signup Form */}
        {!isRecovery && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {/* Demo Info */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 rounded">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>📝 Datos de prueba:</strong>
            <br />
            Email: <code className="bg-blue-100 dark:bg-blue-800 px-1">test@example.com</code>
            <br />
            Contraseña: <code className="bg-blue-100 dark:bg-blue-800 px-1">password123</code>
          </p>
        </div>

        {/* Toggle Sign Up / Forgot Password */}
        <div className="mt-4 text-center space-y-2">
          {!isRecovery && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                </button>
              </p>
              {!isSignUp && (
                <p className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovery(true);
                      setError('');
                    }}
                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              )}
            </>
          )}
          {isRecovery && (
            <p className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsRecovery(false);
                  setError('');
                  setRecoveryMessage('');
                }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
              >
                ← Volver al login
              </button>
            </p>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            ℹ️ actualización n {APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
}
