import React, { useState, useMemo } from 'react';
import { useReports } from '../context/ReportContext';
import { TrendingUp, DollarSign, ShoppingCart, Ticket, Download, RefreshCw, Calendar } from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import SalesChart from '../components/dashboard/SalesChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import PaymentChart from '../components/dashboard/PaymentChart';
import TopProducts from '../components/dashboard/TopProducts';
import Toast from '../components/common/Toast';

const Dashboard = () => {
  const {
    getPeriodMetrics,
    getSalesByDay,
    getSalesByCategory,
    getSalesByPaymentType,
    getTopProducts,
    getRecentOrders,
  } = useReports();
  const [toast, setToast] = useState(null);

  const [period, setPeriod] = useState('today');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Calcular fechas según período seleccionado
  const dateRange = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (period) {
      case 'today':
        break;
      case 'week':
        start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date();
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        const startParts = customRange.start.split('-');
        start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0);
        const endParts = customRange.end.split('-');
        end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);
        break;
      default:
        break;
    }

    return { start, end };
  }, [period, customRange]);

  // Obtener métricas
  const metrics = getPeriodMetrics(dateRange.start, dateRange.end);
  const salesByDay = getSalesByDay(dateRange.start, dateRange.end);
  const salesByCategory = getSalesByCategory(dateRange.start, dateRange.end);
  const salesByPayment = getSalesByPaymentType(dateRange.start, dateRange.end);
  const topProducts = getTopProducts(dateRange.start, dateRange.end, 10);
  const recentOrders = getRecentOrders(5);

  const handleExport = () => {
    setToast({ message: '📥 Función de exportación en desarrollo...', type: 'info' });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto">
      {/* Header - Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-6 py-2 sm:py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div>
            <h1 className="text-lg sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
              📊 Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
              Rendimiento de tu negocio
            </p>
          </div>
          <div className="flex gap-1 sm:gap-3">
            <button
              onClick={handleRefresh}
              className="px-1.5 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm"
            >
              <RefreshCw size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={handleExport}
              className="px-1.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="flex gap-1 sm:gap-2 flex-wrap overflow-x-auto pb-2">
          {[
            { key: 'today', label: 'Hoy' },
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mes' },
            { key: 'custom', label: 'Custom' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-1.5 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                period === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Rango Personalizado */}
        {period === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-3">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar size={14} className="text-gray-600 dark:text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="px-1.5 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">a</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="px-1.5 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contenido - Responsive */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4">
          <MetricCard
            title="💰 Ventas"
            value={`$${metrics.totalSales.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            color="green"
            trend={metrics.growth >= 0 ? 'up' : 'down'}
            trendValue={Math.abs(metrics.growth).toFixed(1)}
          />
          <MetricCard
            title="📦 Pedidos"
            value={metrics.totalOrders.toString()}
            icon={ShoppingCart}
            color="blue"
          />
          <MetricCard
            title="🎫 Promedio"
            value={`$${metrics.averageTicket.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={Ticket}
            color="purple"
          />
          <MetricCard
            title="📈 Growth"
            value={`${metrics.growth >= 0 ? '+' : ''}${metrics.growth.toFixed(1)}%`}
            icon={TrendingUp}
            color={metrics.growth >= 0 ? 'green' : 'red'}
          />
        </div>

        {/* Gráfica Principal */}
        <SalesChart data={salesByDay} title="📈 Ventas por Día" type="bar" />

        {/* Gráficas Secundarias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          <CategoryChart data={salesByCategory} title="📂 Ventas por Categoría" />
          <PaymentChart data={salesByPayment} title="💳 Ventas por Método de Pago" />
        </div>

        {/* Top Productos */}
        <TopProducts products={topProducts} totalSales={metrics.totalSales} />

        {/* Últimos Pedidos - Responsive Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-2 sm:px-6 py-2 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white">
              🛒 Últimos Pedidos
            </h3>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-3 sm:p-6 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              No hay pedidos registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ticket</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Pago</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-mono text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">
                        #{order.ticketNumber}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                        {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                          order.orderType === 'table' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          order.orderType === 'delivery' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {order.orderType === 'table' ? '🪑' : order.orderType === 'delivery' ? '🏍️' : '🛍️'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">
                        {order.paymentType || '⏳'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-bold text-gray-800 dark:text-white text-xs sm:text-sm">
                        ${(order.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;