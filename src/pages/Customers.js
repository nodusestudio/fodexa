import React, { useState, useMemo } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { useTickets } from '../context/TicketContext';
import { Search, Plus, Download, Users, Eye, Edit, Trash2, Filter } from 'lucide-react';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerDetail from '../components/customers/CustomerDetail';
import CustomerImport from '../components/customers/CustomerImport';

const Customers = () => {
  const { customers, searchCustomers, deleteCustomer, exportCustomers, getCustomerStats, addCustomer, updateCustomer } = useCustomers();
  const { tickets } = useTickets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filtrar clientes
  const filteredCustomers = useMemo(() => {
    let result = searchQuery ? searchCustomers(searchQuery) : customers;
    
    if (filterClassification !== 'all') {
      result = result.filter(customer => {
        const stats = getCustomerStats(customer.id, tickets);
        return stats.classification.level.toLowerCase() === filterClassification.toLowerCase();
      });
    }
    
    return result;
  }, [customers, searchQuery, filterClassification, tickets, getCustomerStats, searchCustomers]);

  // Estadísticas generales
  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => {
    const stats = getCustomerStats(c.id, tickets);
    return stats.classification.level === 'VIP';
  }).length;
  const frequentCustomers = customers.filter(c => {
    const stats = getCustomerStats(c.id, tickets);
    return stats.classification.level === 'Frecuente';
  }).length;
  const totalRevenue = customers.reduce((sum, c) => {
    const stats = getCustomerStats(c.id, tickets);
    return sum + stats.totalSpent;
  }, 0);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      deleteCustomer(id);
    }
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const handleSave = (customerData) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleExport = () => {
    exportCustomers(tickets);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
              <Users size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>Clientes</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
              {totalCustomers} registrados
            </p>
          </div>
          <div className="flex gap-1 sm:gap-3">
            <button
              onClick={handleExport}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 sm:gap-2"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <CustomerImport onImportResult={(result) => {
              if (result.type === 'success') {
                window.dispatchEvent(new CustomEvent('push-message', { detail: { type: 'success', message: result.message } }));
              } else {
                window.dispatchEvent(new CustomEvent('push-message', { detail: { type: 'error', message: result.message } }));
              }
            }} />
            <button
              onClick={() => { setEditingCustomer(null); setShowForm(true); }}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={16} className="text-gray-400 hidden sm:inline" />
              <select
                onChange={(e) => setFilterClassification(e.target.value)}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Todas</option>
                <option value="vip">👑 VIP</option>
                <option value="frecuente">⭐ Frecuente</option>
                <option value="ocasional">👤 Ocasional</option>
              </select>
            </div>
          </div>

          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{totalCustomers}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-4">
              <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold">👑 VIP</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-800 dark:text-purple-300">{vipCustomers}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-4">
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold">⭐ Frecuentes</p>
              <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-300">{frequentCustomers}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-2 sm:p-4">
              <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-semibold">💰 Ingresos</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-800 dark:text-yellow-300 line-clamp-2">
                ${totalRevenue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="flex-1 overflow-auto p-2 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Contacto</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Dirección</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clasificación</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Compras</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Total</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-2 sm:px-6 py-8 sm:py-12 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => {
                    const stats = getCustomerStats(customer.id, tickets);
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm truncate">{customer.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                          <span className="text-xs sm:text-sm">{customer.phone}</span>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 max-w-xs truncate hidden md:table-cell" title={customer.address}>
                          <span className="text-xs sm:text-sm">{customer.address ? (customer.address.length > 20 ? customer.address.slice(0, 20) + '...' : customer.address) : '-'}</span>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                            stats.classification.level === 'VIP' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                            stats.classification.level === 'Frecuente' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {stats.classification.icon}
                          </span>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                          {stats.totalPurchases}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-400 text-xs sm:text-sm hidden sm:table-cell">
                          ${stats.totalSpent.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetail(customer)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-1 sm:mr-2 inline-flex items-center gap-1 transition-colors"
                            title="Ver"
                          >
                            <Eye size={16} />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-1 sm:mr-2 inline-flex items-center gap-1 transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 inline-flex items-center gap-1 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Borrar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingCustomer(null); }}
        />
      )}

      {showDetail && selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          stats={getCustomerStats(selectedCustomer.id, tickets)}
          onClose={() => { setShowDetail(false); setSelectedCustomer(null); }}
        />
      )}
    </div>
  );
};

export default Customers;
