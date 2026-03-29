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
      try {
        // Comparar por nombre o por id
        const nameMatch = t.customer.name && customer.name
          ? t.customer.name.trim() === customer.name.trim()
          : false;
        return (t.customer.id === customerId) || nameMatch;
      } catch (error) {
        console.warn('⚠️ Error filtrando tickets de cliente:', t, error);
        return false;
      }
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

  // Buscar clientes - ROBUSTO contra datos incompletos
  const searchCustomers = (query) => {
    if (!query || query.trim() === '') return customers;
    
    const lowerQuery = query.toLowerCase();
    return customers.filter(c => {
      try {
        // Validar que cada propiedad existe antes de usarla
        const nameMatch = c.name && String(c.name).toLowerCase().includes(lowerQuery);
        const emailMatch = c.email && String(c.email).toLowerCase().includes(lowerQuery);
        const phoneMatch = c.phone && String(c.phone).includes(query);
        const cityMatch = c.city && String(c.city).toLowerCase().includes(lowerQuery);
        const contactMatch = c.contact && String(c.contact).toLowerCase().includes(lowerQuery);
        
        return nameMatch || emailMatch || phoneMatch || cityMatch || contactMatch;
      } catch (error) {
        console.warn('⚠️ Error filtrando cliente:', c, error);
        return false;
      }
    });
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

  // Exportar clientes - ROBUSTO contra datos incompletos
  const exportCustomers = (tickets = []) => {
    try {
      const csvContent = [
        ['ID', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Ciudad', 'Estado', 'Compras', 'Total Gastado', 'Ticket Promedio', 'Clasificación'],
        ...customers.map(c => {
          const stats = getCustomerStats(c.id, tickets);
          return [
            c.id || '',
            c.name || 'Sin nombre',
            c.email || '',
            c.phone || '',
            c.address || '',
            c.city || '',
            c.status === 'active' ? 'Activo' : 'Inactivo',
            stats.totalPurchases || 0,
            (stats.totalSpent || 0).toFixed(2),
            (stats.averageTicket || 0).toFixed(2),
            stats.classification?.level || 'Desconocido',
          ];
        })
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      console.log('✅ Exportados', customers.length, 'clientes');
    } catch (error) {
      console.error('❌ Error exportando clientes:', error);
      alert('Error al exportar clientes: ' + error.message);
    }
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
