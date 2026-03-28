import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import tables from '../data/tables';

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

  // Sincronizar órdenes desde Firestore
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp,
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return unsubscribe;
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

  // Crea un nuevo pedido en Firestore
  const createOrder = async (data) => {
    if (!user) throw new Error('User not authenticated');
    try {
      console.log('📝 createOrder llamado con:', data);
      
      // Recalcular totales
      const itemsWithAddons = data.items.map(item => {
        const addonsTotal = item.addons?.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0) || 0;
        return {
          ...item,
          itemTotal: (parseFloat(item.price) || 0) * (item.quantity || 1) + addonsTotal,
        };
      });
      
      const subtotal = itemsWithAddons.reduce((sum, item) => sum + item.itemTotal, 0);
      const iva = subtotal * 0.16;
      const deliveryCost = data.type === 'delivery' ? (parseFloat(data.deliveryData?.cost) || 0) : 0;
      const total = subtotal + iva + deliveryCost;
      
      const orderData = {
        ...data,
        userId: user.uid,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(),
        items: itemsWithAddons,
        subtotal,
        iva,
        deliveryCost,
        total,
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('📦 Orden creada con ID:', docRef.id);
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Actualiza un pedido existente
  const updateOrder = async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    try {
      console.log('✏️ updateOrder llamado con ID:', id);
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Elimina un pedido
  const deleteOrder = async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteDoc(doc(db, 'orders', id));
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