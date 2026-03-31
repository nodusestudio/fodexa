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
  const closeCash = async (finalCount, observations) => {
    if (!user || !cashSession) return null;
    
    try {
      const expectedAmount = calculateExpectedAmount();
      const difference = finalCount - expectedAmount;
      
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
      sessionMovements
        .filter(m => m.type === 'sale')
        .forEach(m => {
          const paymentType = m.paymentType || 'otros';
          if (!paymentBreakdown[paymentType]) {
            paymentBreakdown[paymentType] = 0;
          }
          paymentBreakdown[paymentType] += m.amount;
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
        difference: difference,
        observations: observations || '',
        status: 'closed',
        sales: sales,
        expenses: expensesAmount,
        paymentBreakdown: paymentBreakdown,
        saleCount: sessionMovements.filter(m => m.type === 'sale').length,
        expenseCount: sessionMovements.filter(m => m.type === 'expense').length,
      };
      
      // Guardar sesión cerrada en Firestore
      const docRef = await addDoc(collection(db, 'cashSessions'), closedSession);
      console.log('💾 Sesión cerrada y guardada en Firestore con ID:', docRef.id);
      
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
