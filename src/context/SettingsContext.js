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

  const hardResetSystem = async () => {
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
      console.log('🗑️ INICIANDO RESETEO NUCLEAR TOTAL...');
      
      // 1️⃣ LIMPIAR localStorage COMPLETAMENTE - TODO TODO TODO
      console.log('🧹 Limpiando localStorage...');
      const keysToCheck = Object.keys(localStorage);
      let localStorageCleared = 0;
      keysToCheck.forEach(key => {
        // Remover CUALQUIER cosa que pueda tener datos
        const shouldRemove = key.includes(user.uid) || 
                            key.includes('order') || 
                            key.includes('cart') || 
                            key.includes('cash') ||
                            key.includes('cashSession') ||
                            key.includes('ticket') ||
                            key.includes('delivery') ||
                            key.includes('ledger') ||
                            key.includes('report') ||
                            key.includes('domain') ||
                            key.includes('fodexa');
        
        if (shouldRemove) {
          localStorage.removeItem(key);
          console.log(`  ✓ localStorage removed: ${key}`);
          localStorageCleared++;
        }
      });
      console.log(`✅ localStorage: ${localStorageCleared} keys eliminadas`);

      // 2️⃣ LIMPIAR sessionStorage COMPLETAMENTE
      console.log('🧹 Limpiando sessionStorage...');
      sessionStorage.clear();
      console.log('✅ sessionStorage: limpiado');

      // 3️⃣ LIMPIAR IndexedDB
      console.log('🧹 Limpiando IndexedDB...');
      if (window.indexedDB) {
        try {
          ['fodexa', 'firebase', 'orders', 'tickets', 'cash', 'cashSessions'].forEach(dbName => {
            try {
              indexedDB.deleteDatabase(dbName);
              console.log(`  ✓ Deleted IndexedDB: ${dbName}`);
            } catch (err) {}
          });
        } catch (err) {
          console.warn('IndexedDB cleanup: ', err.message);
        }
      }

      // 4️⃣ COLECCIONES A ELIMINAR EN FIRESTORE
      const collectionsToReset = [
        'orders',        // Órdenes activas
        'tickets',       // Órdenes completadas
        'cash',          // Gastos/movimientos de caja
        'cashSessions',  // Sesiones de caja (LIBRO CONTABLE) ← CRÍTICO
        'ledger',        // Reportes contables
        'reports',       // Reportes generados
      ];

      // 5️⃣ Función auxiliar mejorada - ELIMINA RECURSIVAMENTE todo
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

          // Eliminar TODOS los documentos
          for (const doc of snapshot.docs) {
            batch.push(deleteDoc(doc.ref));
            deletedCount++;
            console.log(`  - Deleting: ${doc.id}`);
          }

          if (batch.length > 0) {
            await Promise.all(batch);
            console.log(`✅ ${collectionPath.split('/').pop()}: ${deletedCount} docs ELIMINADOS`);
          }
          
          // Verificar que realmente se eliminaron (importante para Libro Contable)
          const verifySnapshot = await getDocs(collRef);
          if (verifySnapshot.size > 0) {
            console.warn(`⚠️ ADVERTENCIA: ${collectionPath} aún tiene ${verifySnapshot.size} docs`);
            // Intentar eliminarlos nuevamente
            for (const doc of verifySnapshot.docs) {
              await deleteDoc(doc.ref);
              deletedCount++;
              console.log(`  - 2nd attempt: Deletando ${doc.id}`);
            }
          }
          
          return deletedCount;
        } catch (error) {
          console.error(`❌ Error en ${collectionPath}:`, error.message);
          throw error;
        }
      };

      // 6️⃣ Eliminar colecciones SECUENCIALMENTE
      let totalDeleted = 0;
      for (const collectionName of collectionsToReset) {
        const collPath = `users/${user.uid}/${collectionName}`;
        console.log(`\n🔄 Procesando ${collectionName}...`);
        totalDeleted += await deleteCollection(collPath);
        // Delay entre colecciones
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 7️⃣ GARANTÍA EXTRA: Verificar que cashSessions (Libro Contable) está COMPLETAMENTE VACÍO
      console.log('\n🔐 VERIFICACIÓN FINAL DEL LIBRO CONTABLE...');
      const cashSessionsRef = collection(db, `users/${user.uid}/cashSessions`);
      const finalCheck = await getDocs(cashSessionsRef);
      if (finalCheck.size > 0) {
        console.warn(`⚠️ ALERTA: Libro Contable aún tiene ${finalCheck.size} registros! ELIMINANDO...`);
        let extraDeleted = 0;
        for (const doc of finalCheck.docs) {
          await deleteDoc(doc.ref);
          extraDeleted++;
          console.log(`  ✓ Forzado eliminar: ${doc.id}`);
        }
        totalDeleted += extraDeleted;
        console.log(`✅ Libro Contable limpiado: ${extraDeleted} registros eliminados en 2º intento`);
      } else {
        console.log('✅ Libro Contable: 100% LIMPIO ');
      }

      console.log(`\n✅ TOTAL ELIMINADO FIRESTORE: ${totalDeleted} documentos`);
      console.log(`✅ TOTAL ELIMINADO localStorage: ${localStorageCleared} keys`);
      console.log('⏳ Esperando 1 segundo antes de recargar...');
      
      // 8️⃣ RECARGAR CON DELAY
      setTimeout(() => {
        console.log('🔄 RECARGANDO PÁGINA COMPLETAMENTE...');
        // Hard reload
        window.location.href = window.location.href + '?nocache=' + Date.now();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ ERROR CRÍTICO:', error);
      alert('❌ Error: ' + error.message + '\n\nRevisa consola (F12)');
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
