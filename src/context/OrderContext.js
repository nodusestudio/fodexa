import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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

  // Cargar órdenes de prueba cuando hay usuario
  useEffect(() => {
    if (!user) {
      console.log('❌ Sin usuario, limpiando órdenes');
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('👤 Usuario detectado:', user.uid);
    console.log('📋 mockOrders original:', mockOrders);

    // Agregar userId a los mockOrders (IDs ya existen)
    const ordersWithUserId = mockOrders.map(order => ({
      ...order,
      userId: user.uid,
      timestamp: order.timestamp || new Date(),
    }));

    console.log('✅ Órdenes con userId:', ordersWithUserId);
    setOrders(ordersWithUserId);
    setLoading(false);
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
      const iva = data.taxesConfig?.enabled ? subtotal * (parseFloat(data.taxesConfig?.value || 0) / 100) : (subtotal * 0.16);
      const deliveryCost = data.type === 'delivery' ? (parseFloat(data.deliveryData?.cost) || 0) : 0;
      const total = subtotal + iva + deliveryCost;
      
      // 2️⃣ Crear objeto con todas las propiedades calculadas
      const orderId = `local_${Date.now()}`;
      const orderData = {
        id: orderId,
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
      
      console.log('💾 Guardando orden localmente:', orderData);
      
      // 3️⃣ ✅ Guardar en estado local
      setOrders(prev => {
        const updated = [...prev, orderData];
        console.log('✅ Orden agregada al estado. Total:', updated.length);
        return updated;
      });
      
      // 4️⃣ Intentar guardar en Firestore en background (sin bloquear)
      if (user?.uid) {
        (async () => {
          try {
            console.log('🔥 Intentando guardar en Firestore...');
            await addDoc(collection(db, 'orders'), orderData);
            console.log('📦 Orden también guardada en Firestore');
          } catch (firestoreError) {
            console.warn('⚠️ Firestore falló pero orden guardada localmente:', firestoreError.message);
          }
        })();
      }
      
      return orderData;
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      throw error;
    }
  };

  // Actualiza un pedido existente y actualiza estado local
  const updateOrder = async (id, data) => {
    try {
      console.log('✏️ updateOrder llamado con ID:', id, 'Datos:', data);
      
      // 1️⃣ ✅ Actualizar PRIMERO en estado local
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, ...data, updatedAt: new Date() } : order
      ));
      console.log('✅ Pedido actualizado en estado local');
      
      // 2️⃣ Intentar actualizar en Firestore en background (si el usuario existe y es ID válido)
      if (user?.uid && !id.startsWith('local_')) {
        (async () => {
          try {
            const orderRef = doc(db, 'orders', id);
            await updateDoc(orderRef, {
              ...data,
              updatedAt: new Date(),
            });
            console.log('📦 Orden también actualizada en Firestore');
          } catch (firestoreError) {
            console.warn('⚠️ Firestore falló pero orden actualizada localmente:', firestoreError.message);
          }
        })();
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