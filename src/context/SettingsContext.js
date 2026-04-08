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
  },
  orderButtons: {
    alarmTime: 20, // 🔴 Minutos para alarma
    alarmSound: true, // 🔔 Reproducir sonido
    buttonTexts: {
      cook: '▶ Cocinar',
      cooking: '🍳 Cocinando',
      served: '✅ Mesa servida'
    },
    colors: {
      pending: '#FBBF24', // Amarillo
      preparing: '#F97316', // Naranja
      ready: '#22C55E' // Verde
    },
    estimatedTime: 15, // Tiempo estimado en minutos
    showTimer: true,
    enableAutoAlarm: true
  },
  kitchenButton: {
    // 👨‍🍳 Configuración del Botón de Cocina y Ticket
    buttonText: '🔔 Cocina', // Texto del botón
    buttonColor: '#f97316', // Color del botón
    ticketTitle: '🍳 COCINA', // Título del ticket
    showTableInfo: true, // Mostrar info de mesa/cliente
    showPhone: true, // Mostrar teléfono en delivery
    showNotes: true, // Mostrar notas especiales
    showAddons: true, // Mostrar addons/extras
    paperWidth: 80, // Ancho en mm (80mm típico point of sale)
    headerText: '', // Texto personalizado en encabezado
    footerText: '', // Texto personalizado en pie
    showTimestamp: true, // Mostrar fecha/hora
    separatorCharacter: '-' // Carácter para separadores
  },
  payment: {
    // 💳 Configuración de Métodos de Pago
    buttonText: '💳 Cobrar',
    buttonColor: '#22c55e', // Verde
    methods: {
      cash: { 
        name: '💵 Efectivo', 
        enabled: true, 
        icon: '💵',
        submethods: [] // Sin submétodos
      },
      card: { 
        name: '💳 Tarjeta', 
        enabled: true, 
        icon: '💳',
        submethods: [
          { id: 'visa', name: '💳 Visa', enabled: true },
          { id: 'mastercard', name: '💳 Mastercard', enabled: true },
          { id: 'amex', name: '💳 American Express', enabled: false },
          { id: 'other_card', name: '💳 Otra Tarjeta', enabled: true }
        ]
      },
      transfer: { 
        name: '🏦 Transferencia', 
        enabled: true, 
        icon: '🏦',
        submethods: [
          { id: 'bancolombia', name: '🏦 Bancolombia', enabled: true },
          { id: 'nequi', name: '📱 Nequi', enabled: true },
          { id: 'daviplata', name: '📱 Daviplata', enabled: false },
          { id: 'other_transfer', name: '🏦 Otra Transferencia', enabled: true }
        ]
      },
      pse: { 
        name: '🔗 PSE', 
        enabled: false, 
        icon: '🔗',
        submethods: []
      },
      check: { 
        name: '📋 Cheque', 
        enabled: false, 
        icon: '📋',
        submethods: []
      },
      credit: { 
        name: '📝 Crédito', 
        enabled: false, 
        icon: '📝',
        submethods: []
      }
    },
    // Configuración de pago dividido
    splitPayment: {
      enabled: true, // Permitir pago dividido
      maxMethods: 2, // Máximo métodos simultáneamente
      allowPartial: true // Permitir pagos incompletos
    },
    // Otras configuraciones
    requireNote: false, // Requerir nota al pagar
    showBalance: true, // Mostrar saldo pendiente
    autoClose: false // Cerrar orden después de pagar
  },
  deliveryTimer: {
    // 🚚 Configuración del Timer de Delivery
    firstAlarmMinutes: 10, // ⏰ Minutos para primera alarma (cuando se crea la orden)
    secondAlarmMinutes: 5, // ⏰ Minutos para segunda alarma (cuando se hace clic en "Aún preparando")
    deliveryTimeoutMinutes: 20 // ⏰ Minutos máximos en la sección Domicilios
  },
  systemAlerts: {
    // 🔔 Configuración de Alertas del Sistema
    soundType: 'beep-double', // Tipo de sonido: 'beep-double', 'beep-triple', 'alarm', 'siren'
    soundVolume: 80 // Volumen del sonido (0-100)
  }
};

const SettingsContext = createContext();

