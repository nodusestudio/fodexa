import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const defaultSettings = {
  company: {
    name: '',
    address: '',
    phone: '',
    logo: ''
  },
  ticket: {
    format: '',
    showLogo: true
  },
  taxes: {
    iva: 0,
    otherTaxes: []
  },
  currency: {
    symbol: '$',
    code: 'COP',
    decimals: false,
    format: '#,##0'
  },
  language: 'es',
  appearance: {
    theme: 'light',
    darkLogo: ''
  },
  general: {
    initialTicketNumber: 1
  },
  delivery: {
    enabled: true,
    baseAmount: 0,
    presets: [30, 40, 50]
  }
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    const storageKey = `settings_${user?.uid || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    const loaded = saved ? JSON.parse(saved) : defaultSettings;
    return {
      ...loaded,
      currency: {
        ...loaded.currency,
        code: 'COP',
        symbol: '$',
        decimals: false
      }
    };
  });

  // Cargar settings desde Firestore cuando cambia el usuario
  useEffect(() => {
    if (!user) return;

    const loadSettingsFromFirestore = async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/settings`, 'general');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const firestoreSettings = docSnap.data();
          setSettings(prev => ({
            ...firestoreSettings,
            currency: {
              ...firestoreSettings.currency,
              code: 'COP',
              symbol: '$',
              decimals: false
            }
          }));
          console.log('✅ Settings cargados desde Firestore');
        } else {
          console.log('📝 Creando settings iniciales en Firestore');
          // Crear documento inicial si no existe
          await setDoc(docRef, defaultSettings);
        }
      } catch (error) {
        console.warn('⚠️ Error cargando settings de Firestore:', error.message);
        // Usar localStorage como fallback
      }
    };

    loadSettingsFromFirestore();
  }, [user]);

  // Guardar en localStorage Y Firestore cuando cambian
  useEffect(() => {
    if (!user) return;

    // Guardar en localStorage primero (rápido)
    const storageKey = `settings_${user.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(settings));

    // Guardar en Firestore en background (sin bloquear)
    (async () => {
      try {
        const docRef = doc(db, `users/${user.uid}/settings`, 'general');
        await setDoc(docRef, settings, { merge: true });
        console.log('✅ Settings guardados en Firestore');
      } catch (error) {
        console.warn('⚠️ Error guardando en Firestore (localStorage OK):', error.message);
      }
    })();
  }, [settings, user]);

  const updateSettings = (section, key, value) => {
    setSettings(prev => {
      if (section && key) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        };
      } else if (section && !key) {
        return {
          ...prev,
          [section]: value
        };
      }
      return prev;
    });
  };

  const resetSettings = () => setSettings(defaultSettings);

  // Resetear datos ficticios del usuario (órdenes, tickets, caja, reportes)
  // NO toca: clientes, artículos, categorías, adicionales, settings
  const resetUserData = async () => {
    if (!user) return;

    try {
      console.log('🗑️ Iniciando reseteo de datos ficticios...');
      
      const collectionsToReset = [
        'tickets',      // Órdenes completadas
        'orders',       // Órdenes activas
        'cash',         // Caja (aperturas, cierres, gastos)
        'ledger',       // Libro contable
        'reports',      // Reportes generados
      ];

      for (const collectionName of collectionsToReset) {
        try {
          const collRef = collection(db, `users/${user.uid}/${collectionName}`);
          const snapshot = await getDocs(collRef);
          
          let deletedCount = 0;
          for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
            deletedCount++;
          }
          
          console.log(`✅ ${collectionName}: ${deletedCount} documentos eliminados`);
        } catch (error) {
          console.warn(`⚠️ Error limpiando ${collectionName}:`, error.message);
        }
      }

      console.log('✅ Reseteo completado exitosamente');
      alert('✅ Datos ficticios eliminados correctamente\n\nClientes y artículos preservados');
      return true;
    } catch (error) {
      console.error('❌ Error durante reseteo:', error);
      alert('❌ Error al resetear datos');
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, resetUserData }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
