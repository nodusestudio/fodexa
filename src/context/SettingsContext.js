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

  const hardResetSystem = () => {
    if (!user) return false;

    try {
      console.log('🔄 HARD RESET - Limpiando sistema completamente...');
      
      // 1️⃣ Limpiar localStorage
      console.log('🧹 Limpiando localStorage...');
      const keysToRemove = Object.keys(localStorage).filter(key => {
        const shouldRemove = key.includes(user.uid) || 
                            key.includes('order') || 
                            key.includes('cart') || 
                            key.includes('cash') ||
                            key.includes('ticket') ||
                            key.includes('delivery') ||
                            key.includes('domain');
        if (shouldRemove) {
          console.log(`  ✓ Removing: ${key}`);
        }
        return shouldRemove;
      });
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 2️⃣ Limpiar sessionStorage
      console.log('🧹 Limpiando sessionStorage...');
      sessionStorage.clear();

      // 3️⃣ Limpiar IndexedDB (si lo hay)
      console.log('🧹 Limpiando IndexedDB...');
      if (window.indexedDB) {
        const databases = await new Promise((resolve) => {
          const dbList = [];
          try {
            // Intentar limpiar bases de datos conocidas
            ['fodexa', 'firebase', 'orders', 'tickets'].forEach(dbName => {
              try {
                indexedDB.deleteDatabase(dbName);
                console.log(`  ✓ Deleted IndexedDB: ${dbName}`);
              } catch (err) {
                // Ignorar si no existe
              }
            });
            resolve(dbList);
          } catch (err) {
            resolve(dbList);
          }
        });
      }

      console.log('✅ Sistema limpio. Recargando...');
      
      setTimeout(() => {
        alert('✅ Sistema restaurado e inicializado\n\nRecargando en 2 segundos...');
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 2000);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Error en hard reset:', error);
      alert('❌ Error: ' + error.message);
      return false;
    }
  };

  // Resetear datos ficticios del usuario (órdenes, tickets, caja, reportes)
  // NO toca: clientes, artículos, categorías, adicionales, settings
  const resetUserData = async () => {
    if (!user) return false;

    try {
      console.log('🗑️ INICIANDO RESETEO AGRESIVO...');
      
      // 1️⃣ LIMPIAR localStorage completamente
      console.log('🧹 Limpiando localStorage...');
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes(user.uid) || 
        key.includes('order') || 
        key.includes('cart') || 
        key.includes('cash') ||
        key.includes('ticket')
      );
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`  ✓ Removed: ${key}`);
      });

      // 2️⃣ COLECCIONES A ELIMINAR (expandida)
      const collectionsToReset = [
        'orders',        // Órdenes activas
        'tickets',       // Órdenes completadas
        'cash',          // Gastos
        'cashSessions',  // Sesiones de caja
        'ledger',        // Libro contable
        'reports',       // Reportes generados
      ];

      // 3️⃣ Función auxiliar mejorada
      const deleteCollection = async (collectionPath) => {
        try {
          const collRef = collection(db, collectionPath);
          const snapshot = await getDocs(collRef);
          
          if (snapshot.empty) {
            console.log(`✓ ${collectionPath.split('/').pop()}: ya está vacío`);
            return 0;
          }

          let deletedCount = 0;
          const batch = [];

          for (const doc of snapshot.docs) {
            batch.push(deleteDoc(doc.ref));
            deletedCount++;
          }

          await Promise.all(batch);
          
          // Verificar que realmente se eliminaron
          const verifySnapshot = await getDocs(collRef);
          console.log(`✅ ${collectionPath.split('/').pop()}: ${deletedCount} docs eliminados (verificado: ${verifySnapshot.size} restantes)`);
          return deletedCount;
        } catch (error) {
          console.error(`❌ Error en ${collectionPath}:`, error.message);
          return 0;
        }
      };

      // 4️⃣ Eliminar colecciones SECUENCIALMENTE (asegurar que terminan antes de continuar)
      let totalDeleted = 0;
      for (const collectionName of collectionsToReset) {
        const collPath = `users/${user.uid}/${collectionName}`;
        console.log(`🔄 Procesando ${collectionName}...`);
        totalDeleted += await deleteCollection(collPath);
        // Pequeño delay entre colecciones
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`\n✅ TOTAL ELIMINADO: ${totalDeleted} documentos`);
      console.log('⏳ Esperando 2 segundos antes de recargar...');
      
      // 5️⃣ RECARGAR CON DELAY MAYOR
      setTimeout(() => {
        console.log('🔄 Recargando página...');
        alert('✅ Sistema completamente limpio!\n\nClientes y artículos preservados\n\nRecargando en 3 segundos...');
        setTimeout(() => {
          window.location.href = window.location.href; // Reload completo
        }, 3000);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('❌ ERROR CRÍTICO:', error);
      alert('❌ Error al resetear: ' + error.message + '\n\nRevisa la consola para detalles');
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, resetUserData, hardResetSystem }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
