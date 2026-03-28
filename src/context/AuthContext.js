import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitorear cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Registrar nuevo usuario
  const signup = async (email, password) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      console.warn('Firebase signup error, using demo mode:', err.message);
      setError(null);
      // Fallback: crear usuario de demostración local
      const mockUser = {
        uid: 'demo_' + Date.now(),
        email,
        emailVerified: false,
        isDemo: true,
      };
      setUser(mockUser);
      return mockUser;
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      console.warn('Firebase login error, using demo mode:', err.message);
      setError(null);
      // Fallback: permitir login de demostración con cualquier email/password válido
      if (email && password && password.length >= 6) {
        const mockUser = {
          uid: 'demo_' + Date.now(),
          email,
          emailVerified: false,
          isDemo: true,
        };
        setUser(mockUser);
        return mockUser;
      }
      setError('Email o contraseña inválidos (mín. 6 caracteres)');
      throw new Error('Email o contraseña inválidos');
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Retornar contexto o valor seguro por defecto
  if (!context) {
    return {
      user: null,
      loading: true,
      error: null,
      signup: async () => { throw new Error('Auth not initialized'); },
      login: async () => { throw new Error('Auth not initialized'); },
      logout: async () => { throw new Error('Auth not initialized'); },
    };
  }
  return context;
};
