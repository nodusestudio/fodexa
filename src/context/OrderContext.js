import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import tables from '../data/tables'; // MESA 7 ENABLED v36.0.1
import { mockOrders } from '../data/mockFirebaseData';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
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
  const cleanupRunRef = useRef(false); // 🚩 Flag para ejecutar limpieza UNA SOLA VEZ
  const tablesLoadedRef = useRef(false); // 🚩 Flag para cargar mesas UNA SOLA VEZ

  // 🪑 EFECTO 0: Cargar mesas desde Firestore (SE EJECUTA UNA SOLA VEZ)
  useEffect(() => {
    if (!user || tablesLoadedRef.current) return;
    tablesLoadedRef.current = true;

    const loadTablesFromFirestore = async () => {
      try {
        console.log('🪑 [STARTUP] Cargando mesas desde Firestore...');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists() && userDoc.data().tables) {
          const firestoreTables = userDoc.data().tables;
          console.log(`✅ Mesas cargadas desde Firestore: ${firestoreTables.length}`);
          setTablesData(firestoreTables);
        } else {
          console.log('📭 No hay mesas en Firestore, usando mesas por defecto');
          // Guardar las mesas por defecto en Firestore
          const defaultTables = tables || [];
          if (defaultTables.length > 0) {
            try {
              await setDoc(doc(db, 'users', user.uid), {
                tables: defaultTables.map(t => ({
                  id: t.id,
                  number: t.number,
                  capacity: t.capacity,
                  zone: t.zone,
                  status: t.status
                }))
              }, { merge: true });
              console.log('✅ Mesas por defecto guardadas en Firestore');
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
  }, [user]);

  // 🧹 EFECTO 1: Limpieza de órdenes con IDs locales (SE EJECUTA UNA SOLA VEZ)
  useEffect(() => {
    if (!user || cleanupRunRef.current) return;
    cleanupRunRef.current = true; // Marcar como ejecutado

    const cleanupOnStartup = async () => {
      try {
        // 1️⃣ LIMPIAR: Órdenes con IDs locales
        console.log('🧹 [STARTUP] Limpieza de órdenes con IDs locales...');
        const allOrdersSnapshot = await getDocs(collection(db, `users/${user.uid}/orders`));
        const localOrders = allOrdersSnapshot.docs.filter(d => d.id.startsWith('local_'));
        
        console.log(`🔍 Encontradas ${localOrders.length} órdenes con IDs locales`);
        
        let deletedCount = 0;
        for (const doc of localOrders) {
          try {
            await deleteDoc(doc.ref);
            deletedCount++;
            console.log(`  ✅ Eliminada: ${doc.id}`);
          } catch (err) {
            console.error(`  ❌ Error eliminando ${doc.id}:`, err.message);
          }
        }
        
        if (deletedCount > 0) {
          console.log(`✅ Limpieza 1: ${deletedCount} órdenes con IDs locales eliminadas`);
        }

        // 2️⃣ LIMPIAR: Órdenes completadas (del código anterior que las marcaba en lugar de eliminarlas)
        console.log('🧹 [STARTUP] Limpieza de órdenes completadas antiguas...');
        const q2 = query(
          collection(db, `users/${user.uid}/orders`),
          where('status', '==', 'completed')
        );
        
        const snapshot2 = await getDocs(q2);
        console.log(`🔍 Encontradas ${snapshot2.docs.length} órdenes completadas`);
        
        let completedCount = 0;
        for (const doc of snapshot2.docs) {
          try {
            await deleteDoc(doc.ref);
            completedCount++;
            console.log(`  ✅ Eliminada completada: ${doc.id.substring(0, 8)}...`);
          } catch (err) {
            console.error(`  ❌ Error eliminando ${doc.id}:`, err.message);
          }
        }
        
        if (completedCount > 0) {
          console.log(`✅ Limpieza 2: ${completedCount} órdenes completadas eliminadas`);
        }
      } catch (error) {
        console.warn('⚠️ Error en limpieza inicial:', error.message);
      }
    };

    cleanupOnStartup();
  }, [user]);

  // 🔄 EFECTO 2: Listener real-time (carga y observa órdenes válidas)
  // 🔄 EFECTO 2: Listener real-time (carga y observa órdenes válidas)
  useEffect(() => {
    if (!user) {
      console.log('❌ Sin usuario, limpiando órdenes');
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('👤 Usuario detectado:', user.uid);
    setLoading(true);

    // Escuchar órdenes del usuario desde Firestore
    const q = query(
      collection(db, `users/${user.uid}/orders`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allOrdersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || data.timestamp,
          };
        });
        
        console.log('🔄 [FIRESTORE] Órdenes cargadas:', allOrdersData.length);
        allOrdersData.forEach((o, idx) => {
          console.log(`  [${idx}] ID=${o.id.substring(0,8)}... type=${o.type} status=${o.status}`);
        });
        
        // ✅ FILTRADO: Solo status válidos (las órdenes locales serán eliminadas por el efecto de limpieza)
        const validStatuses = ['pending', 'waiting', 'preparing'];
        
        const activeOrders = allOrdersData.filter(order => {
          // Excluir órdenes con IDs locales de la vista (deberían estar siendo eliminadas)
          if (order.id.startsWith('local_')) {
            console.warn(`  ⚠️ AÚN EXISTE orden local en Firestore: ${order.id}`);
            return false;
          }
          
          const isActive = order.status && validStatuses.includes(order.status);
          
          if (!isActive) {
            const reason = !order.status ? 'sin status' : `status="${order.status}" (inválido)`;
            console.log(`  🚫 EXCLUIDA: ${order.id.substring(0,8)}... (${reason})`);
          }
          
          return isActive;
        });
        
        console.log(`✅ [RESULTADO] ${activeOrders.length} órdenes válidas de ${allOrdersData.length} totales`);
        setOrders(activeOrders);
        setLoading(false);
      },
      (error) => {
        console.warn('⚠️ Error al cargar órdenes:', error.message);
        setOrders([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Función para establecer tipo de orden
  const setOrderType = (type) => {
    setCurrentOrderType(type);
  };

  // Función para seleccionar mesa
  const selectTable = (tableId) => {
    setSelectedTable(tableId);
  };

  // Función para actualizar datos de domicilio
  const setDeliveryData = (data) => {
    setDeliveryDataState(prev => ({ ...prev, ...data }));
  };

  // 🧹 LIMPIAR órdenes completadas antiguamente (fantasmas que bloquean mesas)
  const cleanupGhostOrders = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('🧹 Ejecutando limpieza de órdenes fantasma...');
      const q = query(
        collection(db, `users/${user.uid}/orders`),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        try {
          // Eliminar órdenes completadas (que ya no bloquean nada)
          await deleteDoc(doc.ref);
          deletedCount++;
          console.log(`  🗑️ Eliminada orden completada: ${doc.id.substring(0,8)}...`);
        } catch (error) {
          console.warn(`  ⚠️ Error eliminando ${doc.id}:`, error.message);
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ Limpieza completada: ${deletedCount} órdenes eliminadas`);
      }
    } catch (error) {
      console.warn('⚠️ Error en limpieza de fantasmas:', error.message);
    }
  };

  // Filtra pedidos por tipo
  const getOrdersByType = (type) => orders.filter(order => order.type === type);

  // Crea un nuevo pedido en Firestore y actualiza estado local
  const createOrder = async (data) => {
    if (!user) {
      console.warn('⚠️ Sin usuario autenticado - usando dados locales');
    }
    try {
      console.log('📝 createOrder llamado con:', data);
      
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
      
      if (user?.uid) {
        // Usuario autenticado - DEBE guardar en Firestore, NO hay fallback a local
        try {
          console.log('🔥 [CREAR] Guardando orden en Firestore (usuario autenticado)...');
          const docRef = await addDoc(collection(db, `users/${user.uid}/orders`), {
            ...orderData,
          });
          finalOrderId = docRef.id;
          finalOrderData = { id: finalOrderId, ...orderData };
          console.log('✅ [CREAR] Orden guardada en Firestore:', finalOrderId);
        } catch (firestoreError) {
          console.error('❌ [CREAR] FALLÓ guardar en Firestore - NO se puede proceder');
          console.error('   Error:', firestoreError.message);
          console.error('   Code:', firestoreError.code);
          // Relanzar el error - no hay fallback
          throw new Error(`No se pudo guardar la orden en Firestore: ${firestoreError.message}`);
        }
      } else {
        // Sin usuario - usar ID local (esto no debe pasar normalmente)
        console.warn('⚠️ Sin usuario autenticado - usando ID local');
        finalOrderId = `local_${Date.now()}`;
        finalOrderData = { id: finalOrderId, ...orderData };
      }
      
      // 🚫 NO AÑADIR AL ESTADO LOCAL - Dejar que onSnapshot (listener) lo haga automáticamente
      // Esto previene duplicados. Firestore es la única fuente de verdad.
      console.log('✅ [CREAR] Orden guardada. onSnapshot la traerá automáticamente.');
      
      return finalOrderData;
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      throw error;
    }
  };

  // Actualiza un pedido existente y actualiza estado local
  const updateOrder = async (id, data) => {
    console.group(`🔄 [UPDATE] Iniciando actualización de orden: ${id}`);
    console.log('  Datos a actualizar:', data);
    console.log('  Usuario UID:', user?.uid || '❌ NO AUTENTICADO');
    
    try {
      // ⚠️ Solo actualizar en Firestore
      // Dejar que onSnapshot sincronice el estado automáticamente
      const orderBefore = orders.find(o => o.id === id);
      
      if (!orderBefore) {
        console.warn(`⚠️ Orden ${id} no está en estado local, pero procederemos con Firestore`);
      }
      
      if (!user?.uid) {
        console.error('❌ SIN USUARIO AUTENTICADO - No se puede guardar en Firestore');
        console.groupEnd();
        throw new Error('Usuario no autenticado');
      }

      // ✅ CASO 1: ID local - MIGRAR A FIRESTORE con los datos actualizados
      if (id.startsWith('local_')) {
        console.log(`  2️⃣ ID LOCAL DETECTADO: ${id}`);
        console.log('     Migrando a Firestore con status:', data.status);
        
        const orderToMigrate = orders.find(o => o.id === id);
        if (!orderToMigrate) {
          console.error('❌ Orden local no encontrada en estado');
          console.groupEnd();
          throw new Error('Orden local no encontrada');
        }

        try {
          console.log('     📤 Guardando en Firestore...');
          const newDocRef = await addDoc(collection(db, `users/${user.uid}/orders`), {
            ...orderToMigrate,
            ...data, // ← Incluir el status actualizado
            localId: id,
            createdAt: orderToMigrate.timestamp || new Date(),
          });
          
          const newId = newDocRef.id;
          console.log(`     ✅ Guardado en Firestore ID: ${newId}`);
          console.log(`     Status en Firestore: ${data.status}`);
          
          // 🚫 NO actualizar estado local - onSnapshot lo hará automáticamente
          // Eliminar la orden local del estado
          setOrders(prev => prev.filter(o => o.id !== id));
          console.log('     ✅ Orden local eliminada del estado');
        } catch (migrateError) {
          console.error('❌ Error al migrar orden:', migrateError.code);
          console.error('   Mensaje:', migrateError.message);
          console.error('   Stack:', migrateError.stack);
          throw migrateError; // ← Propagar el error
        }
      } 
      // ✅ CASO 2: ID real de Firestore - ACTUALIZAR directamente
      else {
        console.log(`  2️⃣ ID FIREBASE DETECTADO`);
        console.log('     Ruta: users/${user.uid}/orders/${id}');
        console.log('     Actualizando documento en Firestore...');
        
        try {
          const orderRef = doc(db, `users/${user.uid}/orders`, id);
          console.log('     Llamando updateDoc...');
          
          await updateDoc(orderRef, {
            ...data,
            updatedAt: new Date(),
          });
          
          console.log(`     ✅ Actualizado en Firestore CON ÉXITO`);
          console.log(`     Nuevo status: ${data.status}`);
          console.log('     onSnapshot sincronizará el estado automáticamente');
        } catch (error) {
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
    } finally {
      console.groupEnd();
    }
  };

  // Elimina un pedido directamente de Firestore (no solo marcar como completada)
  const deleteOrder = async (id) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Verificar si es un ID de Firestore (no local)
      if (!id.startsWith('local_')) {
        // Orden está en Firestore - ELIMINARLA directamente
        console.log('🗑️ Eliminando orden de Firestore:', id);
        await deleteDoc(doc(db, `users/${user.uid}/orders`, id));
        console.log('✅ Orden eliminada de Firestore');
      }
      
      // Remover del estado local (sea local o Firestore)
      setOrders(prev => prev.filter(order => order.id !== id));
      console.log('✅ Orden removida del estado local:', id);
    } catch (error) {
      console.error('❌ Error eliminando orden:', error.message);
      throw error;
    }
  };

  // Actualiza estado de mesa
  const updateTableStatus = (tableId, status) => {
    setTablesData(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  };

  // ✅ LIMPIEZA AUTOMÁTICA: Borrar órdenes completadas
  // Con el cambio reciente, deleteOrder() ahora elimina completamente en lugar de marcar como completado
  // Este cleanup es para limpiar cualquier orden completada que pudiera quedar por errores
  const cleanupCompletedOrders = async () => {
    if (!user?.uid) return;
    
    try {
      // Buscar TODAS las órdenes completadas (sin importar antigüedad)
      const q = query(
        collection(db, `users/${user.uid}/orders`),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        try {
          await deleteDoc(doc.ref);
          deletedCount++;
          console.log(`🗑️ Orden completada eliminada: ${doc.id.substring(0, 8)}...`);
        } catch (error) {
          console.warn(`⚠️ Error eliminando orden completada ${doc.id}:`, error.message);
        }
      }
      
      if (deletedCount > 0) {
        console.log(`🧹 Limpieza automática: ${deletedCount} órdenes completadas eliminadas`);
      }
    } catch (error) {
      console.warn('⚠️ Error en limpieza automática:', error.message);
    }
  };
  
  // Ejecutar limpieza cada 5 minutos cuando hay usuario autenticado
  useEffect(() => {
    if (!user?.uid) return;
    
    const cleanupInterval = setInterval(() => {
      cleanupCompletedOrders();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(cleanupInterval);
  }, [user?.uid]);

  // Limpia orden actual
  const clearCurrentOrder = () => {
    setCurrentOrder(null);
    setCurrentOrderType(null);
    setSelectedTable(null);
    setDeliveryDataState({ name: '', phone: '', address: '', cost: 0 });
  };

  // Calcula el total de una orden
  const calculateOrderTotal = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((sum, item) => {
      const addonsTotal = Array.isArray(item.addons)
        ? item.addons.reduce((aSum, addon) => aSum + (parseFloat(addon.price) || 0), 0) * (item.quantity || 1)
        : 0;
      return sum + (parseFloat(item.price) || 0) * (item.quantity || 1) + addonsTotal;
    }, 0);
  };

  // 🗑️ LIMPIAR TODAS LAS ÓRDENES DE FIRESTORE
  const clearAllOrders = async () => {
    if (!user?.uid) {
      console.error('❌ No hay usuario autenticado');
      return false;
    }

    console.log('🗑️ Iniciando limpieza de TODAS las órdenes...');
    
    try {
      // Obtener todos los documentos de órdenes
      const q = query(collection(db, `users/${user.uid}/orders`));
      const snapshot = await getDocs(q);

      console.log(`📊 Total de órdenes encontradas: ${snapshot.docs.length}`);

      // Borrar cada orden
      let deletedCount = 0;
      for (const doc of snapshot.docs) {
        try {
          await deleteDoc(doc.ref);
          deletedCount++;
          console.log(`✂️ Eliminada orden: ${doc.id}`);
        } catch (error) {
          console.error(`❌ Error eliminando ${doc.id}:`, error.message);
        }
      }

      // Limpiar estado local
      setOrders([]);
      setCurrentOrder(null);

      console.log(`✅ Limpeza completada: ${deletedCount} órdenes eliminadas`);
      return true;
    } catch (error) {
      console.error('❌ Error en clearAllOrders:', error);
      return false;
    }
  };

  // 🪑 FUNCIONES DE MESAS
  const createTable = async (tableData) => {
    try {
      const newTable = {
        id: Math.max(...tablesData.map(t => t.id), 0) + 1,
        ...tableData,
        status: 'available'
      };
      
      const updated = [...tablesData, newTable];
      setTablesData(updated);
      
      // Guardar en Firestore usando setDoc con merge
      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            tables: updated.map(t => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              zone: t.zone,
              status: t.status
            }))
          }, { merge: true });
          console.log('✅ Mesas guardadas en Firestore');
        } catch (err) {
          console.warn('⚠️ Error guardando mesas en Firestore:', err.message);
        }
      }
      
      return newTable;
    } catch (error) {
      console.error('❌ Error creando mesa:', error.message);
      throw error;
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      const updated = tablesData.map(t => 
        t.id === id ? { ...t, ...tableData } : t
      );
      setTablesData(updated);
      
      // Guardar en Firestore usando setDoc con merge
      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            tables: updated.map(t => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              zone: t.zone,
              status: t.status
            }))
          }, { merge: true });
          console.log('✅ Mesa actualizada en Firestore');
        } catch (err) {
          console.warn('⚠️ Error actualizando mesas en Firestore:', err.message);
        }
      }
      
      return updated.find(t => t.id === id);
    } catch (error) {
      console.error('❌ Error actualizando mesa:', error.message);
      throw error;
    }
  };

  const deleteTable = async (id) => {
    try {
      const updated = tablesData.filter(t => t.id !== id);
      setTablesData(updated);
      
      // Guardar en Firestore usando setDoc con merge
      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            tables: updated.map(t => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              zone: t.zone,
              status: t.status
            }))
          }, { merge: true });
          console.log('✅ Mesa eliminada en Firestore');
        } catch (err) {
          console.warn('⚠️ Error eliminando mesa en Firestore:', err.message);
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando mesa:', error.message);
      throw error;
    }
  };

  const value = {
    orders,
    setOrders,
    currentOrder,
    setCurrentOrder,
    currentOrderType,
    selectedTable,
    deliveryData,
    loading,
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
  };

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