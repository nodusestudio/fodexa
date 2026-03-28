import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/formatters';
import { useCustomers } from '../context/CustomerContext';
import { useTickets } from '../context/TicketContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, Award, Calendar } from 'lucide-react';

const CustomerReports = () => {
  const { customers, getCustomerStats, getCustomersByClassification } = useCustomers();
  const { tickets } = useTickets();
  const [period, setPeriod] = useState('month');

  // Calcular métricas generales
  const metrics = useMemo(() => {
    const customersWithStats = customers.map(c => ({
      ...c,
      ...getCustomerStats(c.id, tickets),
    }));

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCount = customersWithStats.filter(c => c.classification.level === 'VIP').length;
    const frequentCount = customersWithStats.filter(c => c.classification.level === 'Frecuente').length;
    const totalRevenue = customersWithStats.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageTicket = totalRevenue / tickets.length || 0;
    const totalTickets = tickets.length;

    return {
      totalCustomers,
      activeCustomers,
      vipCount,
      frequentCount,
      totalRevenue,
      averageTicket,
      totalTickets,
      customersWithStats,
    };
  }, [customers, tickets, getCustomerStats]);

  // Datos para gráfico de clasificación
  const classificationData = useMemo(() => {
    const data = [
      { name: 'VIP', value: metrics.vipCount, fill: '#a855f7' },
      { name: 'Frecuente', value: metrics.frequentCount, fill: '#3b82f6' },
      { name: 'Ocasional', value: metrics.totalCustomers - metrics.vipCount - metrics.frequentCount, fill: '#9ca3af' },
    ];
    return data.filter(d => d.value > 0);
  }, [metrics]);

  // Top clientes por gasto
  const topCustomers = useMemo(() => {
    return metrics.customersWithStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => ({
        name: c.name.split(' ')[0],
        value: c.totalSpent,
        purchases: c.totalPurchases,
      }));
  }, [metrics]);

  // Gasto promedio por clasificación
  const spendingByClassification = useMemo(() => {
    return [
      {
        name: 'VIP',
        cantidad: metrics.vipCount,
        gastototal: metrics.customersWithStats.filter(c => c.classification.level === 'VIP').reduce((sum, c) => sum + c.totalSpent, 0),
      },
      {
        name: 'Frecuente',
        cantidad: metrics.frequentCount,
        gastototal: metrics.customersWithStats.filter(c => c.classification.level === 'Frecuente').reduce((sum, c) => sum + c.totalSpent, 0),
      },
      {
        name: 'Ocasional',
        cantidad: metrics.totalCustomers - metrics.vipCount - metrics.frequentCount,
        gastototal: metrics.customersWithStats.filter(c => c.classification.level === 'Ocasional').reduce((sum, c) => sum + c.totalSpent, 0),
      },
    ];
  }, [metrics]);

  const handleExport = () => {
    const csvContent = [
      ['REPORTE DE CLIENTES', `Período: ${period}`],
      [],
      ['MÉTRICAS GENERALES'],
      ['Total de Clientes', metrics.totalCustomers],
      ['Clientes Activos', metrics.activeCustomers],
      ['Clientes VIP', metrics.vipCount],
      ['Clientes Frecuentes', metrics.frequentCount],
      ['Ingresos Totales', formatCurrency(metrics.totalRevenue)],
      ['Ticket Promedio', formatCurrency(metrics.averageTicket)],
      [],
      ['TOP 10 CLIENTES POR GASTO'],
      ['Posición', 'Cliente', 'Compras', 'Total Gastado'],
      ...topCustomers.map((c, idx) => [idx + 1, c.name, c.purchases, formatCurrency(c.value)]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-clientes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              📊 Reportes de Clientes
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Análisis en profundidad del comportamiento y rentabilidad de clientes
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
              <option value="all">Todo el Tiempo</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.totalCustomers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.activeCustomers} activos</p>
              </div>
              <Users className="text-blue-600 dark:text-blue-400" size={40} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">👑 Clientes VIP</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.vipCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metrics.totalCustomers > 0 ? ((metrics.vipCount / metrics.totalCustomers) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
              <Award className="text-purple-600 dark:text-purple-400" size={40} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Ingresos Totales</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.totalTickets} transacciones</p>
              </div>
              <TrendingUp className="text-green-600 dark:text-green-400" size={40} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Ticket Promedio</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(metrics.averageTicket)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Por transacción</p>
              </div>
              <Calendar className="text-orange-600 dark:text-orange-400" size={40} />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Clasificación */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Distribución por Clasificación</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} clientes`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Gasto por Clasificación */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Gasto Total por Clasificación</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingByClassification}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="gastototal" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🏆 Top 10 Clientes por Gasto</h3>
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Clasificación */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Análisis por Clasificación</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Clasificación</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">% del Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Gasto Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Gasto Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {spendingByClassification.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                      {row.name === 'VIP' ? '👑 VIP' : row.name === 'Frecuente' ? '⭐ Frecuente' : '👤 Ocasional'}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{row.cantidad}</td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                      {metrics.totalCustomers > 0 ? ((row.cantidad / metrics.totalCustomers) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(row.gastototal)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                      {row.cantidad > 0 ? formatCurrency(row.gastototal / row.cantidad) : formatCurrency(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReports;
