import { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);

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
        const ticketsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,  // ✅ Asegurar que el ID de Firestore tiene prioridad (sobrescribir cualquier id local)
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            // Asegurar que transferType existe (migración para tickets antiguos)
            transferType: data.transferType || null,
          };
        });
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
      ticketType: orderData.ticketType || 'customer', // ✅ Tipo de ticket (customer/kitchen)
      tableNumber: orderData.tableNumber || null,
      customer: deliveryData,
      deliveryData: deliveryData,
      items: orderData.items,
      subtotal,
      iva,
      deliveryCost,
      total,
      paymentType: orderData.paymentType || 'pending',
      transferType: orderData.transferType || null, // Almacenar tipo de transferencia (nequi/bancolombia)
      cardType: orderData.cardType || null, // Almacenar tipo de tarjeta
      status: 'completed',
      // Inicializar pagos (se actualizan después)
      pago_efectivo: orderData.pago_efectivo || 0,
      pago_digital: orderData.pago_digital || 0,
      change: orderData.change || 0, // ✅ Agregar cambio
      paymentMethods: orderData.paymentMethods || [], // ✅ Agregar métodos de pago
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
      console.log('📝 Intentando actualizar ticket:', { ticketId, updates });
      
      // Actualizar en estado local primero
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, ...updates, updatedAt: new Date() } : t
      ));
      
      // Actualizar en Firestore si el usuario está autenticado
      if (user?.uid) {
        const ticketRef = doc(db, `users/${user.uid}/tickets`, ticketId);
        
        // Verificar que el documento existe antes de actualizar
        try {
          await updateDoc(ticketRef, {
            ...updates,
            updatedAt: new Date(),
          });
          console.log('✅ Ticket actualizado en Firestore:', ticketId, updates);
        } catch (firebaseError) {
          if (firebaseError.code === 'not-found') {
            console.error('❌ Documento no encontrado en Firestore. ID:', ticketId);
            console.error('📋 Tickets disponibles:', tickets.map(t => ({ id: t.id, ticketNumber: t.ticketNumber })));
          }
          throw firebaseError;
        }
      } else {
        console.warn('⚠️ Usuario no autenticado. Cambios solo locales.');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error actualizando ticket en Firebase:', error.message);
      throw error;
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      // Convertir ID a string para asegurar compatibilidad
      const stringId = String(ticketId);
      
      // Obtener el ticket para conseguir el orderId
      const ticketToDelete = tickets.find(t => String(t.id) === stringId);
      
      if (!ticketToDelete) {
        throw new Error('Ticket no encontrado');
      }

      console.log('🗑️ [ELIMINAR TICKET]', {
        ticketId: stringId,
        orderId: ticketToDelete.orderId
      });
      
      // Eliminar del estado local primero
      setTickets(prev => prev.filter(t => String(t.id) !== stringId));
      
      // Eliminar de Firestore si el usuario está autenticado
      if (user?.uid) {
        // 1️⃣ Eliminar el ticket
        const ticketRef = doc(db, `users/${user.uid}/tickets`, stringId);
        await deleteDoc(ticketRef);
        console.log('✅ Ticket eliminado de Firestore:', stringId);
        
        // 2️⃣ Eliminar la orden asociada también
        if (ticketToDelete.orderId) {
          try {
            const orderRef = doc(db, `users/${user.uid}/orders`, ticketToDelete.orderId);
            await deleteDoc(orderRef);
            console.log('✅ Orden asociada eliminada de Firestore:', ticketToDelete.orderId);
          } catch (orderError) {
            console.warn('⚠️ La orden podría no existir o ya fue eliminada:', orderError.message);
          }
        }
      } else {
        console.warn('⚠️ Usuario no autenticado. Cambios solo locales.');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error eliminando ticket:', error.message);
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
    deleteTicket,
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
