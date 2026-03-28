import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeedData } from '../hooks/useSeedData';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export const DataSeeder = () => {
  const { user } = useAuth();
  const { loading, error, success, loadMockData, clearData } = useSeedData();
  const [showModal, setShowModal] = useState(false);

  if (!user) {
    return null; // No mostrar si no hay usuario
  }

  const handleLoadData = async () => {
    const result = await loadMockData(user.uid);
    if (result) {
      setTimeout(() => setShowModal(false), 2000);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos de prueba?')) {
      await clearData(user.uid);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir modal */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg z-40 tooltip"
        title="Cargar datos de prueba"
      >
        <span className="text-lg">⚙️</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Cargar Datos de Prueba
            </h2>

            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    ✅ Datos cargados exitosamente
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Ya puedes ver productos, órdenes y gastos en la aplicación
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Datos incluidos:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>✓ 5 categorías de productos</li>
                  <li>✓ 13 productos variados</li>
                  <li>✓ 4 adicionales (toppings)</li>
                  <li>✓ 3 órdenes de ejemplo</li>
                  <li>✓ 3 gastos registrados</li>
                </ul>
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleLoadData}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Cargando...' : 'Cargar Datos de Prueba'}
              </button>

              <button
                onClick={handleClearData}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition"
              >
                Limpiar Datos
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-2 px-4 rounded transition"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Esta función carga datos ficticios para pruebas. Disponible solo con usuario autenticado.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DataSeeder;
