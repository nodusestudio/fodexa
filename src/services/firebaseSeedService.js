import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { mockCategories, mockProducts, mockAddons, mockOrders, mockExpenses } from '../data/mockFirebaseData';

// Cargar categorías a Firestore
export const seedCategories = async (userId) => {
  try {
    console.log('📦 Cargando categorías...');
    const categoriesRef = collection(db, 'categories');
    
    for (const category of mockCategories) {
      await addDoc(categoriesRef, {
        ...category,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log('✅ Categorías cargadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error cargando categorías:', error);
    throw error;
  }
};

// Cargar productos a Firestore
export const seedProducts = async (userId) => {
  try {
    console.log('📦 Cargando productos...');
    const productsRef = collection(db, 'products');
    
    for (const product of mockProducts) {
      await addDoc(productsRef, {
        ...product,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log('✅ Productos cargados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    throw error;
  }
};

// Cargar adicionales a Firestore
export const seedAddons = async (userId) => {
  try {
    console.log('📦 Cargando adicionales...');
    const addonsRef = collection(db, 'addons');
    
    for (const addon of mockAddons) {
      await addDoc(addonsRef, {
        ...addon,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log('✅ Adicionales cargados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error cargando adicionales:', error);
    throw error;
  }
};

// Cargar órdenes a Firestore
export const seedOrders = async (userId) => {
  try {
    console.log('📦 Cargando órdenes...');
    const ordersRef = collection(db, 'orders');
    
    for (const order of mockOrders) {
      const itemsWithAddons = order.items.map(item => {
        const addonsTotal = item.addons?.reduce((sum, a) => sum + (a.price || 0), 0) || 0;
        return {
          ...item,
          itemTotal: (item.price || 0) * (item.quantity || 1) + addonsTotal,
        };
      });
      
      const subtotal = itemsWithAddons.reduce((sum, item) => sum + item.itemTotal, 0);
      const iva = 0; // IVA no se aplica en seed data
      const deliveryCost = order.type === 'delivery' ? (order.deliveryData?.cost || 0) : 0;
      const total = subtotal + iva + deliveryCost;
      
      await addDoc(ordersRef, {
        ...order,
        items: itemsWithAddons,
        userId,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        subtotal,
        iva,
        deliveryCost,
        total,
        timestamp: new Date(),
      });
    }
    console.log('✅ Órdenes cargadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error cargando órdenes:', error);
    throw error;
  }
};

// Cargar gastos a Firestore
export const seedExpenses = async (userId) => {
  try {
    console.log('📦 Cargando gastos...');
    const expensesRef = collection(db, 'expenses');
    
    for (const expense of mockExpenses) {
      await addDoc(expensesRef, {
        ...expense,
        userId,
        date: new Date(),
        user: 'Demo User',
      });
    }
    console.log('✅ Gastos cargados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error cargando gastos:', error);
    throw error;
  }
};

// Función principal para cargar todos los datos
export const seedAllData = async (userId) => {
  try {
    console.log('🚀 Iniciando carga de datos ficticios...');
    
    await seedCategories(userId);
    await seedProducts(userId);
    await seedAddons(userId);
    await seedOrders(userId);
    await seedExpenses(userId);
    
    console.log('🎉 ¡Todos los datos han sido cargados exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error);
    throw error;
  }
};

// Limpiar datos de un usuario (para resetear)
export const clearUserData = async (userId) => {
  try {
    console.log('🗑️ Eliminando datos del usuario...');
    
    const collections = ['categories', 'products', 'addons', 'orders', 'expenses'];
    
    for (const collectionName of collections) {
      const q = query(collection(db, collectionName), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnap.id));
      }
      console.log(`✅ ${collectionName} eliminados`);
    }
    
    console.log('🎉 Todos los datos han sido eliminados');
    return true;
  } catch (error) {
    console.error('❌ Error eliminando datos:', error);
    throw error;
  }
};
