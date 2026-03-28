import { createContext, useContext, useState, useEffect } from 'react';

const CashContext = createContext();

export const CashProvider = ({ children }) => {
  const [cashSession, setCashSession] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [sessionHistory, setSessionHistory] = useState(() => {
    // Cargar historial de localStorage al inicializar
    try {
      const saved = localStorage.getItem('cashSessionHistory');
      const parsed = saved ? JSON.parse(saved) : [];
      console.log('📂 CashContext inicializado - Sesiones cargadas de localStorage:', parsed.length);
      return parsed;
    } catch (error) {
      console.error('❌ Error al cargar historial de localStorage:', error);
      return [];
    }
  });

  // Abrir caja
  const openCash = (initialAmount, notes) => {
    const session = {
      id: Date.now(),
      openDate: new Date(),
      openUser: 'Cajero Demo',
      initialAmount: parseFloat(initialAmount) || 0,
      notes: notes || '',
      status: 'open',
    };
    setCashSession(session);
    console.log('📂 Caja abierta - ID:', session.id, 'Monto inicial: $', session.initialAmount);
    
    // Registrar movimiento de apertura
    addMovement('opening', initialAmount, 'Apertura de caja');
    
    return session;
  };

  // Cerrar caja
  const closeCash = (finalCount, observations) => {
    if (!cashSession) return null;
    
    const expectedAmount = calculateExpectedAmount();
    const difference = finalCount - expectedAmount;
    
    // Calcular ventas y egresos de esta sesión
    const sessionMovements = cashMovements.filter(m => 
      new Date(m.date) >= new Date(cashSession.openDate)
    );
    
    const sales = sessionMovements
      .filter(m => m.type === 'sale')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expenses = sessionMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    // Desglose de pagos por tipo
    const paymentBreakdown = {};
    sessionMovements
      .filter(m => m.type === 'sale')
      .forEach(m => {
        const paymentType = m.paymentType || 'otros';
        if (!paymentBreakdown[paymentType]) {
          paymentBreakdown[paymentType] = 0;
        }
        paymentBreakdown[paymentType] += m.amount;
      });

    // Total de egresos (en efectivo, se asume que todos los egresos salen de efectivo)
    const expensesInCash = expenses;
    
    const closeDate = new Date();
    const closedSession = {
      ...cashSession,
      closeDate: closeDate.toISOString(), // Guardar como ISO string para consistencia
      closeDateLocal: closeDate.toLocaleString('es-CO'), // Para mostrar al usuario
      closeUser: 'Cajero Demo',
      finalCount: parseFloat(finalCount) || 0,
      expectedAmount: expectedAmount,
      difference: difference,
      observations: observations || '',
      status: 'closed',
      sales: sales,
      expenses: expenses,
      expensesInCash: expensesInCash,
      paymentBreakdown: paymentBreakdown,
      saleCount: sessionMovements.filter(m => m.type === 'sale').length,
      expenseCount: sessionMovements.filter(m => m.type === 'expense').length,
    };
    
    // Agregar a historial ANTES de resetear la sesión
    setSessionHistory(prev => {
      const updated = [...prev, closedSession];
      try {
        localStorage.setItem('cashSessionHistory', JSON.stringify(updated));
        console.log('💾 Sesión cerrada y guardada en localStorage');
        console.log('   ID:', closedSession.id);
        console.log('   Ventas: $', closedSession.sales);
        console.log('   Egresos: $', closedSession.expenses);
        console.log('   Desglose:', closedSession.paymentBreakdown);
        console.log('   Total en historial:', updated.length, 'sesiones');
      } catch (error) {
        console.error('❌ Error guardando sesión en localStorage:', error);
      }
      return updated;
    });
    
    setCashSession(null);
    
    // Registrar movimiento de cierre
    addMovement('closing', finalCount, 'Cierre de caja');
    
    return closedSession;
  };

  // Registrar egreso
  const addExpense = (data) => {
    const expense = {
      id: Date.now(),
      amount: parseFloat(data.amount) || 0,
      category: data.category || 'otros',
      description: data.description || '',
      date: new Date(),
      user: 'Cajero Demo',
    };
    
    setExpenses(prev => [...prev, expense]);
    addMovement('expense', expense.amount, `Egreso: ${expense.description}`);
    
    return expense;
  };

  // Registrar movimiento
  const addMovement = (type, amount, description, metadata = {}) => {
    const movement = {
      id: Date.now(),
      type, // 'opening', 'closing', 'sale', 'expense', 'refund'
      amount: parseFloat(amount) || 0,
      description,
      date: new Date(),
      user: 'Cajero Demo',
      ...metadata, // Incluir metadatos como paymentType, etc
    };
    
    setCashMovements(prev => [...prev, movement]);
    return movement;
  };

  // Calcular monto esperado en caja
  const calculateExpectedAmount = () => {
    if (!cashSession) return 0;
    
    const sales = cashMovements
      .filter(m => m.type === 'sale')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expenses = cashMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const refunds = cashMovements
      .filter(m => m.type === 'refund')
      .reduce((sum, m) => sum + m.amount, 0);
    
    return cashSession.initialAmount + sales - expenses - refunds;
  };

  // Obtener resumen de caja
  const getCashSummary = () => {
    if (!cashSession) return null;
    
    // Filtrar movimientos después de la apertura de caja
    const sessionMovements = cashMovements.filter(m => 
      m.id !== cashSession.id && // Excluir el movimiento de apertura del resumen
      new Date(m.date) >= new Date(cashSession.openDate) &&
      m.type !== 'opening' // No contar la apertura en resumen
    );
    
    const sales = sessionMovements
      .filter(m => m.type === 'sale')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expenses = sessionMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);
    
    return {
      initialAmount: cashSession.initialAmount,
      sales,
      expenses,
      expected: cashSession.initialAmount + sales - expenses,
      movementsCount: sessionMovements.length,
    };
  };

  // Obtener egresos del día
  const getTodayExpenses = () => {
    const today = new Date().toDateString();
    return expenses.filter(e => new Date(e.date).toDateString() === today);
  };

  // Obtener todas las sesiones cerradas del historial
  const getSessionHistory = () => {
    return sessionHistory;
  };

  // Obtener sesión por ID
  const getSessionById = (id) => {
    return sessionHistory.find(s => s.id === id);
  };

  // Obtener sesiones por rango de fechas
  const getSessionsByDateRange = (startDate, endDate) => {
    return sessionHistory.filter(session => {
      if (!session.closeDate) return false;
      const sessionDate = new Date(session.closeDate);
      return sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate);
    });
  };

  // Obtener resumen del período
  const getPeriodSummary = (startDate, endDate) => {
    const sessions = getSessionsByDateRange(startDate, endDate);
    return {
      totalSessions: sessions.length,
      totalSales: sessions.reduce((sum, s) => sum + (s.sales || 0), 0),
      totalExpenses: sessions.reduce((sum, s) => sum + (s.expenses || 0), 0),
      totalDifference: sessions.reduce((sum, s) => sum + (s.difference || 0), 0),
    };
  };

  // Obtener historial de sesiones
  const addToHistory = (session) => {
    setSessionHistory(prev => {
      const updated = [...prev, session];
      // Guardar en localStorage
      try {
        localStorage.setItem('cashSessionHistory', JSON.stringify(updated));
        console.log('💾 Historial guardado en localStorage:', updated.length, 'sesiones');
      } catch (error) {
        console.error('Error guardando en localStorage:', error);
      }
      return updated;
    });
  };

  // useEffect para guardar sessionHistory en localStorage cuando cambie
  useEffect(() => {
    if (sessionHistory.length > 0) {
      try {
        localStorage.setItem('cashSessionHistory', JSON.stringify(sessionHistory));
      } catch (error) {
        console.error('Error guardando en localStorage:', error);
      }
    }
  }, [sessionHistory]);

  const value = {
    cashSession,
    expenses,
    cashMovements,
    sessionHistory,
    openCash,
    closeCash,
    addExpense,
    addMovement,
    calculateExpectedAmount,
    getCashSummary,
    getTodayExpenses,
    getSessionHistory,
    getSessionById,
    getSessionsByDateRange,
    getPeriodSummary,
    addToHistory,
    isCashOpen: !!cashSession,
  };

  return (
    <CashContext.Provider value={value}>
      {children}
    </CashContext.Provider>
  );
};

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error('useCash debe usarse dentro de CashProvider');
  }
  return context;
};
