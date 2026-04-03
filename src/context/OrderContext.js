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
      (snapshot) => {
        const allOrdersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
        }));
        
        console.log('🔄 [FIRESTORE] Órdenes cargadas desde Firestore:', allOrdersData.length);
        allOrdersData.forEach(o => console.log(`  - ${o.id}: type=${o.type}, status=${o.status}`));
        
        // ✅ FILTRADO EN LA CARGA: Solo mostrar órdenes ACTIVAS (no completadas)
        // Las órdenes completadas deben desaparecer automáticamente del tablero
        const activeOrders = allOrdersData.filter(order => {
          // Solo mostrar si status es 'pending', 'waiting' o 'preparing'
          // Excluir completadas automáticamente
          const isActive = order.status && ['pending', 'waiting', 'preparing'].includes(order.status);
          
          if (!isActive) {
            console.log(`🔍 [FILTRO] Orden ${order.id} exclusiva (status="${order.status}")`);
          }
          
          return isActive;
        });
        
        console.log(`✅ [RESULTADO] Órdenes activas: ${activeOrders.length} de ${allOrdersData.length}`);
        setOrders(activeOrders);
        setLoading(false);
      },
      (error) => {
        console.warn('⚠️ Error al cargar órdenes:', error.message);
        // Para usuarios autenticados: arreglo vacío (sin fallback a mock)
        // Solo mostrar mock para desarrollo/demo sin usuario
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
          console.log('🔥 Guardando DIRECTAMENTE en Firestore (sin await inicial)...');
          // Guardar en Firestore y obtener el ID real
          const docRef = await addDoc(collection(db, `users/${user.uid}/orders`), {
            ...orderData,
          });
          finalOrderId = docRef.id;
          finalOrderData = { id: finalOrderId, ...orderData };
          console.log('✅ Orden guardada en Firestore con ID:', finalOrderId);
        } catch (firestoreError) {
          console.warn('⚠️ Firestore falló, usando ID local como fallback:', firestoreError.message);
          // Mantener el ID local si Firestore falla
        }
      }
      
      // 4️⃣ Guardar en estado local con el ID real (de Firestore) o local (si Firestore falló)
      setOrders(prev => {
        const updated = [...prev, finalOrderData];
        console.log('✅ Orden agregada al estado con ID:', finalOrderId);
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
    try {
      console.log('✏️ updateOrder llamado - ID:', id, 'Status:', data.status);
      
      // 1️⃣ Actualizar SIEMPRE en estado local primero
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, ...data, updatedAt: new Date() } : order
      ));
      console.log('✅ Pedido actualizado en estado local');
      
      // 2️⃣ Si es un ID local, NO puede actualizar en Firestore (no existe ahí)
      // Si es un ID real de Firestore, actualizar directamente
      if (!id.startsWith('local_') && user?.uid) {
        try {
          const orderRef = doc(db, `users/${user.uid}/orders`, id);
          await updateDoc(orderRef, {
            ...data,
            updatedAt: new Date(),
          });
          console.log('📦 Orden actualizada en Firestore - Status:', data.status);
        } catch (firestoreError) {
          console.error('❌ Error al actualizar en Firestore:', firestoreError.message);
          // El estado local ya se actualizó, así que no es crítico
        }
      } else if (id.startsWith('local_')) {
        console.warn('⚠️ ID local detectado - no se puede actualizar en Firestore, solo en estado local');
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
      throw error;
    }
  };

  // Elimina un pedido y lo remueve del estado local
  const deleteOrder = async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteDoc(doc(db, 'orders', id));
      
      // ✅ Remover del estado local también
      setOrders(prev => prev.filter(order => order.id !== id));
      console.log('✅ Pedido eliminado del estado local');
    } catch (error) {
      console.error('Error deleting order:', error);
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