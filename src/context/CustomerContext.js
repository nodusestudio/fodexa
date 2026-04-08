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
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CustomerContext = createContext();
const FORCE_LOCAL_KEY = 'fodexa_force_local';
const CUSTOMERS_CACHE_KEY = 'customers_local_cache';

const leerClientesCache = () => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const guardarClientesCache = (clientes) => {
  try {
    localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(clientes || []));
  } catch {
    // ignorar errores de almacenamiento local
  }
};

const esErrorCuotaOConexion = (error) => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    code.includes('quota') ||
    code.includes('unavailable') ||
    message.includes('resource-exhausted') ||
    message.includes('quota') ||
    message.includes('unavailable')
  );
};

export const CustomerProvider = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(() => {
    try {
      return localStorage.getItem(FORCE_LOCAL_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const activarModoLocal = (motivo = 'fallback') => {
    try {
      localStorage.setItem(FORCE_LOCAL_KEY, 'true');
    } catch {
      // ignorar errores de almacenamiento local
    }
    setIsLocalMode(true);
    window.dispatchEvent(
      new CustomEvent('push-message', {
        detail: {
          type: 'warning',
          message: `Modo local activo en clientes (${motivo}). Los cambios se guardan localmente.`
        }
      })
    );
  };

  // 📡 Cargar clientes desde Firestore cuando cambia el usuario
  useEffect(() => {
    if (isLocalMode || !user?.uid) {
      setCustomers(leerClientesCache());
      setLoading(false);
      return;
    }

    setLoading(true);

    // Crear una búsqueda: "dame todos los clientes de este usuario"
    // Nota: No necesitamos where() porque ya estamos en la subcollection del usuario
    const q = query(collection(db, `users/${user.uid}/customers`));

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const customersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customersData);
        guardarClientesCache(customersData);
        setLoading(false);
      },
      (error) => {
        if (esErrorCuotaOConexion(error)) {
          activarModoLocal('error de cuota/conexión de Firebase');
          setCustomers(leerClientesCache());
          setLoading(false);
          return;
        }
        console.error('❌ Error cargando clientes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isLocalMode, user]);

  // ➕ Agregar cliente a Firestore
  const addCustomer = async (customerData) => {
    try {
      const ownerId = user?.uid || 'LOCAL_USER';
      const newCustomer = {
        ...customerData,
        userId: ownerId,
        createdAt: new Date(),
      };

      if (isLocalMode || !user?.uid) {
        const localCustomer = {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          ...newCustomer,
          syncStatus: 'local',
        };
        setCustomers((prev) => {
          const updated = [...prev, localCustomer];
          guardarClientesCache(updated);
          return updated;
        });
        return localCustomer;
      }

      // Guardar en Firestore
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/customers`),
        newCustomer
      );

      return { id: docRef.id, ...newCustomer };
    } catch (error) {
      if (esErrorCuotaOConexion(error)) {
        activarModoLocal('cuota agotada al guardar cliente');
        const ownerId = user?.uid || 'LOCAL_USER';
        const localCustomer = {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          ...customerData,
          userId: ownerId,
          createdAt: new Date(),
          syncStatus: 'local',
        };
        setCustomers((prev) => {
          const updated = [...prev, localCustomer];
          guardarClientesCache(updated);
          return updated;
        });
        return localCustomer;
      }
      console.error('❌ Error al guardar cliente:', error);
      throw error;
    }
  };

  // 📦 Importar múltiples clientes en lotes (writeBatch)
  const importCustomersBatch = async (customersArray, onProgress) => {
    if (!user) {
      throw new Error('Debes estar autenticado');
    }

    if (!customersArray || customersArray.length === 0) {
      throw new Error('No hay clientes para importar');
    }

    try {
      const BATCH_SIZE = 500; // writeBatch permite 500 escrituras por transacción
      let totalImported = 0;

      for (let i = 0; i < customersArray.length; i += BATCH_SIZE) {
        const batchData = customersArray.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        batchData.forEach(customerData => {
          const customersCollection = collection(db, `users/${user.uid}/customers`);
          const newDocRef = doc(customersCollection); // Generar ID automático

          batch.set(newDocRef, {
            ...customerData,
            userId: user.uid,
            createdAt: new Date(),
          });
        });

        // Ejecutar la transacción
        await batch.commit();
        totalImported += batchData.length;

        // Notificar progreso
        if (onProgress) {
          const progress = Math.round((totalImported / customersArray.length) * 100);
          onProgress({
            count: totalImported,
            total: customersArray.length,
            percent: progress,
          });
        }


        // Pequeña pausa para no bloquear el navegador
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { success: true, imported: totalImported };
    } catch (error) {
      console.error('❌ Error al importar clientes:', error);
      throw error;
    }
  };

  // ✏️ Actualizar cliente
  const updateCustomer = async (id, data) => {
    try {
      if (isLocalMode || !user?.uid || String(id).startsWith('local_')) {
        setCustomers((prev) => {
          const updated = prev.map((customer) =>
            customer.id === id ? { ...customer, ...data, syncStatus: 'local' } : customer
          );
          guardarClientesCache(updated);
          return updated;
        });
        return;
      }

      const customerRef = doc(db, `users/${user.uid}/customers`, id);
      await updateDoc(customerRef, data);
    } catch (error) {
      if (esErrorCuotaOConexion(error)) {
        activarModoLocal('cuota agotada al actualizar cliente');
        setCustomers((prev) => {
          const updated = prev.map((customer) =>
            customer.id === id ? { ...customer, ...data, syncStatus: 'local' } : customer
          );
          guardarClientesCache(updated);
          return updated;
        });
        return;
      }
      console.error('❌ Error al actualizar cliente:', error);
      throw error;
    }
  };

  // 🗑️ Eliminar cliente
  const deleteCustomer = async (id) => {
    try {
      if (isLocalMode || !user?.uid || String(id).startsWith('local_')) {
        setCustomers((prev) => {
          const updated = prev.filter((customer) => customer.id !== id);
          guardarClientesCache(updated);
          return updated;
        });
        return;
      }

      const customerRef = doc(db, `users/${user.uid}/customers`, id);
      await deleteDoc(customerRef);
    } catch (error) {
      if (esErrorCuotaOConexion(error)) {
        activarModoLocal('cuota agotada al eliminar cliente');
        setCustomers((prev) => {
          const updated = prev.filter((customer) => customer.id !== id);
          guardarClientesCache(updated);
          return updated;
        });
        return;
      }
      console.error('❌ Error al eliminar cliente:', error);
      throw error;
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
    } catch (error) {
      console.error('❌ Error exportando clientes:', error);
      alert('Error al exportar clientes: ' + error.message);
    }
  };

  const value = {
    customers,
    loading,
    isLocalMode,
    getUserCustomers: () => customers, // Ya Firestore filtra por usuario
    addCustomer,
    importCustomersBatch,
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
