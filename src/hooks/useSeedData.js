import { useState } from 'react';
import { seedAllData, clearUserData } from '../services/firebaseSeedService';

export const useSeedData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadMockData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await seedAllData(userId);
      
      setSuccess(true);
      console.log('✅ Datos de prueba cargados correctamente');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar datos';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await clearUserData(userId);
      
      setSuccess(true);
      console.log('✅ Datos eliminados correctamente');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar datos';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    loadMockData,
    clearData,
  };
};
