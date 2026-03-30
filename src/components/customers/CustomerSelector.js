import React, { useState } from 'react';
import { Search, User, Phone, MapPin, Plus, X } from 'lucide-react';
import { useCustomers } from '../../context/CustomerContext';

const CustomerSelector = ({ onSelectCustomer }) => {
  const { customers = [], addCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  // Filtrar clientes de la base de datos
  const filteredCustomers = customers.filter(customer => {
    try {
      const nameMatch = customer.name 
        ? String(customer.name).toLowerCase().includes((searchQuery || '').toLowerCase())
        : false;
      const phoneMatch = customer.phone 
        ? String(customer.phone).includes(searchQuery || '')
        : false;
      const addressMatch = customer.address
        ? String(customer.address).toLowerCase().includes((searchQuery || '').toLowerCase())
        : false;
      return nameMatch || phoneMatch || addressMatch;
    } catch (error) {
      console.warn('⚠️ Error filtrando cliente en selector:', customer, error);
      return false;
    }
  });

  const handleSelect = (customer) => {
    if (onSelectCustomer) {
      onSelectCustomer(customer);
    }
  };

  const handleCreateNew = () => {
    setShowForm(true);
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.address) {
      alert('⚠️ Por favor completa los campos obligatorios (nombre, telefono y direccion)');
      return;
    }
    const customerWithId = {
      ...newCustomer,
      id: Date.now()
    };
    
    try {
      // Guardar en base de datos
      if (addCustomer) {
        await addCustomer(customerWithId);
        console.log('✅ Cliente guardado en la base de datos:', customerWithId);
      }
      
      // Seleccionar el cliente
      if (onSelectCustomer) {
        onSelectCustomer(customerWithId);
      }
      setShowForm(false);
      setNewCustomer({ name: '', phone: '', address: '', email: '' });
      alert('✅ Cliente creado exitosamente');
    } catch (error) {
      console.error('❌ Error al crear cliente:', error);
      alert('❌ Error al crear el cliente');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setNewCustomer({ name: '', phone: '', address: '', email: '' });
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white flex-1">👥 Buscar Cliente</h3>
          <button
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o telefono..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {filteredCustomers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
              {customers.length === 0 
                ? '📭 No hay clientes cargados. Crea uno nuevo o importa desde la sección Clientes.'
                : '🔍 No se encontraron clientes con esos criterios'
              }
            </p>
          ) : (
            filteredCustomers.map(customer => (
              <button
                key={customer.id}
                onClick={() => handleSelect(customer)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white">{customer.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <Phone size={14} />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin size={14} />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Modal para nuevo cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl w-full md:w-96 max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 text-white p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <span>👤</span> Nuevo Cliente
              </h2>
              <button
                onClick={handleCancelForm}
                className="p-2 hover:bg-green-500 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Juan Perez"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direccion *
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Calle 123 #45-67, Bogota"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: juan@email.com"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 flex gap-3">
              <button
                onClick={handleCancelForm}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewCustomer}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
              >
                ✅ Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerSelector;


