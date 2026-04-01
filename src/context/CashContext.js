import { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { mockExpenses } from '../data/mockFirebaseData';

const CashContext = createContext();

export const CashProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [cashSession, setCashSession] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar gastos de prueba cuando hay usuario
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setSessionHistory([]);
      setLoading(false);
      return;
    }

    // Agregar userId e id a los mockExpenses
    const expensesWithId = mockExpenses.map((expense, i) => ({
      id: `expense_${i}`,
      userId: user.uid,
      timestamp: new Date(),
      ...expense
    }));

    setExpenses(expensesWithId);
    setLoading(false);
  }, [user]);

  // ✅ Cargar sesiones cerradas desde Firestore (Libro Contable)
  useEffect(() => {
    if (!user) {
      setSessionHistory([]);
      return;
    }

    const q = query(
      collection(db, 'cashSessions'),
      where('userId', '==', user.uid),
      orderBy('closeDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          closeDate: doc.data().closeDate?.toDate?.() || new Date(doc.data().closeDate),
          openDate: doc.data().openDate?.toDate?.() || new Date(doc.data().openDate),
        }));
        setSessionHistory(sessions);
        console.log('📊 Sesiones cargadas del Libro Contable:', sessions.length);
      },
      (error) => {
        console.warn('⚠️ Error cargando sesiones cerradas:', error.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Abrir caja
  const openCash = (cashData) => {
    // Aceptar objeto con los nuevos parámetros
    const initialAmount = typeof cashData === 'number' ? cashData : (cashData?.initialAmount || 0);
    const notes = typeof cashData === 'string' ? cashData : (cashData?.notes || '');
    const fundAmount = cashData?.fundAmount || 0;
    const breakdown = cashData?.breakdown || {};
    const openedAt = cashData?.openedAt || new Date();

    const session = {
      id: Date.now(),
      openDate: openedAt,
      openDateLocal: openedAt.toLocaleString('es-CO'),
      openUser: 'Cajero Demo',
      initialAmount: parseFloat(initialAmount) || 0,
      fundAmount: parseFloat(fundAmount) || 0,
      breakdown: breakdown,
      notes: notes || '',
      status: 'open',
      expenses: [], // Array de egresos
    };
    setCashSession(session);
    console.log('📂 Caja abierta - ID:', session.id, 'Capital:', session.initialAmount, 'Fondo:', session.fundAmount);
    addMovement('opening', initialAmount, 'Apertura de ca ja');
    return session;
  };

  // Cerrar caja
  const closeCash = async (finalCount, observations, dayExpenses = []) => {
    if (!user || !cashSession) return null;
    
    try {
      const expectedAmount = calculateExpectedAmount();
      
      // Calcular total de egresos
      const totalExpensesAmount = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      // La diferencia es el conteo final menos el monto esperado
      const difference = finalCount - (expectedAmount - totalExpensesAmount);
      
      const sessionMovements = cashMovements.filter(m => 
        new Date(m.date) >= new Date(cashSession.openDate)
      );
      
      const sales = sessionMovements
        .filter(m => m.type === 'sale')
        .reduce((sum, m) => sum + m.amount, 0);
      
      const expensesAmount = sessionMovements
        .filter(m => m.type === 'expense')
        .reduce((sum, m) => sum + m.amount, 0);

      const paymentBreakdown = {};
      const paymentMethods = {
        efectivo: { ingresos: 0, egresos: 0 },
        bancolombia: { ingresos: 0, egresos: 0 },
        nequi: { ingresos: 0, egresos: 0 },
        bold: { ingresos: 0, egresos: 0 },
        aliado: { ingresos: 0, egresos: 0 },
      };

      // Procesar movimientos de venta
      sessionMovements
        .filter(m => m.type === 'sale')
        .forEach(m => {
          const paymentType = m.paymentType || 'otros';
          
          // Construir paymentBreakdown clásico
          if (!paymentBreakdown[paymentType]) {
            paymentBreakdown[paymentType] = 0;
          }
          paymentBreakdown[paymentType] += m.amount;

          // Desglosar en paymentMethods para ingresos
          if (m.paymentType === 'cash') {
            paymentMethods.efectivo.ingresos += m.amount;
          } else if (m.paymentType === 'card') {
            paymentMethods.bancolombia.ingresos += m.amount;
          } else if (m.paymentType === 'transfer') {
            // Usar transferType del metadata para separar Nequi y Bancolombia
            if (m.transferType === 'nequi') {
              paymentMethods.nequi.ingresos += m.amount;
            } else if (m.transferType === 'bancolombia') {
              paymentMethods.bancolombia.ingresos += m.amount;
            } else {
              // Por defecto si no está especificado
              paymentMethods.nequi.ingresos += m.amount;
            }
          } else if (m.paymentType === 'bold') {
            paymentMethods.bold.ingresos += m.amount;
          } else if (m.paymentType === 'aliado') {
            paymentMethods.aliado.ingresos += m.amount;
          } else {
            // Otros métodos default a efectivo
            paymentMethods.efectivo.ingresos += m.amount;
          }
        });

      // Procesar egresos (expenses)
      // Los egresos se distribuyen proporcionalmente o de forma específica según el tipo
      dayExpenses?.forEach(expense => {
        const category = expense.category?.toLowerCase() || 'otros';
        if (category === 'efectivo' || category === 'cash') {
          paymentMethods.efectivo.egresos += (expense.amount || 0);
        } else if (category === 'bancolombia' || category === 'card' || category === 'banco') {
          paymentMethods.bancolombia.egresos += (expense.amount || 0);
        } else if (category === 'nequi') {
          paymentMethods.nequi.egresos += (expense.amount || 0);
        } else if (category === 'bold') {
          paymentMethods.bold.egresos += (expense.amount || 0);
        } else if (category === 'aliado') {
          paymentMethods.aliado.egresos += (expense.amount || 0);
        } else {
          // Otros gastos se distribuyen al efectivo
          paymentMethods.efectivo.egresos += (expense.amount || 0);
        }
      });

      const closeDate = new Date();
      const closedSession = {
        ...cashSession,
        userId: user.uid,
        closeDate: closeDate,
        closeDateLocal: closeDate.toLocaleString('es-CO'),
        closeUser: 'Cajero Demo',
        finalCount: parseFloat(finalCount) || 0,
        expectedAmount: expectedAmount,
        totalExpenses: totalExpensesAmount,
        dayExpenses: dayExpenses, // Guardar detalle de egresos
        difference: difference,
        observations: observations || '',
        status: 'closed',
        sales: sales,
        expenses: expensesAmount,
        paymentBreakdown: paymentBreakdown,
        paymentMethods: paymentMethods, // Incluir desglose detallado por método
        saleCount: sessionMovements.filter(m => m.type === 'sale').length,
        expenseCount: sessionMovements.filter(m => m.type === 'expense').length,
      };
      
      // Guardar sesión cerrada en Firestore
      const docRef = await addDoc(collection(db, 'cashSessions'), closedSession);
      console.log('💾 Sesión cerrada y guardada en Firestore con ID:', docRef.id);
      console.log('📤 Egresos del día:', dayExpenses, 'Total:', totalExpensesAmount);
      
      setCashSession(null);
      addMovement('closing', finalCount, 'Cierre de caja');
      
      return { id: docRef.id, ...closedSession };
    } catch (error) {
      console.error('Error closing cash session:', error);
      throw error;
    }
  };

  // Registrar egreso en Firestore
  const addExpense = async (data) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const expense = {
        userId: user.uid,
        amount: parseFloat(data.amount) || 0,
        category: data.category || 'otros',
        description: data.description || '',
        date: new Date(),
        user: 'Cajero Demo',
      };
      
      const docRef = await addDoc(collection(db, 'expenses'), expense);
      addMovement('expense', expense.amount, `Egreso: ${expense.description}`);
      
      return { id: docRef.id, ...expense };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  // Registrar movimiento (local, para sesión actual)
  const addMovement = (type, amount, description, metadata = {}) => {
    const movement = {
      id: Date.now(),
      type,
      amount: parseFloat(amount) || 0,
      description,
      date: new Date(),
      user: 'Cajero Demo',
      ...metadata,
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
    
    const expensesAmount = cashMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const refunds = cashMovements
      .filter(m => m.type === 'refund')
      .reduce((sum, m) => sum + m.amount, 0);
    
    return cashSession.initialAmount + sales - expensesAmount - refunds;
  };

  // Obtener resumen de caja
  const getCashSummary = () => {
    if (!cashSession) return null;
    
    const sessionMovements = cashMovements.filter(m => 
      m.id !== cashSession.id &&
      new Date(m.date) >= new Date(cashSession.openDate) &&
      m.type !== 'opening'
    );
    
    const sales = sessionMovements
      .filter(m => m.type === 'sale')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expensesAmount = sessionMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);
    
    return {
      initialAmount: cashSession.initialAmount,
      sales,
      expenses: expensesAmount,
      expected: cashSession.initialAmount + sales - expensesAmount,
      movementsCount: sessionMovements.length,
    };
  };

  // Obtener egresos del día
  const getTodayExpenses = () => {
    const today = new Date().toDateString();
    return expenses.filter(e => new Date(e.date).toDateString() === today);
  };

  // Obtener todas las sesiones cerradas
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

  const value = {
    cashSession,
    expenses,
    cashMovements,
    sessionHistory,
    loading,
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
