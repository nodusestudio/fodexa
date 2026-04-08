import React, { useEffect, useRef, useState } from 'react';
import { useCash } from '../../context/CashContext';

const CashOpening = ({ onClose }) => {
  const { openCash } = useCash();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showLocalButton, setShowLocalButton] = useState(false);
  const [useLocalMode, setUseLocalMode] = useState(false); // Fuerza apertura en modo LOCAL
  const openCashRef = useRef(openCash);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    openCashRef.current = openCash;
  }, [openCash]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Abrir caja automáticamente con timeout y reintentos
  useEffect(() => {
    let timeoutId;
    let localButtonTimeoutId;
    let isMounted = true;

    const handleOpenCash = async () => {
      try {
        setStatus('loading');
        setError(null);
        setShowLocalButton(false);

        // ⏱️ Mostrar botón "Usar Modo Local" después de 2 segundos esperando (SOLO si no se fuerza local)
        if (!useLocalMode) {
          localButtonTimeoutId = setTimeout(() => {
            if (isMounted) {
              setShowLocalButton(true);
            }
          }, 2000);
        }

        // Intentar abrir caja con timeout de 3 segundos
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Timeout: Firestore tardó demasiado (>3s). Usa Modo Local o verifica tu conexión.'));
          }, 3000);
        });

        const openCashPromise = openCashRef.current({
          initialAmount: 0,
          fundAmount: 0,
          breakdown: {},
          notes: '',
          openedAt: new Date(),
          forceLocal: useLocalMode, // ⚡ Pasar bandera para forzar modo LOCAL
        });

        // Carrera: lo que complete primero
        await Promise.race([openCashPromise, timeoutPromise]);

        clearTimeout(timeoutId);
        clearTimeout(localButtonTimeoutId);

        if (isMounted) {
          setStatus('success');
          // Cerrar modal después de 1.5 segundos
          setTimeout(() => {
            if (isMounted) onCloseRef.current?.();
          }, 1500);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        clearTimeout(localButtonTimeoutId);

        if (isMounted) {
          console.error('❌ Error abriendo caja:', err);
          setError(err.message);
          setStatus('error');
        }
      }
    };

    handleOpenCash();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(localButtonTimeoutId);
    };
  }, [retryCount, useLocalMode]);

  // Si está cargando, mostrar spinner + botón "Usar Modo Local" después de 2s
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Abriendo Caja...</h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Conectando a Firestore... (máx 3 segundos)
          </p>

          {/* Botón "Usar Modo Local" aparece después de 2 segundos */}
          {showLocalButton && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">
                  ⏱️ Firestore tarda mucho en responder
                </p>
              </div>

              <button
                onClick={() => {
                  setShowLocalButton(false);
                  setUseLocalMode(true); // ⚡ Forzar apertura en MODO LOCAL
                }}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                ⚡ Usar Modo Local Ahora (No Esperar)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si éxito, no mostrar nada (se cierra automáticamente)
  if (status === 'success') {
    return null;
  }

  // Si error, mostrar UI de error
  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-xl font-bold">Error Abriendo Caja</h2>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
              {error}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>💡 Posibles causas:</strong>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>Cuota de Firestore alcanzada (plan gratuito)</li>
                <li>Sin conexión a internet</li>
                <li>Firebase configurado incorrectamente</li>
              </ul>
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setRetryCount(c => c + 1); // Reintentar
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                🔄 Reintentar
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
            
            <button
              onClick={() => {
                setUseLocalMode(true); // ⚡ Forzar apertura en MODO LOCAL sin esperar más
              }}
              className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors text-sm"
            >
              ⚡ Usar Modo Local (No Esperar Firestore)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CashOpening;
