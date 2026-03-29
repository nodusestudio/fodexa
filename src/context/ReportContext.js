import { createContext, useContext } from 'react';
import { useTickets } from './TicketContext';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const { tickets } = useTickets();
  const { products } = useProducts();
  const { user } = useAuth();

  // Filtrar tickets por usuario actual
  const getUserTickets = () => {
    return tickets?.filter(t => t.userId === 'shared' || t.userId === user?.uid) || [];
  };

  // Obtener ventas por rango de fechas
  const getSalesByDateRange = (startDate, endDate) => {
    const userTickets = getUserTickets();
    if (!userTickets) return [];
    return userTickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt || ticket.date || Date.now());
      return ticketDate >= startDate && ticketDate <= endDate && ticket.status !== 'cancelled';
    });
  };

  // Calcular métricas del período
  const getPeriodMetrics = (startDate, endDate) => {
    const sales = getSalesByDateRange(startDate, endDate);
    const totalSales = sales.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalOrders = sales.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Comparativo con período anterior
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const prevSales = getSalesByDateRange(prevStartDate, prevEndDate);
    const prevTotal = prevSales.reduce((sum, t) => sum + (t.total || 0), 0);
    const growth = prevTotal > 0 ? ((totalSales - prevTotal) / prevTotal) * 100 : 0;

    return {
      totalSales,
      totalOrders,
      averageTicket,
      growth,
      prevTotal,
    };
  };

  // Ventas por día (para gráfica)
  const getSalesByDay = (startDate, endDate) => {
    const sales = getSalesByDateRange(startDate, endDate);
    const days = {};
    
    // Inicializar todos los días del rango
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
      days[dateKey] = 0;
    }
    
    // Sumar ventas por día
    sales.forEach(ticket => {
      const ticketDate = new Date(ticket.createdAt || ticket.date || Date.now());
      const dateKey = ticketDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
      days[dateKey] = (days[dateKey] || 0) + (ticket.total || 0);
    });
    
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  };

  // Ventas por hora
  const getSalesByHour = (date) => {
    const userTickets = getUserTickets();
    const sales = userTickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt || ticket.date || Date.now());
      return ticketDate.toDateString() === date.toDateString() && ticket.status !== 'cancelled';
    });
    
    const hours = Array(24).fill(0);
    sales.forEach(ticket => {
      const hour = new Date(ticket.createdAt || ticket.date || Date.now()).getHours();
      hours[hour] += ticket.total || 0;
    });
    
    return hours.map((amount, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      amount,
    }));
  };

  // Ventas por categoría
  const getSalesByCategory = (startDate, endDate) => {
    const sales = getSalesByDateRange(startDate, endDate);
    const categories = {};
    
    sales.forEach(ticket => {
      if (ticket.items && Array.isArray(ticket.items)) {
        ticket.items.forEach(item => {
          const product = products.find(p => p.id === item.id);
          const categoryName = product?.category || 'Sin categoría';
          const itemTotal = (item.price * item.quantity) || 0;
          categories[categoryName] = (categories[categoryName] || 0) + itemTotal;
        });
      }
    });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Ventas por método de pago
  const getSalesByPaymentType = (startDate, endDate) => {
    const sales = getSalesByDateRange(startDate, endDate);
    const paymentTypes = {};
    
    sales.forEach(ticket => {
      const type = ticket.paymentType || 'Pendiente';
      paymentTypes[type] = (paymentTypes[type] || 0) + (ticket.total || 0);
    });
    
    return Object.entries(paymentTypes).map(([name, value]) => ({ name, value }));
  };

  // Top productos más vendidos
  const getTopProducts = (startDate, endDate, limit = 10) => {
    const sales = getSalesByDateRange(startDate, endDate);
    const productSales = {};
    
    sales.forEach(ticket => {
      if (ticket.items && Array.isArray(ticket.items)) {
        ticket.items.forEach(item => {
          if (!productSales[item.id]) {
            const product = products.find(p => p.id === item.id);
            productSales[item.id] = {
              id: item.id,
              name: product?.name || item.name || 'Producto',
              category: product?.category || 'Sin categoría',
              quantity: 0,
              total: 0,
            };
          }
          productSales[item.id].quantity += item.quantity || 0;
          productSales[item.id].total += (item.price * item.quantity) || 0;
        });
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  // Últimos pedidos
  const getRecentOrders = (limit = 10) => {
    if (!tickets || tickets.length === 0) return [];
    return tickets
      .slice()
      .reverse()
      .slice(0, limit)
      .map((ticket, idx) => ({
        ...ticket,
        ticketNumber: `#${String(tickets.length - idx).padStart(5, '0')}`,
      }));
  };

  // Obtener pedidos por tipo
  const getOrdersByType = (startDate, endDate) => {
    const sales = getSalesByDateRange(startDate, endDate);
    const types = {};
    
    sales.forEach(ticket => {
      const type = ticket.orderType || 'general';
      const typeLabel = type === 'table' ? 'Mesa' : type === 'delivery' ? 'Domicilio' : 'Llevar';
      types[typeLabel] = (types[typeLabel] || 0) + (ticket.total || 0);
    });
    
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  return (
    <ReportContext.Provider
      value={{
        getSalesByDateRange,
        getPeriodMetrics,
        getSalesByDay,
        getSalesByHour,
        getSalesByCategory,
        getSalesByPaymentType,
        getTopProducts,
        getRecentOrders,
        getOrdersByType,
        tickets,
        products,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports debe usarse dentro de ReportProvider');
  }
  return context;
};
