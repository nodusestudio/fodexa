import { createContext, useContext, useState } from 'react';
import { useSettings } from './SettingsContext';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
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
      id: Date.now(),
      ticketNumber: generateTicketNumber(),
      orderId: orderData.id,
      orderType: orderData.type,
      tableNumber: orderData.tableNumber || null,
      customer: deliveryData, // legacy/compat
      deliveryData: deliveryData, // para TicketPrint
      items: orderData.items,
      subtotal,
      iva,
      deliveryCost,
      total,
      paymentType: orderData.paymentType || 'pending',
      status: 'completed',
      createdAt: new Date(),
    };
    setTickets(prev => [...prev, newTicket]);
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
