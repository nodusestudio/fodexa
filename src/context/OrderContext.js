import React, { createContext, useContext, useState } from 'react';
import tables from '../data/tables';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // PEDIDOS DE PRUEBA
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-001',
      type: 'table',
      tableNumber: 3,
      items: [{ id: 1, name: 'Hamburguesa', price: 10, quantity: 2 }],
      subtotal: 20,
      total: 20,
      status: 'pending',
      timestamp: new Date(Date.now() - 15 * 60000)
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      type: 'takeout',
        items: [{ id: 2, name: 'Pizza', price: 15, quantity: 1, addons: [] }],
      subtotal: 15,
      total: 15,
      status: 'preparing',
      timestamp: new Date(Date.now() - 25 * 60000)
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      type: 'delivery',
      deliveryData: { name: 'Juan Pérez', phone: '300 123 4567', address: 'Calle 123' },
        items: [{ id: 3, name: 'Refresco', price: 3, quantity: 3, addons: [] }],
      subtotal: 9,
      total: 9,
      status: 'ready',
      timestamp: new Date(Date.now() - 10 * 60000)
    }
  ]);
  
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

  // Función para establecer tipo de orden
  const setOrderType = (type) => {
    setCurrentOrderType(type);
  };

  // Función para seleccionar mesa
  const selectTable = (tableId) => {
    setSelectedTable(tableId);
  };

  // Función para actualizar datos de domicilio (siempre nuevo objeto, solo una llamada)
  const setDeliveryData = (data) => {
    setDeliveryDataState(prev => ({ ...prev, ...data }));
  };

  // Filtra pedidos por tipo
  const getOrdersByType = (type) => orders.filter(order => order.type === type);

  // Crea un nuevo pedido
  const createOrder = (data) => {
    console.log('📝 createOrder llamado con:', data);
    // Recalcular totales para asegurar consistencia
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
    const newOrder = {
      ...data,
      id: Date.now(),
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date(),
      items: itemsWithAddons,
      subtotal,
      iva,
      deliveryCost,
      total,
    };
    console.log('📦 Orden creada:', newOrder);
    setOrders(prev => {
      const updated = [...prev, newOrder];
      console.log('📋 Total de orders:', updated.length);
      return updated;
    });
    return newOrder;
  };

  // Actualiza un pedido existente
  const updateOrder = (id, data) => {
    console.log('✏️ updateOrder llamado con ID:', id, 'data:', data);
    setOrders(prev => {
      const updated = prev.map(order => 
        order.id === id 
          ? { ...order, ...data, updatedAt: new Date() }
          : order
      );
      console.log('📋 Orders actualizados:', updated.length);
      return updated;
    });
  };

  // Elimina un pedido por id
  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
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

    // Calcula el total de una orden sumando productos y anexos
    const calculateOrderTotal = (order) => {
      if (!order.items) return 0;
      return order.items.reduce((sum, item) => {
        const addonsTotal = Array.isArray(item.addons)
          ? item.addons.reduce((aSum, addon) => aSum + (parseFloat(addon.price) || 0), 0) * (item.quantity || 1)
          : 0;
        return sum + (parseFloat(item.price) || 0) * (item.quantity || 1) + addonsTotal;
      }, 0);
    };

    // Actualiza todos los totales de las órdenes al cargar o modificar
    React.useEffect(() => {
      setOrders(prevOrders => prevOrders.map(order => ({
        ...order,
        total: calculateOrderTotal(order)
      })));
    }, []);
  const value = {
    orders,
    setOrders,
    currentOrder,
    setCurrentOrder,
    currentOrderType,
    selectedTable,
    deliveryData,
    setOrderType,
    selectTable,
    setDeliveryData,
    createOrder,
    updateOrder,  // ← Debe estar aquí
    deleteOrder,
    getOrdersByType,
    updateTableStatus,
    clearCurrentOrder,
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