const mergePaymentMethods = (savedMethods = {}) => {
  return Object.keys(defaultSettings.payment.methods).reduce((acc, methodKey) => {
    acc[methodKey] = {
      ...defaultSettings.payment.methods[methodKey],
      ...(savedMethods?.[methodKey] || {})
    };
    return acc;
  }, {});
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    const storageKey = `settings_${user?.uid || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    const loaded = saved ? JSON.parse(saved) : defaultSettings;
    // ✅ Mergear siempre con defaults para asegurar que existan payment.methods, etc.
    return {
      ...defaultSettings,
      ...loaded,
      currency: {
        ...defaultSettings.currency,
        ...(loaded.currency || {}),
        code: 'COP',
        symbol: '$',
        decimals: false
      },
      payment: {
        ...defaultSettings.payment,
        ...(loaded.payment || {}),
        methods: mergePaymentMethods(loaded.payment?.methods)
      },
      deliveryTimer: {
        ...defaultSettings.deliveryTimer,
        ...(loaded.deliveryTimer || {})
      },
      systemAlerts: {
        ...defaultSettings.systemAlerts,
        ...(loaded.systemAlerts || {})
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
          // ✅ Mergear con defaults para asegurar que siempre existan payment.methods, etc.
          setSettings(prev => ({
            ...defaultSettings,
            ...firestoreSettings,
            currency: {
              ...defaultSettings.currency,
              ...(firestoreSettings.currency || {}),
              code: 'COP',
              symbol: '$',
              decimals: false
            },
            payment: {
              ...defaultSettings.payment,
              ...(firestoreSettings.payment || {}),
              methods: mergePaymentMethods(firestoreSettings.payment?.methods)
            },
            deliveryTimer: {
              ...defaultSettings.deliveryTimer,
              ...(firestoreSettings.deliveryTimer || {})
            },
            systemAlerts: {
              ...defaultSettings.systemAlerts,
              ...(firestoreSettings.systemAlerts || {})
            }
          }));
        } else {
          // Crear documento inicial si no existe
          await setDoc(docRef, defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.warn('⚠️ Error cargando settings de Firestore:', error.message);
        // Usar localStorage como fallback
        setSettings(defaultSettings);
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
      
      // 1️⃣ Limpiar localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => {
        const shouldRemove = key.includes(user.uid) || 
                            key.includes('order') || 
                            key.includes('cart') || 
                            key.includes('cash') ||
                            key.includes('ticket') ||
                            key.includes('delivery') ||
                            key.includes('domain');
        if (shouldRemove) {
        }
        return shouldRemove;
      });
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 2️⃣ Limpiar sessionStorage
      sessionStorage.clear();

      // 3️⃣ Limpiar IndexedDB (si lo hay)
      if (window.indexedDB) {
        const databases = await new Promise((resolve) => {
          const dbList = [];
          try {
            // Intentar limpiar bases de datos conocidas
            ['fodexa', 'firebase', 'orders', 'tickets'].forEach(dbName => {
              try {
                indexedDB.deleteDatabase(dbName);
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
      
      // 1️⃣ LIMPIAR localStorage COMPLETAMENTE - TODO TODO TODO
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
          localStorageCleared++;
        }
      });

      // 2️⃣ LIMPIAR sessionStorage COMPLETAMENTE
      sessionStorage.clear();

      // 3️⃣ LIMPIAR IndexedDB
      if (window.indexedDB) {
        try {
          ['fodexa', 'firebase', 'orders', 'tickets', 'cash', 'cashSessions'].forEach(dbName => {
            try {
              indexedDB.deleteDatabase(dbName);
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
            return 0;
          }

          let deletedCount = 0;
          const batch = [];

          // Eliminar TODOS los documentos
          for (const doc of snapshot.docs) {
            batch.push(deleteDoc(doc.ref));
            deletedCount++;
          }

          if (batch.length > 0) {
            await Promise.all(batch);
          }
          
          // Verificar que realmente se eliminaron (importante para Libro Contable)
          const verifySnapshot = await getDocs(collRef);
          if (verifySnapshot.size > 0) {
            console.warn(`⚠️ ADVERTENCIA: ${collectionPath} aún tiene ${verifySnapshot.size} docs`);
            // Intentar eliminarlos nuevamente
            for (const doc of verifySnapshot.docs) {
              await deleteDoc(doc.ref);
              deletedCount++;
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
        totalDeleted += await deleteCollection(collPath);
        // Delay entre colecciones
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 7️⃣ GARANTÍA EXTRA: Verificar que cashSessions (Libro Contable) está COMPLETAMENTE VACÍO
      const cashSessionsRef = collection(db, `users/${user.uid}/cashSessions`);
      const finalCheck = await getDocs(cashSessionsRef);
      if (finalCheck.size > 0) {
        console.warn(`⚠️ ALERTA: Libro Contable aún tiene ${finalCheck.size} registros! ELIMINANDO...`);
        let extraDeleted = 0;
        for (const doc of finalCheck.docs) {
          await deleteDoc(doc.ref);
          extraDeleted++;
        }
        totalDeleted += extraDeleted;
      } else {
      }

      
      // 8️⃣ RECARGAR CON DELAY
      setTimeout(() => {
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
    <SettingsContext.Provider value={{ settings, updateSettings, resetUserData, hardResetSystem }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };
export const useSettings = () => useContext(SettingsContext);
