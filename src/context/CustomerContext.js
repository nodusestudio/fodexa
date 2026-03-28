import { createContext, useContext, useState } from 'react';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@email.com',
      phone: '300 123 4567',
      address: 'Calle 123 #45-67, Bogotá',
      city: 'Bogotá',
      birthdate: '1990-05-15',
      notes: '',
      status: 'active',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@email.com',
      phone: '310 987 6543',
      address: 'Carrera 45 #12-34, Medellín',
      city: 'Medellín',
      birthdate: '1985-08-22',
      notes: 'Cliente VIP',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@email.com',
      phone: '315 456 7890',
      address: 'Transversal 78 #90-12, Cali',
      city: 'Cali',
      birthdate: '1995-03-10',
      notes: '',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana@email.com',
      phone: '318 234 5678',
      address: 'Diagonal 23 #56-78, Barranquilla',
      city: 'Barranquilla',
      birthdate: '1988-11-05',
      notes: 'Prefiere domicilios',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 5,
      name: 'Luis Rodríguez',
      email: 'luis@email.com',
      phone: '304 876 5432',
      address: 'Calle 67 #89-01, Cartagena',
      city: 'Cartagena',
      birthdate: '1992-07-18',
      notes: '',
      status: 'active',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  // CRUD Clientes
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: Date.now(),
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, data) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
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
