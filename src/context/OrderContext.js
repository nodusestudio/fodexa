import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, getDocs, getDoc, setDoc, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import tables from '../data/tables'; // MESA 7 ENABLED v36.0.1
import { mockOrders } from '../data/mockFirebaseData';

const OrderContext = createContext();
const ACTIVE_ORDER_STATUSES = ['pending', 'waiting', 'preparing', 'ready'];
const MAX_FIRESTORE_RETRIES = 3;
const FIRESTORE_RETRY_DELAY_MS = 1500;
const FIRESTORE_OPERATION_TIMEOUT_MS = 8000;

const getOrdersCacheKey = (uid) => `orders_cache_${uid || 'anonymous'}`;
const getOfflineModeKey = (uid) => `orders_offline_mode_${uid || 'anonymous'}`;

const readOfflineModeFlag = (uid) => {
  try {
    return localStorage.getItem(getOfflineModeKey(uid)) === '1';
  } catch {
    return false;
  }
};

const writeOfflineModeFlag = (uid, enabled) => {
  try {
    localStorage.setItem(getOfflineModeKey(uid), enabled ? '1' : '0');
  } catch {
    // ignore storage errors
  }
};

const isQuotaOrTimeoutFirestoreError = (error) => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  return (
    code.includes('quota') ||
    code.includes('resource-exhausted') ||
    code.includes('deadline-exceeded') ||
    code.includes('unavailable') ||
    message.includes('quota') ||
    message.includes('resource exhausted') ||
    message.includes('deadline') ||
    message.includes('timeout') ||
    message.includes('timed out')
  );
};

const withFirestoreTimeout = async (promise, timeoutMs = FIRESTORE_OPERATION_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Firestore timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
};

