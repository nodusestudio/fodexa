import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Star, ShoppingCart } from 'lucide-react';

const CustomerDetail = ({ customer, stats, onClose }) => {
  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            👤 Detalle del Cliente
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar y Datos */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{customer.name}</h3>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  stats.classification.level === 'VIP' ? 'bg-purple-500' :
                  stats.classification.level === 'Frecuente' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}>
                  {stats.classification.icon} {stats.classification.level}
                </span>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Phone className="text-blue-600 dark:text-blue-400" size={20} />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Mail className="text-blue-600 dark:text-blue-400" size={20} />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="text-blue-600 dark:text-blue-400" size={20} />
                  <span>{customer.address}, {customer.city}</span>
                </div>
              )}
              {customer.birthdate && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                  <span>Fecha de nacimiento: {formatDate(customer.birthdate)}</span>
                </div>
              )}
              {customer.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">📝 <span className="font-semibold">Notas:</span> {customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-xl p-4 text-center">
              <ShoppingCart className="text-blue-600 dark:text-blue-400 mx-auto mb-2" size={24} />
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">{stats.totalPurchases}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Compras</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-xl p-4 text-center">
              <span className="text-3xl mb-2 block">💰</span>
              <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                ${stats.totalSpent.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">Total Gastado</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-xl p-4 text-center">
              <span className="text-3xl mb-2 block">🎫</span>
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                ${stats.averageTicket.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Ticket Promedio</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-xl p-4 text-center">
              <Star className="text-yellow-600 dark:text-yellow-400 mx-auto mb-2" size={24} />
              <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                {stats.lastPurchase ? formatDate(stats.lastPurchase) : 'Nunca'}
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Última Compra</p>
            </div>
          </div>

          {/* Historial de Compras */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
              Historial de Compras ({stats.tickets.length})
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {stats.tickets.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Este cliente no tiene compras registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ticket</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.tickets.slice(0, 10).map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-600 dark:text-blue-400 text-sm">
                            {ticket.ticketNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                            {new Date(ticket.createdAt).toLocaleString('es-CO')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.orderType === 'table' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                              ticket.orderType === 'delivery' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                              'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                              {ticket.orderType === 'table' ? '🪑 Mesa' : ticket.orderType === 'delivery' ? '🏍️ Domicilio' : '🛍️ Llevar'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                            {ticket.items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-800 dark:text-white">
                            ${(ticket.total || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {stats.tickets.length > 10 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                Mostrando 10 de {stats.tickets.length} compras
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
