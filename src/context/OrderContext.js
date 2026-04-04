import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import tables from '../data/tables';
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

  // Cargar órdenes de Firestore en tiempo real
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
      async (snapshot) => {
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
        
        // ✅ FILTRADO ESTRICTO: Solo status válidos
        const validStatuses = ['pending', 'waiting', 'preparing'];
        const toDelete = []; // Órdenes por eliminar
        
        const activeOrders = allOrdersData.filter(order => {
          const isActive = order.status && validStatuses.includes(order.status);
          
          if (!isActive) {
            const reason = !order.status ? 'sin status' : `status="${order.status}" (inválido)`;
            console.log(`  🚫 EXCLUIDA Y SERÁ BORRADA: ${order.id.substring(0,8)}... (${reason})`);
            toDelete.push(order.id); // Marcar para borrar
          }
          
          return isActive;
        });
        
        // ✅ LIMPIAR AUTOMÁTICAMENTE órdenes viejas inválidas del Firestore
        if (toDelete.length > 0 && user?.uid) {
          console.log(`🗑️ Eliminando ${toDelete.length} órdenes inválidas del Firestore...`);
          for (const orderId of toDelete) {
            try {
              await deleteDoc(doc(db, `users/${user.uid}/orders`, orderId));
              console.log(`✅ Eliminada: ${orderId.substring(0,8)}...`);
            } catch (error) {
              console.warn(`⚠️ Error al eliminar ${orderId}:`, error.message);
            }
          }
        }
        
        console.log(`✅ [RESULTADO] ${activeOrders.length} órdenes válidas de ${allOrdersData.length} totales`);
        if (toDelete.length > 0) {
          console.log(`🧹 ${toDelete.length} órdenes viejas eliminadas automáticamente`);
        }
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
      
      // 3️⃣ ✅ GUARDAR PRIMERO EN FIRESTORE (si está autenticado) para obtener ID real
      let finalOrderId = `local_${Date.now()}`;
      let finalOrderData = { id: finalOrderId, ...orderData };
      
      if (user?.uid) {
        try {
          console.log('🔥 [CREAR] Guardando en Firestore...', {
            status: orderData.status,
            type: orderData.type,
          });
          const docRef = await addDoc(collection(db, `users/${user.uid}/orders`), {
            ...orderData,
          });
          finalOrderId = docRef.id;
          finalOrderData = { id: finalOrderId, ...orderData };
          console.log('✅ [CREAR] Orden en Firestore:', finalOrderId, 'Status:', orderData.status);
        } catch (firestoreError) {
          console.error('❌ [CREAR] Firestore falló');
          console.error('   Código de error:', firestoreError.code);
          console.error('   Mensaje:', firestoreError.message);
          console.error('   Stack:', firestoreError);
          console.error('   UID del usuario:', user?.uid);
          console.error('   Usando ID local como fallback:', finalOrderId);
        }
      } else {
        console.warn('⚠️ [CREAR] Usuario no autenticado:', { user, uid: user?.uid });
      }
      
      // 4️⃣ Guardar en estado local con el ID real (de Firestore) o local (si Firestore falló)
      setOrders(prev => {
        const updated = [...prev, finalOrderData];
        console.log('✅ [CREAR] En estado local. Total órdenes:', updated.length);
        return updated;
      });
      
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
      // ⚠️ NOTA: La orden podría no estar en estado local si fue eliminada por onSnapshot
      // Pero eso está bien - podemos actualizarla en Firestore directamente
      const orderBefore = orders.find(o => o.id === id);
      
      if (orderBefore) {
        // ACTUALIZAR estado local si aún existe
        console.log('  1️⃣ Actualizando estado local...');
        console.log('     Status anterior:', orderBefore?.status);
        
        setOrders(prev => {
          const updated = prev.map(order => 
            order.id === id ? { ...order, ...data, updatedAt: new Date() } : order
          );
          const updatedOrder = updated.find(o => o.id === id);
          console.log('     ✅ Status ahora:', updatedOrder?.status);
          return updated;
        });
      } else {
        console.warn(`⚠️ Orden ${id} no está en estado local (probablemente ya fue eliminada por onSnapshot)`);
        console.warn('  Continuando con actualización en Firestore de todos modos...');
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
          
          // Actualizar estado local con el nuevo ID
          console.log('     📥 Actualizando estado local con ID de Firestore...');
          setOrders(prev => {
            const updated = prev.map(order => {
              if (order.id === id) {
                console.log(`       ${id} → ${newId}`);
                return { ...order, ...data, id: newId, updatedAt: new Date() };
              }
              return order;
            });
            const migrated = updated.find(o => o.id === newId);
            console.log(`     ✅ Estado actualizado, nuevo ID: ${migrated?.id}`);
            return updated;
          });
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
    } catch (error) {
      console.error('❌ Error en updateOrder - No se completó la actualización');
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  // Elimina un pedido marcándolo como completado (no lo borra, evita que reaparezca)
  const deleteOrder = async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      // ✅ Marcar como 'completed' en lugar de eliminar
      // Esto evita que órdenes "fantasma" reaparezcan al actualizar
      await updateDoc(doc(db, `users/${user.uid}/orders`, id), {
        status: 'completed',
        completedAt: new Date(),
        deletedByUser: true
      });
      
      // ✅ Remover del estado local también
      setOrders(prev => prev.filter(order => order.id !== id));
      console.log('✅ Pedido marcado como completado (no eliminado físicamente)');
    } catch (error) {
      console.error('Error marking order as completed:', error);
      throw error;
    }
  };

  // Actualiza estado de mesa
  const updateTableStatus = (tableId, status) => {
    setTablesData(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  };

  // ✅ LIMPIEZA AUTOMÁTICA: Borrar órdenes completadas antiguas (> 1 hora)
  // Esto mantiene Firestore limpio y asegura que SOLO órdenes activas se muestren
  const cleanupCompletedOrders = async () => {
    if (!user?.uid) return;
    
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Buscar órdenes completadas hace más de 1 hora
      const q = query(
        collection(db, `users/${user.uid}/orders`),
        where('status', '==', 'completed'),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        const orderTime = doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp);
        
        if (orderTime < oneHourAgo) {
          await deleteDoc(doc.ref);
          deletedCount++;
          console.log(`🗑️ Orden completada antigua eliminada: ${doc.id}`);
        }
      }
      
      if (deletedCount > 0) {
        console.log(`🧹 Limpieza: ${deletedCount} órdenes completadas antiguas eliminadas`);
      }
    } catch (error) {
      console.warn('⚠️ Error en limpieza de órdenes:', error.message);
      // No es crítico si falla la limpieza
    }
  };
  
  // Ejecutar limpieza cada 10 minutos cuando hay usuario autenticado
  useEffect(() => {
    if (!user?.uid) return;
    
    const cleanupInterval = setInterval(() => {
      cleanupCompletedOrders();
    }, 10 * 60 * 1000); // 10 minutos
    
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