const readOrdersFromCache = (uid) => {
  try {
    const raw = localStorage.getItem(getOrdersCacheKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeOrdersToCache = (uid, orders) => {
  try {
    localStorage.setItem(getOrdersCacheKey(uid), JSON.stringify(orders || []));
  } catch {
    // ignore cache write errors
  }
};

const normalizeOrderStatus = (status) => {
  if (!status) return null;
  return String(status).trim().toLowerCase();
};

const sanitizeOrderFromDoc = (docSnapshot) => {
  const data = docSnapshot.data();
  const normalizedStatus = normalizeOrderStatus(data.status);

  if (!normalizedStatus || !ACTIVE_ORDER_STATUSES.includes(normalizedStatus)) {
    return null;
  }

  if (!data.type) {
    return null;
  }

  return {
    id: docSnapshot.id,
    ...data,
    status: normalizedStatus,
    timestamp: data.timestamp?.toDate?.() || data.timestamp,
  };
};

const areOrdersEqual = (prev = [], next = []) => {
  if (prev === next) return true;
  if (!Array.isArray(prev) || !Array.isArray(next)) return false;
  if (prev.length !== next.length) return false;

  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (!a || !b) return false;

    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;

    if (
      a.id !== b.id ||
      a.status !== b.status ||
      a.type !== b.type ||
      aTime !== bTime ||
      Number(a.total || 0) !== Number(b.total || 0)
    ) {
      return false;
    }
  }

  return true;
};

export const OrderProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const uid = user?.uid;
  const [orders, setOrders] = useState([]);
  const [currentOrderType, setCurrentOrderType] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [deliveryData, setDeliveryDataState] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    cost: 0 
  });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [tablesData, setTablesData] = useState(tables);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [ordersMode, setOrdersMode] = useState('firestore');
  const cleanupRunRef = useRef(false); // 🚩 Flag para ejecutar limpieza UNA SOLA VEZ
  const tablesLoadedRef = useRef(false); // 🚩 Flag para cargar mesas UNA SOLA VEZ
  const ordersMapRef = useRef(new Map());
  const ordersHydratedRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const unsubscribeOrdersRef = useRef(null);
  const networkDisabledRef = useRef(false);
  const offlineActivatedRef = useRef(false);
  const isProcessingRef = useRef(false); // 🛡️ Bandera anti-reentrada en onSnapshot
  const lastProcessedDataRef = useRef(''); // 🧱 Bloquea payloads idénticos consecutivos

  // 🔒 Freno de mano: evita re-inicialización cuando otros contextos cambian
  const isInitialSyncDoneRef = useRef(false);
  // 📌 Ref sincronizada con orders para leer estado sin ponerlo en deps de useCallback
  const ordersRef = useRef([]);
  ordersRef.current = orders;

  const setIsOfflineSafe = useCallback((nextValue) => {
    setIsOffline((prev) => (prev === nextValue ? prev : nextValue));
  }, []);

  const setOrdersModeSafe = useCallback((nextValue) => {
    setOrdersMode((prev) => (prev === nextValue ? prev : nextValue));
  }, []);

  const setLoadingSafe = useCallback((nextValue) => {
    setLoading((prev) => (prev === nextValue ? prev : nextValue));
  }, []);

  const setOrdersSafe = useCallback((nextOrders) => {
    setOrders((prev) => (areOrdersEqual(prev, nextOrders) ? prev : nextOrders));
  }, []);

  useEffect(() => {
    ordersMapRef.current = new Map();
    ordersHydratedRef.current = false;
    retryCountRef.current = 0;
    networkDisabledRef.current = false;
    offlineActivatedRef.current = false;
    setIsOfflineSafe(readOfflineModeFlag(uid));
    setOrdersModeSafe(readOfflineModeFlag(uid) ? 'offline' : 'firestore');

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (unsubscribeOrdersRef.current) {
      unsubscribeOrdersRef.current();
      unsubscribeOrdersRef.current = null;
    }

    cleanupRunRef.current = false;
    tablesLoadedRef.current = false;
    isInitialSyncDoneRef.current = false;
    isProcessingRef.current = false;
    lastProcessedDataRef.current = '';
  }, [uid]);

  // 🪑 EFECTO 0: Cargar mesas desde Firestore (SE EJECUTA UNA SOLA VEZ)
  useEffect(() => {
    if (!uid || tablesLoadedRef.current) return;
    tablesLoadedRef.current = true;

    const loadTablesFromFirestore = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (userDoc.exists() && userDoc.data().tables) {
          const firestoreTables = userDoc.data().tables;
          setTablesData(firestoreTables);
        } else {
          // Guardar las mesas por defecto en Firestore
          const defaultTables = tables || [];
          if (defaultTables.length > 0) {
            try {
              await setDoc(doc(db, 'users', uid), {
                tables: defaultTables.map(t => ({
                  id: t.id,
                  number: t.number,
                  capacity: t.capacity,
                  zone: t.zone,
                  status: t.status
                }))
              }, { merge: true });
              setTablesData(defaultTables);
            } catch (err) {
              console.error('⚠️ Error guardando mesas por defecto:', err.message);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error cargando mesas:', error.message);
      }
    };

    loadTablesFromFirestore();
  }, [uid]);

  // 🧹 EFECTO 1: Limpieza de órdenes con IDs locales (SE EJECUTA UNA SOLA VEZ)
  useEffect(() => {
    if (!uid || cleanupRunRef.current) return;
    cleanupRunRef.current = true; // Marcar como ejecutado

    const cleanupOnStartup = async () => {
      try {
        // Limpiar SOLO órdenes completadas en Firestore (no tocar localStorage)
        const q2 = query(
          collection(db, `users/${uid}/orders`),
          where('status', '==', 'completed')
        );
        
        const snapshot2 = await getDocs(q2);
        
        for (const docItem of snapshot2.docs) {
          try {
            await deleteDoc(docItem.ref);
          } catch (err) {
            // ignorar errores individuales
          }
        }
      } catch (error) {
        // limpieza no crítica — ignorar
      }
    };

    cleanupOnStartup();
  }, [uid]);

  // 🔄 EFECTO 2: Listener real-time (carga y observa órdenes válidas)
  // 🔄 EFECTO 2: Listener real-time (carga y observa órdenes válidas)
  useEffect(() => {
    if (!uid) {
      setOrdersSafe([]);
      setLoadingSafe(false);
      setIsOfflineSafe(readOfflineModeFlag(uid));
      setOrdersModeSafe(readOfflineModeFlag(uid) ? 'offline' : 'firestore');
      ordersMapRef.current = new Map();
      ordersHydratedRef.current = false;

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (unsubscribeOrdersRef.current) {
        unsubscribeOrdersRef.current();
        unsubscribeOrdersRef.current = null;
      }

      return;
    }

    setLoadingSafe(true);
    const offlinePersisted = readOfflineModeFlag(uid);
    setIsOfflineSafe(offlinePersisted);
    setOrdersModeSafe(offlinePersisted ? 'offline' : 'firestore');

    const fallbackToLocalMode = () => {
      const cachedOrders = readOrdersFromCache(uid).filter(
        (order) => !String(order?.id || '').startsWith('offline_')
      );

      const safeOrders = cachedOrders.length
        ? cachedOrders
        : (mockOrders || []).map((order, idx) => ({
            id: `offline_fallback_${Date.now()}_${idx}`,
            ...order,
            status: normalizeOrderStatus(order.status) || 'pending',
          }));

      const normalized = safeOrders
        .filter((order) => order?.type && ACTIVE_ORDER_STATUSES.includes(normalizeOrderStatus(order.status)))
        .map((order) => ({ ...order, status: normalizeOrderStatus(order.status) }))
        .sort((a, b) => {
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        });

      setOrdersModeSafe('offline');
      setIsOfflineSafe(true);
      setOrdersSafe(normalized);
      setLoadingSafe(false);
      ordersHydratedRef.current = true;
    };

    const activateOfflineMode = (reason) => {
      if (offlineActivatedRef.current) return;
      offlineActivatedRef.current = true;
      console.warn(`⚠️ Activando Modo Offline persistente: ${reason}`);
      writeOfflineModeFlag(uid, true);

      if (!networkDisabledRef.current) {
        networkDisabledRef.current = true;
        disableNetwork(db).catch(() => {
          // ignore network shutdown errors
        });
      }

      window.dispatchEvent(
        new CustomEvent('push-message', {
          detail: {
            type: 'warning',
            message: 'Modo offline activado por cuota/timeout de Firebase. Se desactivaron servicios de red.'
          }
        })
      );

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (unsubscribeOrdersRef.current) {
        unsubscribeOrdersRef.current();
        unsubscribeOrdersRef.current = null;
      }

      setTimeout(() => {
        fallbackToLocalMode();
      }, 0);
    };

    const isForceLocal = (() => {
      try { return localStorage.getItem('fodexa_force_local') === 'true'; } catch { return false; }
    })();
    const isLocalUid = uid === 'LOCAL_USER';

    if (offlinePersisted || isForceLocal || isLocalUid) {
      activateOfflineMode(
        isLocalUid
          ? 'uid local sin autenticación de Firebase'
          : (isForceLocal ? 'modo local forzado por usuario' : 'flag persistente en almacenamiento local')
      );
      return () => {};
    }

    const connectOrdersListener = () => {
      if (!uid) return () => {};

      if (unsubscribeOrdersRef.current) {
        unsubscribeOrdersRef.current();
        unsubscribeOrdersRef.current = null;
      }

      const q = query(
        collection(db, `users/${uid}/orders`),
        orderBy('timestamp', 'desc')
      );

      try {
        unsubscribeOrdersRef.current = onSnapshot(
          q,
          (snapshot) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;

          try {
            retryCountRef.current = 0;
            offlineActivatedRef.current = false;
            setIsOfflineSafe(false);
            setOrdersModeSafe('firestore');
            writeOfflineModeFlag(uid, false);

            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = null;
            }

            const nextMap = new Map(ordersMapRef.current);

            snapshot.docChanges().forEach((change) => {
              const docId = change.doc.id;

              if (change.type === 'removed') {
                nextMap.delete(docId);
                return;
              }

              const sanitized = sanitizeOrderFromDoc(change.doc);
              if (!sanitized) {
                nextMap.delete(docId);
                return;
              }

              if (sanitized.clientTempId && String(sanitized.clientTempId).startsWith('offline_')) {
                nextMap.delete(String(sanitized.clientTempId));
              }

              nextMap.set(docId, sanitized);
            });

            ordersMapRef.current = nextMap;
            ordersHydratedRef.current = true;
            isInitialSyncDoneRef.current = true; // 🔒 Inicialización completada

            const activeOrders = Array.from(nextMap.values()).sort((a, b) => {
              const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
              const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
              return bTime - aTime;
            });

            if (
              ordersRef.current.length === activeOrders.length &&
              areOrdersEqual(ordersRef.current, activeOrders)
            ) {
              setLoadingSafe(false);
              return;
            }

            const activeOrdersStr = JSON.stringify(activeOrders);
            if (
              lastProcessedDataRef.current === activeOrdersStr ||
              JSON.stringify(ordersRef.current) === activeOrdersStr
            ) {
              setLoadingSafe(false);
              return;
            }

            lastProcessedDataRef.current = activeOrdersStr;
            setOrdersSafe(activeOrders);
            writeOrdersToCache(uid, activeOrders);
            setLoadingSafe(false);
          } finally {
            isProcessingRef.current = false;
          }
          },
          (error) => {
          isProcessingRef.current = false;
          if (isQuotaOrTimeoutFirestoreError(error)) {
            activateOfflineMode(`error fatal Firestore: ${error?.code || error?.message || 'desconocido'}`);
            return;
          }

          retryCountRef.current += 1;
          const currentAttempt = retryCountRef.current;

          console.warn(`⚠️ Error al cargar órdenes (intento ${currentAttempt}/${MAX_FIRESTORE_RETRIES}):`, error.message);

          if (currentAttempt >= MAX_FIRESTORE_RETRIES) {
            console.warn('⚠️ Firestore no responde tras 3 intentos. Activando Modo Local.');
            if (unsubscribeOrdersRef.current) {
              unsubscribeOrdersRef.current();
              unsubscribeOrdersRef.current = null;
            }
            fallbackToLocalMode();
            return;
          }

          if (unsubscribeOrdersRef.current) {
            unsubscribeOrdersRef.current();
            unsubscribeOrdersRef.current = null;
          }

          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          const delay = FIRESTORE_RETRY_DELAY_MS * currentAttempt;
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            connectOrdersListener();
          }, delay);
          }
        );
      } catch (listenerSetupError) {
        if (isQuotaOrTimeoutFirestoreError(listenerSetupError)) {
          activateOfflineMode(`error fatal al iniciar listener: ${listenerSetupError?.code || listenerSetupError?.message || 'desconocido'}`);
          return () => {};
        }

        throw listenerSetupError;
      }

      return () => {
        if (unsubscribeOrdersRef.current) {
          unsubscribeOrdersRef.current();
          unsubscribeOrdersRef.current = null;
        }
      };
    };

    const unsubscribe = connectOrdersListener();
    const offlineFailoverTimer = setTimeout(() => {
      if (!ordersHydratedRef.current && !readOfflineModeFlag(uid)) {
        activateOfflineMode('sin respuesta de Firestore en 3 segundos');
      }
    }, 3000);

    return () => {
      clearTimeout(offlineFailoverTimer);

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      unsubscribe();
    };
  }, [uid]);

  // Función para establecer tipo de orden
  const setOrderType = useCallback((type) => {
    setCurrentOrderType(type);
  }, []);

  // Función para seleccionar mesa
  const selectTable = useCallback((tableId) => {
    setSelectedTable(tableId);
  }, []);

  // Función para actualizar datos de domicilio
  const setDeliveryData = useCallback((data) => {
    setDeliveryDataState(prev => ({ ...prev, ...data }));
  }, []);

  // 🧹 LIMPIAR órdenes completadas antiguamente (fantasmas que bloquean mesas)
  const cleanupGhostOrders = useCallback(async () => {
    if (!uid) return;
    
    try {
      const q = query(
        collection(db, `users/${uid}/orders`),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        try {
          // Eliminar órdenes completadas (que ya no bloquean nada)
          await deleteDoc(doc.ref);
          deletedCount++;
        } catch (error) {
          console.warn(`  ⚠️ Error eliminando ${doc.id}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error en limpieza de fantasmas:', error.message);
    }
  }, [uid]);

  // Filtra pedidos por tipo
  const getOrdersByType = useCallback((type) => orders.filter(order => order.type === type), [orders]);

  // Crea un nuevo pedido en Firestore y actualiza estado local
  const createOrder = useCallback(async (data) => {
    if (!user) {
      console.warn('⚠️ Sin usuario autenticado - usando dados locales');
    }
    try {
      if (user?.uid && !ordersHydratedRef.current) {
        throw new Error('Sincronizando órdenes desde Firestore. Intenta en 1 segundo.');
      }

      
      // 1️⃣ Recalcular totales primero
      const itemsWithAddons = data.items.map(item => {
        const addonsTotal = item.addons?.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0) || 0;
        return {
          ...item,
          itemTotal: (parseFloat(item.price) || 0) * (item.quantity || 1) + addonsTotal,
        };
      });
      
      const subtotal = itemsWithAddons.reduce((sum, item) => sum + item.itemTotal, 0);
      const iva = data.taxesConfig?.enabled ? subtotal * (parseFloat(data.taxesConfig?.value || 0) / 100) : 0;
      const deliveryCost = data.type === 'delivery' ? (parseFloat(data.deliveryData?.cost) || 0) : 0;
      const total = subtotal + iva + deliveryCost;
      
      // 2️⃣ Crear objeto con todas las propiedades calculadas
      const orderData = {
        ...data,
        userId: user?.uid || 'anonymous',
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(),
        items: itemsWithAddons,
        subtotal,
        iva,
        deliveryCost,
        total,
      };
      
      // 3️⃣ ✅ GUARDAR EN FIRESTORE (REQUERIDO si está autenticado)
      let finalOrderId;
      let finalOrderData;

      if (ordersMode === 'offline') {
        finalOrderId = `offline_${Date.now()}`;
        finalOrderData = {
          id: finalOrderId,
          ...orderData,
          syncStatus: 'local'
        };

        console.log('Acción local ejecutada');
        setOrders((prev) => {
          const updated = [finalOrderData, ...prev];
          writeOrdersToCache(user?.uid, updated);
          return updated;
        });

        return finalOrderData;
      }
      
      if (user?.uid) {
        // Usuario autenticado - DEBE guardar en Firestore, NO hay fallback a local
        try {
          const docRef = await withFirestoreTimeout(
            addDoc(collection(db, `users/${user.uid}/orders`), {
              ...orderData,
            })
          );
          finalOrderId = docRef.id;
          finalOrderData = { id: finalOrderId, ...orderData };
        } catch (firestoreError) {
          if (isQuotaOrTimeoutFirestoreError(firestoreError)) {
            writeOfflineModeFlag(user.uid, true);
            setOrdersModeSafe('offline');

            finalOrderId = `offline_${Date.now()}`;
            finalOrderData = {
              id: finalOrderId,
              ...orderData,
              syncStatus: 'local'
            };

            setOrders((prev) => {
              const updated = [finalOrderData, ...prev];
              if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
              writeOrdersToCache(user?.uid, updated);
              return updated;
            });

            return finalOrderData;
          }

          console.error('❌ [CREAR] FALLÓ guardar en Firestore - NO se puede proceder');
          console.error('   Error:', firestoreError.message);
          console.error('   Code:', firestoreError.code);
          // Relanzar el error - no hay fallback
          throw new Error(`No se pudo guardar la orden en Firestore: ${firestoreError.message}`);
        }
      } else {
        // Sin usuario - usar ID local (esto no debe pasar normalmente)
        console.warn('⚠️ Sin usuario autenticado - usando ID local');
        finalOrderId = `offline_${Date.now()}`;
        finalOrderData = { id: finalOrderId, ...orderData };
      }
      
      // 🚫 NO AÑADIR AL ESTADO LOCAL - Dejar que onSnapshot (listener) lo haga automáticamente
      // Esto previene duplicados. Firestore es la única fuente de verdad.
      
      return finalOrderData;
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      throw error;
    }
  }, [ordersMode, setOrdersModeSafe, user, uid]);

  // Actualiza un pedido existente y actualiza estado local
  const updateOrder = useCallback(async (id, data) => {
    
    try {
      // ⚠️ Solo actualizar en Firestore
      // Dejar que onSnapshot sincronice el estado automáticamente
      const orderBefore = ordersRef.current.find(o => o.id === id); // Lee ordersRef en vez de orders (evita dep inestable)
      
      if (!orderBefore) {
        console.warn(`⚠️ Orden ${id} no está en estado local, pero procederemos con Firestore`);
      }
      
      if (ordersMode === 'offline') {
        setOrders((prev) => {
          const updated = prev.map((order) =>
            order.id === id ? { ...order, ...data, updatedAt: new Date(), syncStatus: 'local' } : order
          );
          if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
          writeOrdersToCache(uid, updated);
          return updated;
        });
        return;
      }

      if (!user?.uid) {
        console.error('❌ SIN USUARIO AUTENTICADO - No se puede guardar en Firestore');
        throw new Error('Usuario no autenticado');
      }

      // ✅ ID real de Firestore - ACTUALIZAR directamente
      if (id.startsWith('offline_')) {
        setOrders((prev) => {
          const updated = prev.map((order) =>
            order.id === id ? { ...order, ...data, updatedAt: new Date(), syncStatus: 'local' } : order
          );
          if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
          writeOrdersToCache(uid, updated);
          return updated;
        });
        return;
      }

        try {
          const orderRef = doc(db, `users/${user.uid}/orders`, id);

          await withFirestoreTimeout(
            updateDoc(orderRef, {
              ...data,
              updatedAt: new Date(),
            })
          );
        } catch (error) {
          if (isQuotaOrTimeoutFirestoreError(error)) {
            writeOfflineModeFlag(user.uid, true);
            setOrdersModeSafe('offline');
            setOrders((prev) => {
              const updated = prev.map((order) =>
                order.id === id ? { ...order, ...data, updatedAt: new Date(), syncStatus: 'local' } : order
              );
              if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
              writeOrdersToCache(uid, updated);
              return updated;
            });
            return;
          }

          console.error('❌ ERROR AL ACTUALIZAR EN FIRESTORE');
          console.error('   Código:', error.code);
          console.error('   Mensaje:', error.message);
          
          // Detalles específicos del error
          if (error.code === 'permission-denied') {
            console.error('   ⚠️ PROBLEMA DE PERMISOS - Revisar Firestore Rules');
          } else if (error.code === 'not-found') {
            console.error('   ⚠️ DOCUMENTO NO ENCONTRADO - El ID puede ser incorrecto');
          }
          
          console.error('   Stack:', error.stack);
          throw error; // ← Propagar el error
        }
      
      // ✅ Disparar evento para actualizar timestamp después de actualizar exitosamente
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { orderId: id, data } 
      }));
    } catch (error) {
      console.error('❌ Error en updateOrder - No se completó la actualización');
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      throw error;
    }
  }, [ordersMode, setOrdersModeSafe, uid, user]); // orders eliminado de deps → se lee via ordersRef

  // Elimina un pedido directamente de Firestore (no solo marcar como completada)
  const deleteOrder = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (ordersMode === 'offline') {
        setOrders((prev) => {
          const updated = prev.filter((order) => order.id !== id);
          if (updated.length === prev.length) return prev;
          writeOrdersToCache(uid, updated);
          return updated;
        });
        return;
      }

      // Verificar si es un ID de Firestore (no local)
      if (!id.startsWith('offline_')) {
        // Orden está en Firestore - ELIMINARLA directamente
        await deleteDoc(doc(db, `users/${user.uid}/orders`, id));
      }
      
      // Remover del estado local (sea local o Firestore)
      setOrders(prev => {
        const updated = prev.filter(order => order.id !== id);
        if (updated.length === prev.length) return prev;
        writeOrdersToCache(uid, updated);
        return updated;
      });
    } catch (error) {
      console.error('❌ Error eliminando orden:', error.message);
      throw error;
    }
  }, [ordersMode, uid, user]);

  // Actualiza estado de mesa
  const updateTableStatus = useCallback((tableId, status) => {
    setTablesData(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  }, []);

  // ✅ LIMPIEZA AUTOMÁTICA: Borrar órdenes completadas
  // Con el cambio reciente, deleteOrder() ahora elimina completamente en lugar de marcar como completado
  // Este cleanup es para limpiar cualquier orden completada que pudiera quedar por errores
  const cleanupCompletedOrders = useCallback(async () => {
    if (!uid) return;
    
    try {
      // Buscar TODAS las órdenes completadas (sin importar antigüedad)
      const q = query(
        collection(db, `users/${uid}/orders`),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        try {
          await deleteDoc(doc.ref);
          deletedCount++;
        } catch (error) {
          console.warn(`⚠️ Error eliminando orden completada ${doc.id}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error en limpieza automática:', error.message);
    }
  }, [uid]);
  
  // Ejecutar limpieza cada 5 minutos cuando hay usuario autenticado
  useEffect(() => {
    if (!uid) return;
    
    const cleanupInterval = setInterval(() => {
      cleanupCompletedOrders();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(cleanupInterval);
  }, [uid, cleanupCompletedOrders]);

  // Limpia orden actual
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
    setCurrentOrderType(null);
    setSelectedTable(null);
    setDeliveryDataState({ name: '', phone: '', address: '', cost: 0 });
  }, []);

  // Calcula el total de una orden
  const calculateOrderTotal = useCallback((order) => {
    if (!order.items) return 0;
    return order.items.reduce((sum, item) => {
      const addonsTotal = Array.isArray(item.addons)
        ? item.addons.reduce((aSum, addon) => aSum + (parseFloat(addon.price) || 0), 0) * (item.quantity || 1)
        : 0;
      return sum + (parseFloat(item.price) || 0) * (item.quantity || 1) + addonsTotal;
    }, 0);
  }, []);

  // 🗑️ LIMPIAR TODAS LAS ÓRDENES DE FIRESTORE
  const clearAllOrders = useCallback(async () => {
    if (!uid) {
      console.error('❌ No hay usuario autenticado');
      return false;
    }
    
    try {
      // Obtener todos los documentos de órdenes
      const q = query(collection(db, `users/${uid}/orders`));
      const snapshot = await getDocs(q);

      // Borrar cada orden
      let deletedCount = 0;
      for (const doc of snapshot.docs) {
        try {
          await deleteDoc(doc.ref);
          deletedCount++;
        } catch (error) {
          console.error(`❌ Error eliminando ${doc.id}:`, error.message);
        }
      }

      // Limpiar estado local
      setOrders([]);
      setCurrentOrder(null);
      return true;
    } catch (error) {
      console.error('❌ Error en clearAllOrders:', error);
      return false;
    }
  }, [uid]);

  // 🪑 FUNCIONES DE MESAS
  const createTable = useCallback(async (tableData) => {
    try {
      const newTable = {
        id: Math.max(...tablesData.map(t => t.id), 0) + 1,
        ...tableData,
        status: 'available'
      };
      
      const updated = [...tablesData, newTable];
      setTablesData(updated);
      
      // Guardar en Firestore usando setDoc con merge
      if (uid) {
        try {
          await setDoc(doc(db, 'users', uid), {
            tables: updated.map(t => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              zone: t.zone,
              status: t.status
            }))
          }, { merge: true });
        } catch (err) {
          console.warn('⚠️ Error guardando mesas en Firestore:', err.message);
        }
      }
      
      return newTable;
    } catch (error) {
      console.error('❌ Error creando mesa:', error.message);
      throw error;
    }
  }, [tablesData, uid]);

  const updateTable = useCallback(async (id, tableData) => {
    try {
      const updated = tablesData.map(t => 
        t.id === id ? { ...t, ...tableData } : t
      );
      setTablesData(updated);
      
      // Guardar en Firestore usando setDoc con merge
      if (uid) {
        try {
          await setDoc(doc(db, 'users', uid), {
            tables: updated.map(t => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              zone: t.zone,
              status: t.status
            }))
          }, { merge: true });
        } catch (err) {
          console.warn('⚠️ Error actualizando mesas en Firestore:', err.message);
        }
      }
      
      return updated.find(t => t.id === id);
    } catch (error) {
      console.error('❌ Error actualizando mesa:', error.message);
      throw error;
    }
  }, [tablesData, uid]);

  const deleteTable = useCallback(async (id) => {
    try {
      const updated = tablesData.filter(t => t.id !== id);
      setTablesData(updated);
      
      // Guardar en Firestore usando setDoc con merge
      if (uid) {
        try {
          await setDoc(doc(db, 'users', uid), {
            tables: updated.map(t => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              zone: t.zone,
              status: t.status
            }))
          }, { merge: true });
        } catch (err) {
          console.warn('⚠️ Error eliminando mesa en Firestore:', err.message);
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando mesa:', error.message);
      throw error;
    }
  }, [tablesData, uid]);

  const value = useMemo(() => ({
    orders,
    setOrders,
    currentOrder,
    setCurrentOrder,
    currentOrderType,
    selectedTable,
    deliveryData,
    loading,
    isOffline,
    ordersMode,
    setOrderType,
    selectTable,
    setDeliveryData,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByType,
    updateTableStatus,
    clearCurrentOrder,
    calculateOrderTotal,
    clearAllOrders,
    cleanupGhostOrders,
    tables: tablesData,
    createTable,
    updateTable,
    deleteTable,
  }), [
    orders,
    currentOrder,
    currentOrderType,
    selectedTable,
    deliveryData,
    loading,
    isOffline,
    ordersMode,
    setOrderType,
    selectTable,
    setDeliveryData,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByType,
    updateTableStatus,
    clearCurrentOrder,
    calculateOrderTotal,
    clearAllOrders,
    cleanupGhostOrders,
    tablesData,
    createTable,
    updateTable,
    deleteTable,
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder debe usarse dentro de OrderProvider');
  }
  return context;
};
