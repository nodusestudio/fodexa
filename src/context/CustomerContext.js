import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📡 Cargar clientes desde Firestore cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Crear una búsqueda: "dame todos los clientes de este usuario"
    const q = query(
      collection(db, `users/${user.uid}/customers`),
      where('userId', '==', user.uid)
    );

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(customersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // ➕ Agregar cliente a Firestore
  const addCustomer = async (customerData) => {
    if (!user) {
      alert('Debes estar autenticado');
      return null;
    }

    try {
      const newCustomer = {
        ...customerData,
        userId: user.uid,
        createdAt: new Date(),
      };

      // Guardar en Firestore
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/customers`),
        newCustomer
      );

      console.log('✅ Cliente guardado en la nube:', docRef.id);
      return { id: docRef.id, ...newCustomer };
    } catch (error) {
      console.error('❌ Error al guardar cliente:', error);
      alert('Error al guardar cliente: ' + error.message);
      return null;
    }
  };

  // ✏️ Actualizar cliente
  const updateCustomer = async (id, data) => {
    if (!user) {
      alert('Debes estar autenticado');
      return;
    }

    try {
      const customerRef = doc(db, `users/${user.uid}/customers`, id);
      await updateDoc(customerRef, data);
      console.log('✅ Cliente actualizado en la nube');
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
      alert('Error al actualizar cliente: ' + error.message);
    }
  };

  // 🗑️ Eliminar cliente
  const deleteCustomer = async (id) => {
    if (!user) {
      alert('Debes estar autenticado');
      return;
    }

    try {
      const customerRef = doc(db, `users/${user.uid}/customers`, id);
      await deleteDoc(customerRef);
      console.log('✅ Cliente eliminado de la nube');
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      alert('Error al eliminar cliente: ' + error.message);
    }
  };

  const getCustomerById = (id) => customers.find(c => c.id === id);

  // Clasificación de clientes
  const getClassification = (totalPurchases, lastPurchaseDate) => {
    const daysSinceLastPurchase = lastPurchaseDate 
      ? Math.ceil((new Date() - new Date(lastPurchaseDate)) / (1000 * 60 * 60 * 24))
      : 999;

    if (totalPurchases >= 10 || daysSinceLastPurchase <= 7) {
      return { level: 'VIP', color: 'purple', icon: '👑' };
    } else if (totalPurchases >= 5 || daysSinceLastPurchase <= 30) {
      return { level: 'Frecuente', color: 'blue', icon: '⭐' };
    } else {
      return { level: 'Ocasional', color: 'gray', icon: '👤' };
    }
  };

  // Obtener estadísticas de cliente (se integra con TicketContext)
  const getCustomerStats = (customerId, tickets = []) => {
    const customer = getCustomerById(customerId);
    if (!customer) {
      return {
        totalPurchases: 0,
        totalSpent: 0,
        lastPurchase: null,
        averageTicket: 0,
        classification: { level: 'Ocasional', color: 'gray', icon: '👤' },
        tickets: [],
      };
    }

    const customerTickets = tickets.filter(t => {
      if (!t.customer) return false;
      // Comparar por nombre o por id
      return (
        (t.customer.id === customerId) || 
        (t.customer.name && t.customer.name.trim() === customer.name.trim())
      );
    });

    const totalPurchases = customerTickets.length;
    const totalSpent = customerTickets.reduce((sum, t) => sum + (t.total || 0), 0);
    const lastPurchase = customerTickets.length > 0 
      ? new Date(Math.max(...customerTickets.map(t => new Date(t.createdAt))))
      : null;
    const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    const classification = getClassification(totalPurchases, lastPurchase);

    return {
      totalPurchases,
      totalSpent,
      lastPurchase,
      averageTicket,
      classification,
      tickets: customerTickets,
    };
  };

  // Buscar clientes
  const searchCustomers = (query) => {
    const lowerQuery = query.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query) ||
      c.city.toLowerCase().includes(lowerQuery)
    );
  };

  // Obtener clientes por clasificación
  const getCustomersByClassification = (tickets = []) => {
    return customers.map(customer => {
      const stats = getCustomerStats(customer.id, tickets);
      return {
        ...customer,
        ...stats,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // Exportar clientes
  const exportCustomers = (tickets = []) => {
    const csvContent = [
      ['ID', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Ciudad', 'Estado', 'Compras', 'Total Gastado', 'Ticket Promedio', 'Clasificación'],
      ...customers.map(c => {
        const stats = getCustomerStats(c.id, tickets);
        return [
          c.id,
          c.name,
          c.email,
          c.phone,
          c.address,
          c.city,
          c.status === 'active' ? 'Activo' : 'Inactivo',
          stats.totalPurchases,
          stats.totalSpent.toFixed(2),
          stats.averageTicket.toFixed(2),
          stats.classification.level,
        ];
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const value = {
    customers,
    loading,
    getUserCustomers: () => customers, // Ya Firestore filtra por usuario
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getClassification,
    getCustomerStats,
    searchCustomers,
    getCustomersByClassification,
    exportCustomers,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers debe usarse dentro de CustomerProvider');
  }
  return context;
};
