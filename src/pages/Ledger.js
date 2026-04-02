import React, { useState, useMemo } from 'react';
import { useCash } from '../context/CashContext';
import { useSettings } from '../context/SettingsContext';
import { FileText, Calendar, TrendingUp, DollarSign, Filter, ChevronDown, Trash2 } from 'lucide-react';

const Ledger = () => {
  const { getSessionsByDateRange, getPeriodSummary, sessionHistory } = useCash();
  const { resetUserData } = useSettings();
  const [isResetting, setIsResetting] = useState(false);
  
  // Función para resetear datos
  const handleResetData = () => {
    const confirmed = window.confirm(
      '⚠️ ¿ESTÁS SEGURO?\n\n' +
      'Se eliminarán TODOS los datos:\n' +
      '✂️ Órdenes\n' +
      '✂️ Tickets\n' +
      '✂️ Caja y Gastos\n' +
      '✂️ LIBRO CONTABLE\n' +
      '✂️ Reportes\n\n' +
      '✅ Se preservarán: Clientes y Artículos\n\n' +
      'Escribe "ELIMINAR" para confirmar.'
    );

    if (!confirmed) return;

    const secondConfirm = window.prompt(
      'Escribe "ELIMINAR" para confirmar definitivamente:'
    );

    if (secondConfirm !== 'ELIMINAR') {
      alert('❌ Operación cancelada');
      return;
    }

    setIsResetting(true);
    resetUserData();
  };
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [expandedView, setExpandedView] = useState('mayor'); // 'mayor' or 'daily'
  const [mayorFilterType, setMayorFilterType] = useState('week'); // 'day', 'week', 'month', 'year'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [tempEndDate, setTempEndDate] = useState(new Date());
  const [customDateRange, setCustomDateRange] = useState(null);
  
  // Estados para vista Diario
  const [showDailyDatePicker, setShowDailyDatePicker] = useState(false);
  const [dailyCalendarMonth, setDailyCalendarMonth] = useState(new Date());
  const [dailyTempStartDate, setDailyTempStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [dailyTempEndDate, setDailyTempEndDate] = useState(new Date());
  const [dailyCustomDateRange, setDailyCustomDateRange] = useState(null);

  // Generar todas las sesiones con datos de ejemplo si no hay datos reales
  const allSessions = useMemo(() => {
    if (!sessionHistory || sessionHistory.length === 0) {
      // Datos de ejemplo para 7 últimos días
      const mockSessions = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(Math.floor(Math.random() * 7) + 8, 0, 0, 0);
        
        const closeDate = new Date(date);
        closeDate.setHours(closeDate.getHours() + (Math.floor(Math.random() * 10) + 8));

        const sales = Math.floor(Math.random() * 2000) + 500;
        const expenses = Math.floor(sales * 0.15);
        
        // Desglose detallado por método de pago
        const cashAmount = Math.floor(sales * 0.5);
        const bankAmount = Math.floor(sales * 0.25);
        const nequiAmount = Math.floor(sales * 0.15);
        const boldAmount = Math.floor(sales * 0.07);
        const aliadoAmount = sales - cashAmount - bankAmount - nequiAmount - boldAmount;

        mockSessions.push({
          id: `mock_${i}`,
          openDate: date,
          closeDate: closeDate,
          initialAmount: 500000,
          sales: sales,
          expenses: expenses,
          difference: Math.floor(Math.random() * 10000) - 5000,
          paymentBreakdown: {
            cash: cashAmount,
            card: bankAmount,
            transfer: nequiAmount,
          },
          // Desglose detallado para vista diaria
          paymentMethods: {
            efectivo: { ingresos: cashAmount, egresos: Math.floor(expenses * 0.3) },
            bancolombia: { ingresos: bankAmount, egresos: Math.floor(expenses * 0.25) },
            nequi: { ingresos: nequiAmount, egresos: Math.floor(expenses * 0.2) },
            bold: { ingresos: boldAmount, egresos: Math.floor(expenses * 0.15) },
            aliado: { ingresos: aliadoAmount, egresos: Math.floor(expenses * 0.1) },
          },
          status: 'closed',
        });
      }
      return mockSessions;
    }
    return sessionHistory;
  }, [sessionHistory]);

  // Calcular rango de fechas para Libro Mayor según el filtro seleccionado
  const mayorDateRange = useMemo(() => {
    // Si hay un rango personalizado, usarlo
    if (customDateRange) {
      return { start: customDateRange.start, end: customDateRange.end };
    }

    const end = new Date();
    const start = new Date();
    
    switch (mayorFilterType) {
      case 'day':
        // Un solo día
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        // Últimos 7 días
        start.setDate(end.getDate() - 6);
        break;
      case 'month':
        // Mes actual
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        // Año actual
        start.setMonth(0);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start.setDate(start.getDate() - 6);
    }
    
    return { start, end };
  }, [mayorFilterType, customDateRange]);

  // Calcular rango de fechas para vista semanal (últimos 7 días)
  const weekDateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { start, end };
  }, []);

  // Calcular rango de fechas para mes seleccionado
  const monthDateRange = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const start = new Date(year, parseInt(month) - 1, 1);
    const end = new Date(year, parseInt(month), 0, 23, 59, 59);
    return { start, end };
  }, [selectedMonth]);

  // Rango de fechas para día seleccionado
  const dailyDateRange = useMemo(() => {
    const [year, month, day] = selectedDay.split('-');
    const start = new Date(year, parseInt(month) - 1, parseInt(day), 0, 0, 0);
    const end = new Date(year, parseInt(month) - 1, parseInt(day), 23, 59, 59);
    return { start, end };
  }, [selectedDay]);

  // Filtrar sesiones según la vista
  const filteredSessions = useMemo(() => {
    let dateRange;
    if (expandedView === 'mayor') {
      dateRange = mayorDateRange;
    } else if (expandedView === 'daily') {
      dateRange = dailyDateRange;
    }
    
    return allSessions.filter(session => {
      const closeDate = new Date(session.closeDate);
      return closeDate >= dateRange.start && closeDate <= dateRange.end;
    });
  }, [allSessions, expandedView, mayorDateRange, dailyDateRange]);

  // Agrupar sesiones por semanas de 7 días
  const sessionsByWeeks = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    let weekStartDate = null;
    
    // Filtrar sesiones por rango personalizado si está disponible
    let sessionsToUse = allSessions;
    if (dailyCustomDateRange) {
      sessionsToUse = allSessions.filter(session => {
        const sessionDate = new Date(session.closeDate);
        return sessionDate >= dailyCustomDateRange.start && sessionDate <= dailyCustomDateRange.end;
      });
    }
    
    const allSessionsSorted = [...sessionsToUse].sort((a, b) => 
      new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()
    );
    
    allSessionsSorted.forEach((session, index) => {
      if (currentWeek.length === 0) {
        weekStartDate = new Date(session.closeDate);
      }
      
      currentWeek.push(session);
      
      // Cada 7 días o al final de las sesiones
      if (currentWeek.length === 7 || index === allSessionsSorted.length - 1) {
        weeks.push({
          startDate: weekStartDate,
          sessions: [...currentWeek]
        });
        currentWeek = [];
      }
    });
    
    return weeks;
  }, [allSessions, dailyCustomDateRange]);

  // Calcular resumen
  const summary = useMemo(() => {
    const totalSales = filteredSessions.reduce((sum, s) => sum + (s.sales || 0), 0);
    const totalExpenses = filteredSessions.reduce((sum, s) => sum + (s.expenses || 0), 0);
    const totalDifference = filteredSessions.reduce((sum, s) => sum + (s.difference || 0), 0);
    const balance = totalSales - totalExpenses;

    // Breakdown por método de pago
    const paymentBreakdown = {
      cash: 0,
      card: 0,
      transfer: 0,
    };

    filteredSessions.forEach(session => {
      if (session.paymentBreakdown) {
        paymentBreakdown.cash += session.paymentBreakdown.cash || 0;
        paymentBreakdown.card += session.paymentBreakdown.card || 0;
        paymentBreakdown.transfer += session.paymentBreakdown.transfer || 0;
      }
    });

    return {
      totalSales,
      totalExpenses,
      totalDifference,
      balance,
      paymentBreakdown,
      sessionCount: filteredSessions.length,
    };
  }, [filteredSessions]);

  // Generar meses disponibles
  const availableMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push({
        value: `${year}-${month}`,
        label: new Date(year, date.getMonth()).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      });
    }
    return months;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <FileText size={24} className="sm:w-9 sm:h-9 text-blue-600 dark:text-blue-400" />
              Libro Mayor
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-2">
              Estado detallado de caja por día
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Saldo Total - Compacto en Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-xl p-3 sm:p-4 text-white shadow-lg flex flex-col items-center justify-center min-w-fit">
              <p className="text-blue-100 text-xs font-medium mb-0.5 sm:mb-1">💰 Saldo Total</p>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold">${summary.balance.toLocaleString('es-CO')}</h2>
              <p className="text-blue-100 text-xs mt-0.5 sm:mt-1">
                {expandedView === 'mayor' && mayorFilterType === 'day' && 'Hoy'}
                {expandedView === 'mayor' && mayorFilterType === 'week' && 'Esta semana'}
                {expandedView === 'mayor' && mayorFilterType === 'month' && 'Este mes'}
                {expandedView === 'mayor' && mayorFilterType === 'year' && 'Este año'}
                {expandedView === 'daily' && 'Hoy'}
              </p>
            </div>
            {/* Botón de Reset */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
            >
              {isResetting && <span className="animate-spin">⏳</span>}
              {isResetting ? 'Limpiando...' : '🗑️ Limpiar Todo'}
            </button>
          </div>
        </div>

        {/* Vista Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpandedView('mayor')}
            className={`px-2 sm:px-4 py-2 sm:py-3 font-medium border-b-2 transition-colors text-xs sm:text-sm ${
              expandedView === 'mayor'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📊 Libro Mayor
          </button>
          <button
            onClick={() => setExpandedView('daily')}
            className={`px-2 sm:px-4 py-2 sm:py-3 font-medium border-b-2 transition-colors text-xs sm:text-sm ${
              expandedView === 'daily'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📋 Diario
          </button>
        </div>

        {/* Selector de Rango para Libro Mayor */}
        {expandedView === 'mayor' && (
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <Calendar size={14} className="sm:w-4 sm:h-4" />
              Seleccionar Rango
            </button>

            {/* Modal de Selector de Rango */}
            {showDatePicker && (
              <div className="mt-2 sm:mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {/* Calendario Compacto */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                      >
                        &lt;
                      </button>
                      <h3 className="text-gray-900 dark:text-white font-bold text-xs text-center flex-1">
                        {calendarMonth.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                      >
                        &gt;
                      </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-0.5 text-center text-2xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
                        <div key={day} className="text-2xs">{day}</div>
                      ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-0.5 text-center text-2xs">
                      {(() => {
                        const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
                        const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                        const prevDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0).getDate();
                        const days = [];

                        // Días del mes anterior
                        for (let i = firstDay - 1; i >= 0; i--) {
                          days.push(
                            <div key={`prev-${i}`} className="py-0.5 text-gray-400 dark:text-gray-600 text-2xs">
                              {prevDays - i}
                            </div>
                          );
                        }

                        // Días del mes actual
                        for (let i = 1; i <= daysInMonth; i++) {
                          const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i);
                          const isSelected = (tempStartDate.toDateString() === date.toDateString()) || (tempEndDate.toDateString() === date.toDateString());
                          const isInRange = date >= tempStartDate && date <= tempEndDate;
                          const isToday = new Date().toDateString() === date.toDateString();

                          days.push(
                            <button
                              key={i}
                              onClick={() => {
                                if (!tempStartDate || date < tempStartDate) {
                                  setTempStartDate(date);
                                  setTempEndDate(date);
                                } else if (date > tempEndDate) {
                                  setTempEndDate(date);
                                } else {
                                  setTempStartDate(date);
                                  setTempEndDate(date);
                                }
                              }}
                              className={`py-0.5 rounded text-2xs font-medium transition-colors ${
                                isSelected
                                  ? 'bg-green-500 text-white'
                                  : isInRange
                                  ? 'bg-green-200 dark:bg-green-900 text-gray-900 dark:text-white'
                                  : isToday
                                  ? 'bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white'
                                  : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Días del próximo mes
                        const totalSlots = days.length;
                        for (let i = 1; totalSlots + i <= 42; i++) {
                          days.push(
                            <div key={`next-${i}`} className="py-0.5 text-gray-400 dark:text-gray-600 text-2xs">
                              {i}
                            </div>
                          );
                        }

                        return days;
                      })()}
                    </div>

                    <div className="mt-2 text-2xs text-gray-600 dark:text-gray-400">
                      <div className="leading-tight">Inicio:</div>
                      <div className="font-bold text-gray-900 dark:text-white text-2xs">{tempStartDate.toLocaleDateString('es-CO')}</div>
                      <div className="leading-tight mt-1">Fin:</div>
                      <div className="font-bold text-gray-900 dark:text-white text-2xs">{tempEndDate.toLocaleDateString('es-CO')}</div>
                    </div>
                  </div>

                  {/* Opciones Predefinidas Compactas */}
                  <div className="sm:col-span-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs">Opciones Rápidas</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Hoy', value: 'day' },
                        { label: 'Ayer', value: 'yesterday' },
                        { label: 'Esta semana', value: 'week' },
                        { label: 'Última semana', value: 'lastWeek' },
                        { label: 'Este mes', value: 'month' },
                        { label: 'Último mes', value: 'lastMonth' },
                        { label: 'Últ. 7 días', value: 'last7' },
                        { label: 'Últ. 30 días', value: 'last30' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            const today = new Date();
                            let start = new Date();
                            let end = new Date();

                            switch (option.value) {
                              case 'day':
                                start = new Date();
                                end = new Date();
                                break;
                              case 'yesterday':
                                start = new Date();
                                start.setDate(start.getDate() - 1);
                                end = new Date(start);
                                break;
                              case 'week':
                                start = new Date();
                                start.setDate(start.getDate() - 6);
                                end = new Date();
                                break;
                              case 'lastWeek':
                                end = new Date();
                                end.setDate(end.getDate() - 7);
                                start = new Date(end);
                                start.setDate(start.getDate() - 6);
                                break;
                              case 'month':
                                start = new Date(today.getFullYear(), today.getMonth(), 1);
                                end = new Date();
                                break;
                              case 'lastMonth':
                                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                end = new Date(today.getFullYear(), today.getMonth(), 0);
                                break;
                              case 'last7':
                                end = new Date();
                                start = new Date();
                                start.setDate(start.getDate() - 6);
                                break;
                              case 'last30':
                                end = new Date();
                                start = new Date();
                                start.setDate(start.getDate() - 29);
                                break;
                              default:
                                start = new Date();
                                end = new Date();
                            }

                            setTempStartDate(start);
                            setTempEndDate(end);
                            // Guardar y cerrar automáticamente
                            setCustomDateRange({ start, end });
                            setShowDatePicker(false);
                          }}
                          className="px-2 py-1.5 rounded text-2xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors font-medium"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {/* Nota de limitación */}
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded text-2xs text-blue-900 dark:text-blue-100">
                      <span className="font-medium">ℹ️ Datos limitados a últimos 31 días.</span>
                    </div>

                    {/* Botones de Acción */}
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded text-2xs font-medium transition-colors hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        CANCELAR
                      </button>
                      <button
                        onClick={() => {
                          setCustomDateRange({
                            start: tempStartDate,
                            end: tempEndDate
                          });
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-2xs font-medium transition-colors"
                      >
                        ACEPTAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}







        {/* Selector de Rango para Diario */}
        {expandedView === 'daily' && (
          <div className="mb-6">
            <button
              onClick={() => setShowDailyDatePicker(!showDailyDatePicker)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Calendar size={16} />
              Seleccionar Rango
            </button>

            {/* Modal de Selector de Rango para Diario */}
            {showDailyDatePicker && (
              <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {/* Calendario Compacto */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setDailyCalendarMonth(new Date(dailyCalendarMonth.getFullYear(), dailyCalendarMonth.getMonth() - 1))}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                      >
                        &lt;
                      </button>
                      <h3 className="text-gray-900 dark:text-white font-bold text-xs text-center flex-1">
                        {dailyCalendarMonth.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => setDailyCalendarMonth(new Date(dailyCalendarMonth.getFullYear(), dailyCalendarMonth.getMonth() + 1))}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                      >
                        &gt;
                      </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-0.5 text-center text-2xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
                        <div key={day} className="text-2xs">{day}</div>
                      ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-0.5 text-center text-2xs">
                      {(() => {
                        const firstDay = new Date(dailyCalendarMonth.getFullYear(), dailyCalendarMonth.getMonth(), 1).getDay();
                        const daysInMonth = new Date(dailyCalendarMonth.getFullYear(), dailyCalendarMonth.getMonth() + 1, 0).getDate();
                        const prevDays = new Date(dailyCalendarMonth.getFullYear(), dailyCalendarMonth.getMonth(), 0).getDate();
                        const days = [];

                        for (let i = firstDay - 1; i >= 0; i--) {
                          days.push(
                            <div key={`prev-${i}`} className="py-0.5 text-gray-400 dark:text-gray-600 text-2xs">
                              {prevDays - i}
                            </div>
                          );
                        }

                        for (let i = 1; i <= daysInMonth; i++) {
                          const date = new Date(dailyCalendarMonth.getFullYear(), dailyCalendarMonth.getMonth(), i);
                          const isSelected = (dailyTempStartDate.toDateString() === date.toDateString()) || (dailyTempEndDate.toDateString() === date.toDateString());
                          const isInRange = date >= dailyTempStartDate && date <= dailyTempEndDate;
                          const isToday = new Date().toDateString() === date.toDateString();

                          days.push(
                            <button
                              key={i}
                              onClick={() => {
                                if (!dailyTempStartDate || date < dailyTempStartDate) {
                                  setDailyTempStartDate(date);
                                  setDailyTempEndDate(date);
                                } else if (date > dailyTempEndDate) {
                                  setDailyTempEndDate(date);
                                } else {
                                  setDailyTempStartDate(date);
                                  setDailyTempEndDate(date);
                                }
                              }}
                              className={`py-0.5 rounded text-2xs font-medium transition-colors ${
                                isSelected
                                  ? 'bg-green-500 text-white'
                                  : isInRange
                                  ? 'bg-green-200 dark:bg-green-900 text-gray-900 dark:text-white'
                                  : isToday
                                  ? 'bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white'
                                  : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        const totalSlots = days.length;
                        for (let i = 1; totalSlots + i <= 42; i++) {
                          days.push(
                            <div key={`next-${i}`} className="py-0.5 text-gray-400 dark:text-gray-600 text-2xs">
                              {i}
                            </div>
                          );
                        }

                        return days;
                      })()}
                    </div>

                    <div className="mt-2 text-2xs text-gray-600 dark:text-gray-400">
                      <div className="leading-tight">Inicio:</div>
                      <div className="font-bold text-gray-900 dark:text-white text-2xs">{dailyTempStartDate.toLocaleDateString('es-CO')}</div>
                      <div className="leading-tight mt-1">Fin:</div>
                      <div className="font-bold text-gray-900 dark:text-white text-2xs">{dailyTempEndDate.toLocaleDateString('es-CO')}</div>
                    </div>
                  </div>

                  {/* Opciones Predefinidas */}
                  <div className="sm:col-span-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-xs">Opciones Rápidas</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Hoy', value: 'day' },
                        { label: 'Ayer', value: 'yesterday' },
                        { label: 'Esta semana', value: 'week' },
                        { label: 'Última semana', value: 'lastWeek' },
                        { label: 'Este mes', value: 'month' },
                        { label: 'Último mes', value: 'lastMonth' },
                        { label: 'Últ. 7 días', value: 'last7' },
                        { label: 'Últ. 30 días', value: 'last30' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            const today = new Date();
                            let start = new Date();
                            let end = new Date();

                            switch (option.value) {
                              case 'day':
                                start = new Date();
                                end = new Date();
                                break;
                              case 'yesterday':
                                start = new Date();
                                start.setDate(start.getDate() - 1);
                                end = new Date(start);
                                break;
                              case 'week':
                                start = new Date();
                                start.setDate(start.getDate() - 6);
                                end = new Date();
                                break;
                              case 'lastWeek':
                                end = new Date();
                                end.setDate(end.getDate() - 7);
                                start = new Date(end);
                                start.setDate(start.getDate() - 6);
                                break;
                              case 'month':
                                start = new Date(today.getFullYear(), today.getMonth(), 1);
                                end = new Date();
                                break;
                              case 'lastMonth':
                                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                end = new Date(today.getFullYear(), today.getMonth(), 0);
                                break;
                              case 'last7':
                                end = new Date();
                                start = new Date();
                                start.setDate(start.getDate() - 6);
                                break;
                              case 'last30':
                                end = new Date();
                                start = new Date();
                                start.setDate(start.getDate() - 29);
                                break;
                              default:
                                start = new Date();
                                end = new Date();
                            }

                            setDailyTempStartDate(start);
                            setDailyTempEndDate(end);
                            setDailyCustomDateRange({ start, end });
                            setShowDailyDatePicker(false);
                          }}
                          className="px-2 py-1.5 rounded text-2xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors font-medium"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {/* Nota */}
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded text-2xs text-blue-900 dark:text-blue-100">
                      <span className="font-medium">ℹ️ Datos limitados a últimos 31 días.</span>
                    </div>

                    {/* Botones */}
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={() => setShowDailyDatePicker(false)}
                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded text-2xs font-medium transition-colors hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        CANCELAR
                      </button>
                      <button
                        onClick={() => {
                          setDailyCustomDateRange({
                            start: dailyTempStartDate,
                            end: dailyTempEndDate
                          });
                          setShowDailyDatePicker(false);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-2xs font-medium transition-colors"
                      >
                        ACEPTAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabla de Ventas Diarias - Solo en vista diaria - SECCIONES DE 7 DÍAS */}
        {expandedView === 'daily' && sessionsByWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="mb-8">
            {/* Encabezado de Semana */}
            <div className="mb-3 pb-2 border-b-2 border-blue-300 dark:border-blue-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📅 Semana del {new Date(week.startDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' })}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {week.sessions.length} {week.sessions.length === 1 ? 'día' : 'días'}
              </p>
            </div>

            {/* Tabla de la Semana */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-900 dark:bg-gray-950 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left text-white font-bold whitespace-nowrap">📅 FECHA</th>
                      <th className="px-3 py-3 text-left text-white font-bold">DÍA</th>
                      <th className="px-3 py-3 text-left text-white font-bold">CONCEPTO</th>
                      <th className="px-3 py-3 text-center text-white font-bold">💵 EFECTIVO</th>
                      <th className="px-3 py-3 text-center text-white font-bold">🏦 BANCOLOMBIA</th>
                      <th className="px-3 py-3 text-center text-white font-bold">📱 NEQUI</th>
                      <th className="px-3 py-3 text-center text-white font-bold">⚡ BOLD</th>
                      <th className="px-3 py-3 text-center text-white font-bold">🔗 ALIADO</th>
                      <th className="px-3 py-3 text-center text-white font-bold">💰 TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.sessions.map((session, sessionIndex) => {
                      const sessionDate = new Date(session.closeDate);
                      const dayOfWeek = sessionDate.toLocaleDateString('es-CO', { weekday: 'long' });
                      const formattedDate = sessionDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
                      
                      return (
                        <React.Fragment key={session.id}>
                          {/* Fila de Ingresos */}
                          <tr className={`border-b border-gray-200 dark:border-gray-700 ${sessionIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900 dark:bg-opacity-30' : ''}`}>
                            <td className="px-3 py-2 font-bold text-gray-900 dark:text-white whitespace-nowrap">{formattedDate}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 capitalize text-xs">{dayOfWeek}</td>
                            <td className="px-3 py-2 font-bold text-green-700 dark:text-green-300">↓ INGRESOS</td>
                            <td className="px-3 py-2 text-center text-green-700 dark:text-green-300 font-semibold">
                              ${session?.paymentMethods?.efectivo?.ingresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-green-700 dark:text-green-300 font-semibold">
                              ${session?.paymentMethods?.bancolombia?.ingresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-green-700 dark:text-green-300 font-semibold">
                              ${session?.paymentMethods?.nequi?.ingresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-green-700 dark:text-green-300 font-semibold">
                              ${session?.paymentMethods?.bold?.ingresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-green-700 dark:text-green-300 font-semibold">
                              ${session?.paymentMethods?.aliado?.ingresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-green-700 dark:text-green-300 font-bold text-sm border-l border-green-200 dark:border-green-800">
                              ${session?.sales?.toLocaleString('es-CO') || '0'}
                            </td>
                          </tr>

                          {/* Fila de Egresos */}
                          <tr className={`border-b border-gray-200 dark:border-gray-700 ${sessionIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900 dark:bg-opacity-30' : ''}`}>
                            <td className="px-3 py-2"></td>
                            <td className="px-3 py-2"></td>
                            <td className="px-3 py-2 font-bold text-orange-700 dark:text-orange-300">↑ EGRESOS</td>
                            <td className="px-3 py-2 text-center text-orange-700 dark:text-orange-300 font-semibold">
                              ${session?.paymentMethods?.efectivo?.egresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-700 dark:text-orange-300 font-semibold">
                              ${session?.paymentMethods?.bancolombia?.egresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-700 dark:text-orange-300 font-semibold">
                              ${session?.paymentMethods?.nequi?.egresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-700 dark:text-orange-300 font-semibold">
                              ${session?.paymentMethods?.bold?.egresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-700 dark:text-orange-300 font-semibold">
                              ${session?.paymentMethods?.aliado?.egresos?.toLocaleString('es-CO') || '0'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-700 dark:text-orange-300 font-bold text-sm border-l border-orange-200 dark:border-orange-800">
                              ${session?.expenses?.toLocaleString('es-CO') || '0'}
                            </td>
                          </tr>

                          {/* Fila de Balance */}
                          <tr className={`border-b-2 border-blue-300 dark:border-blue-700 ${sessionIndex % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-10'}`}>
                            <td className="px-3 py-2"></td>
                            <td className="px-3 py-2"></td>
                            <td className="px-3 py-2 font-bold text-blue-700 dark:text-blue-300">💰 BALANCE</td>
                            <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-bold">
                              ${Math.max(0, (session?.paymentMethods?.efectivo?.ingresos || 0) - (session?.paymentMethods?.efectivo?.egresos || 0)).toLocaleString('es-CO')}
                            </td>
                            <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-bold">
                              ${Math.max(0, (session?.paymentMethods?.bancolombia?.ingresos || 0) - (session?.paymentMethods?.bancolombia?.egresos || 0)).toLocaleString('es-CO')}
                            </td>
                            <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-bold">
                              ${Math.max(0, (session?.paymentMethods?.nequi?.ingresos || 0) - (session?.paymentMethods?.nequi?.egresos || 0)).toLocaleString('es-CO')}
                            </td>
                            <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-bold">
                              ${Math.max(0, (session?.paymentMethods?.bold?.ingresos || 0) - (session?.paymentMethods?.bold?.egresos || 0)).toLocaleString('es-CO')}
                            </td>
                            <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-bold">
                              ${Math.max(0, (session?.paymentMethods?.aliado?.ingresos || 0) - (session?.paymentMethods?.aliado?.egresos || 0)).toLocaleString('es-CO')}
                            </td>
                            <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-bold text-sm border-l-2 border-blue-300 dark:border-blue-700 bg-blue-200 dark:bg-blue-900 dark:bg-opacity-50">
                              ${((session?.sales || 0) - (session?.expenses || 0)).toLocaleString('es-CO')}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {/* Detalle de Sesiones - Tabla de Cierres de Caja */}
        {expandedView === 'mayor' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">📋 Cierres de Caja Diarios</h3>
            </div>

            {filteredSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900 dark:bg-gray-950 border-b-2 border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white">DÍA</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-white">📅 FECHA</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-white">💰 INGRESOS</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-white">📤 EGRESO</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-white">✅ SALDO</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-white">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSessions.map((session, idx) => {
                      const sessionDate = new Date(session.closeDate);
                      const dayName = sessionDate.toLocaleDateString('es-CO', { weekday: 'long' });
                      const formattedDate = sessionDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' });
                      const saldo = (session.sales || 0) - (session.expenses || 0);
                      
                      return (
                        <tr key={session.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900 dark:bg-opacity-20' : ''}`}>
                          <td className="px-4 py-3 text-gray-900 dark:text-white text-xs font-medium capitalize">
                            {dayName}
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white text-xs font-medium whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400 text-xs">
                            ${session.sales?.toLocaleString('es-CO') || '0'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-orange-600 dark:text-orange-400 text-xs">
                            ${session.expenses?.toLocaleString('es-CO') || '0'}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold text-xs border-l-2 ${
                            saldo >= 0
                              ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
                              : 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
                          }`}>
                            {saldo >= 0 ? '+' : ''}${saldo.toLocaleString('es-CO')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-800 dark:text-green-300">
                              ✅ Cerrado
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No hay sesiones registradas para este período
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
