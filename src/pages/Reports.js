import React, { useState, useMemo } from 'react';
import { useReports } from '../context/ReportContext';
import { FileText, Filter, Download, Printer, Calendar } from 'lucide-react';

const Reports = () => {
  const { getSalesByDateRange, getTopProducts } = useReports();

  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular rango de fechas
  const dateRange = useMemo(() => {
    const startParts = startDate.split('-');
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0);
    const endParts = endDate.split('-');
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);
    return { start, end };
  }, [startDate, endDate]);

  // Obtener datos según tipo de reporte
  const reportData = useMemo(() => {
    switch (reportType) {
      case 'sales':
        return getSalesByDateRange(dateRange.start, dateRange.end);
      case 'products':
        return getTopProducts(dateRange.start, dateRange.end, 100);
      default:
        return getSalesByDateRange(dateRange.start, dateRange.end);
    }
  }, [reportType, dateRange, getSalesByDateRange, getTopProducts]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    let filtered = [...reportData];

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (reportType === 'sales') {
          return (
            item.id?.toString().includes(searchTerm) ||
            item.paymentType?.toLowerCase().includes(searchLower) ||
            item.orderType?.toLowerCase().includes(searchLower)
          );
        } else if (reportType === 'products') {
          return item.name?.toLowerCase().includes(searchLower) || item.category?.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      const isDesc = sortBy.endsWith('-desc');
      const field = sortBy.replace('-asc', '').replace('-desc', '');

      let aVal = a[field];
      let bVal = b[field];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (isDesc) {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [reportData, searchTerm, sortBy, reportType]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calcular resumen
  const summary = useMemo(() => {
    if (reportType === 'sales') {
      return {
        totalSales: filteredData.reduce((sum, item) => sum + (item.total || 0), 0),
        totalOrders: filteredData.length,
        averageTicket: filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + (item.total || 0), 0) / filteredData.length : 0,
      };
    } else if (reportType === 'products') {
      return {
        totalSales: filteredData.reduce((sum, item) => sum + (item.total || 0), 0),
        totalQuantity: filteredData.reduce((sum, item) => sum + (item.quantity || 0), 0),
        totalProducts: filteredData.length,
      };
    }
    return {};
  }, [filteredData, reportType]);

  const handleExportCSV = () => {
    let csv = '';
    if (reportType === 'sales') {
      csv = 'Ticket,Fecha,Tipo,Pago,Total\n';
      filteredData.forEach(item => {
        csv += `${item.id},${new Date(item.createdAt || Date.now()).toLocaleString('es-CO')},${item.orderType || 'N/A'},${item.paymentType || 'N/A'},${item.total || 0}\n`;
      });
    } else if (reportType === 'products') {
      csv = 'Producto,Categoría,Cantidad,Total\n';
      filteredData.forEach(item => {
        csv += `${item.name},${item.category},${item.quantity},${item.total || 0}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${reportType}_${new Date().getTime()}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <h1 className="text-lg sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
          <FileText size={24} className="flex-shrink-0" />
          <span>Reportes</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Análisis de ventas y productos
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 mb-3 sm:mb-4">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Ventas</option>
              <option value="products">Productos</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ordenar */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Orden
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Reciente</option>
              <option value="date-asc">Antiguo</option>
              {reportType === 'sales' && <option value="total-desc">Mayor Monto</option>}
              {reportType === 'sales' && <option value="total-asc">Menor Monto</option>}
              {reportType === 'products' && <option value="quantity-desc">Mayor Cant.</option>}
              {reportType === 'products' && <option value="quantity-asc">Menor Cant.</option>}
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Registros</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{filteredData.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase">
              {reportType === 'sales' ? 'Ventas' : 'Total'}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-300 truncate">
              ${summary.totalSales?.toLocaleString('es-CO', { maximumFractionDigits: 0 }) || 0}
            </p>
          </div>
          {reportType === 'sales' && (
            <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">Promedio</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-800 dark:text-purple-300 truncate">
                ${summary.averageTicket?.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}
              </p>
            </div>
          )}
          {reportType === 'products' && (
            <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase">Unidades</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-300">
                {summary.totalQuantity || 0}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-3 flex gap-2 sm:gap-3">
        <button
          onClick={handleExportCSV}
          className="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
        <button
          onClick={handlePrint}
          className="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2"
        >
          <Printer size={16} />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="flex-1 overflow-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
        {paginatedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-4xl sm:text-6xl mb-2 sm:mb-4">📭</p>
              <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">Sin resultados</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No hay datos para los filtros</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {reportType === 'sales' ? (
                      <>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase\">#</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden sm:table-cell\">Fecha</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase\">Tipo</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden md:table-cell\">Pago</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase\">Total</th>
                      </>
                    ) : (
                      <>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase\">Producto</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden sm:table-cell\">Categoría</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase\">Cant.</th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase\">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors\">
                      {reportType === 'sales' ? (
                        <>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-mono text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm\">
                            #{item.id?.toString().slice(-6) || 'N/A'}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs hidden sm:table-cell\">
                            {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs\">
                            {item.orderType === 'table' ? '🪑' : item.orderType === 'delivery' ? '🏍' : '🛍'}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs hidden md:table-cell\">
                            {item.paymentType || '-'}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-bold text-gray-800 dark:text-white text-xs sm:text-sm\">
                            ${(item.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-medium text-gray-800 dark:text-white text-xs sm:text-sm\">
                            {item.name}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs hidden sm:table-cell\">
                            {item.category}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm\">
                            {item.quantity}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm\">
                            ${(item.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <label htmlFor="itemsPerPage" className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrar:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
