import { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CashContext = createContext();

export const CashProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [cashSession, setCashSession] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sincronizar historial de sesiones desde Firestore
  useEffect(() => {
    if (!user) {
      setSessionHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'cashSessions'),
      where('userId', '==', user.uid),
      orderBy('closeDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        closeDate: doc.data().closeDate?.toDate ? doc.data().closeDate.toDate() : doc.data().closeDate,
        openDate: doc.data().openDate?.toDate ? doc.data().openDate.toDate() : doc.data().openDate,
      }));
      setSessionHistory(sessions);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching cash sessions:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Sincronizar gastos desde Firestore
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      return;
    }

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date,
      }));
      setExpenses(expensesData);
    }, (error) => {
      console.error('Error fetching expenses:', error);
    });

    return unsubscribe;
  }, [user]);

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
    addMovement('opening', initialAmount, 'Apertura de caja');
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
