import { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([
    {
      id: 1,
      userId: 'shared',
      ticketNumber: 'TKT-000001',
      orderId: 1,
      orderType: 'table',
      tableNumber: 3,
      customer: null,
      items: [{ name: 'Hamburguesa', quantity: 2, price: 10, addons: [] }],
      subtotal: 20,
      iva: 3.2,
      deliveryCost: 0,
      total: 23.2,
      paymentType: 'cash',
      status: 'completed',
      createdAt: new Date(Date.now() - 30 * 60000),
    },
    {
      id: 2,
      userId: 'shared',
      ticketNumber: 'TKT-000002',
      orderId: 2,
      orderType: 'takeout',
      tableNumber: null,
      customer: null,
      items: [{ name: 'Pizza', quantity: 1, price: 15, addons: [] }],
      subtotal: 15,
      iva: 2.4,
      deliveryCost: 0,
      total: 17.4,
      paymentType: 'card',
      status: 'completed',
      createdAt: new Date(Date.now() - 60 * 60000),
    },
    {
      id: 3,
      userId: 'shared',
      ticketNumber: 'TKT-000003',
      orderId: 3,
      orderType: 'delivery',
      tableNumber: null,
      customer: { name: 'Juan Pérez', phone: '300 123 4567', address: 'Calle 123' },
      items: [{ name: 'Refresco', quantity: 3, price: 3, addons: [] }],
      subtotal: 9,
      iva: 1.44,
      deliveryCost: 5,
      total: 15.44,
      paymentType: 'cash',
      status: 'completed',
      createdAt: new Date(Date.now() - 120 * 60000),
    },
  ]);

  // Cargar tickets desde Firestore en tiempo real
  useEffect(() => {
    if (!user) {
      setTickets(prev => prev.filter(t => t.userId === 'shared')); // Solo mostrar demo
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/tickets`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }));
        // Agregar tickets propios + demo
        const demoTickets = tickets.filter(t => t.userId === 'shared');
        setTickets([...ticketsData, ...demoTickets]);
      },
      (error) => {
        console.warn('⚠️ Error cargando tickets:', error.message);
        // Los tickets de demostración quedan disponibles
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Obtener datos de empresa y ticket desde SettingsContext
  const { settings } = useSettings();
  const companyData = settings.company;
  const ticketConfig = settings.ticket;

  const generateTicketNumber = () => {
    const lastTicket = tickets[tickets.length - 1];
    const lastNumber = lastTicket ? parseInt(lastTicket.ticketNumber.split('-')[1]) : 0;
    const newNumber = String(lastNumber + 1).padStart(6, '0');
    return `TKT-${newNumber}`;
  };

  const createTicket = (orderData) => {
    // Calcular subtotal correctamente: suma de (precio * cantidad) de productos + suma de (precio de addons * cantidad)
    const subtotal = orderData.items.reduce((sum, item) => {
      const base = (parseFloat(item.price) || 0) * (item.quantity || 1);
      const addonsTotal = Array.isArray(item.addons)
        ? item.addons.reduce((aSum, addon) => aSum + (parseFloat(addon.price) || 0) * (item.quantity || 1), 0)
        : 0;
      return sum + base + addonsTotal;
    }, 0);

    // IVA según configuración
    const taxEnabled = settings.taxes && (settings.taxes.enabled === true || settings.taxes.enabled === undefined ? !!settings.taxes.value : settings.taxes.enabled);
    const taxValue = settings.taxes && settings.taxes.value ? parseFloat(settings.taxes.value) : 0;
    const iva = taxEnabled && taxValue > 0 ? subtotal * (taxValue / 100) : 0;
    const deliveryCost = orderData.deliveryCost || 0;
    const total = subtotal + iva + deliveryCost;

    // Asegurar deliveryData siempre presente si es delivery
    let deliveryData = null;
    if (orderData.type === 'delivery') {
      deliveryData = orderData.deliveryData || orderData.customer || null;
    }

    const newTicket = {
      id: Date.now().toString(),
      userId: user?.uid || 'anonymous',
      ticketNumber: generateTicketNumber(),
      orderId: orderData.id,
      orderType: orderData.type,
      tableNumber: orderData.tableNumber || null,
      customer: deliveryData,
      deliveryData: deliveryData,
      items: orderData.items,
      subtotal,
      iva,
      deliveryCost,
      total,
      paymentType: orderData.paymentType || 'pending',
      status: 'completed',
      // Inicializar pagos (se actualizan después)
      pago_efectivo: orderData.pago_efectivo || 0,
      pago_digital: orderData.pago_digital || 0,
      createdAt: new Date(),
    };
    
    // Guardar localmente primero
    setTickets(prev => [...prev, newTicket]);
    
    // Guardar en Firestore en background
    if (user?.uid) {
      (async () => {
        try {
          await addDoc(collection(db, `users/${user.uid}/tickets`), newTicket);
          console.log('✅ Ticket guardado en la nube');
        } catch (error) {
          console.warn('⚠️ Error guardando ticket en Firestore:', error.message);
        }
      })();
    }
    
    return newTicket;
  };

  const getTicketById = (id) => tickets.find(t => t.id === id);
  const getTicketByNumber = (number) => tickets.find(t => t.ticketNumber === number);

  const getAllTickets = () => tickets;

  const getTicketsByDate = (date) => {
    return tickets.filter(t => {
      const ticketDate = new Date(t.createdAt).toLocaleDateString();
      return ticketDate === date.toLocaleDateString();
    });
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      // Actualizar en estado local primero
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, ...updates, updatedAt: new Date() } : t
      ));
      
      // Actualizar en Firestore si el usuario está autenticado
      if (user?.uid) {
        const ticketRef = doc(db, `users/${user.uid}/tickets`, ticketId);
        await updateDoc(ticketRef, {
          ...updates,
          updatedAt: new Date(),
        });
        console.log('✅ Ticket actualizado en Firestore:', ticketId, updates);
      } else {
        console.warn('⚠️ Usuario no autenticado. Cambios solo locales.');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error actualizando ticket en Firebase:', error.message);
      throw error;
    }
  };

  const updateCompanyData = (data) => {
    setCompanyData(prev => ({ ...prev, ...data }));
  };

  const value = {
    tickets,
    companyData,
    ticketConfig,
    createTicket,
    getTicketById,
    getTicketByNumber,
    getAllTickets,
    getTicketsByDate,
    updateTicket,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets debe usarse dentro de TicketProvider');
  }
  return context;
};
