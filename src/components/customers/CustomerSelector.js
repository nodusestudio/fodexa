import React, { useState } from 'react';
import { Search, User, Phone, MapPin, Plus, X } from 'lucide-react';

// DATOS DE EJEMPLO DE CLIENTES
const sampleCustomers = [
  { id: 1, name: 'Juan PÃ©rez', phone: '300 123 4567', address: 'Calle 123 #45-67, BogotÃ¡', email: 'juan@email.com' },
  { id: 2, name: 'MarÃ­a GarcÃ­a', phone: '310 987 6543', address: 'Carrera 45 #12-34, MedellÃ­n', email: 'maria@email.com' },
  { id: 3, name: 'Carlos LÃ³pez', phone: '315 456 7890', address: 'Transversal 78 #90-12, Cali', email: 'carlos@email.com' },
  { id: 4, name: 'Ana MartÃ­nez', phone: '318 234 5678', address: 'Diagonal 23 #56-78, Barranquilla', email: 'ana@email.com' },
  { id: 5, name: 'Luis RodrÃ­guez', phone: '304 876 5432', address: 'Calle 67 #89-01, Cartagena', email: 'luis@email.com' },
  { id: 6, name: 'Carmen DÃ­az', phone: '311 345 6789', address: 'Avenida 12 #34-56, Bucaramanga', email: 'carmen@email.com' },
  { id: 7, name: 'Roberto Silva', phone: '320 567 8901', address: 'Carrera 89 #12-34, Pereira', email: 'roberto@email.com' },
  { id: 8, name: 'Patricia Morales', phone: '313 678 9012', address: 'Calle 45 #67-89, Manizales', email: 'patricia@email.com' },
  { id: 9, name: 'Fernando Castro', phone: '316 789 0123', address: 'Transversal 34 #56-78, IbaguÃ©', email: 'fernando@email.com' },
  { id: 10, name: 'LucÃ­a RamÃ­rez', phone: '302 890 1234', address: 'Diagonal 56 #78-90, Pasto', email: 'lucia@email.com' },
];
const CustomerSelector = ({ onSelectCustomer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const filteredCustomers = sampleCustomers.filter(customer =>
    customer.name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    customer.phone.includes(searchQuery || '')
  );

  const handleSelect = (customer) => {
    if (onSelectCustomer) {
      onSelectCustomer(customer);
    }
  };

  const handleCreateNew = () => {
    setShowForm(true);
  };

  const handleSaveNewCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.address) {
      alert('âš ï¸ Por favor completa los campos obligatorios (nombre, telÃ©fono y direcciÃ³n)');
      return;
    }
    const customerWithId = {
      ...newCustomer,
      id: Date.now()
    };
    if (onSelectCustomer) {
      onSelectCustomer(customerWithId);
    }
    setShowForm(false);
    setNewCustomer({ name: '', phone: '', address: '', email: '' });
    alert('âœ… Cliente creado exitosamente');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setNewCustomer({ name: '', phone: '', address: '', email: '' });
  };

  if (showForm) {
    return (
      <div className="mb-4 md:mb-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 p-3 md:p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white">ðŸ“ Nuevo Cliente</h3>
          <button 
            onClick={handleCancelForm}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Juan PÃ©rez"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              TelÃ©fono *
            </label>
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: 300 123 4567"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              DirecciÃ³n *
            </label>
            <textarea
              rows="2"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Calle 123 #45-67, BogotÃ¡"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: juan@email.com"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleSaveNewCustomer}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-2 text-sm md:text-base rounded-lg font-semibold transition-colors"
            >
              ðŸ’¾ Guardar y Continuar
            </button>
            <button
              onClick={handleCancelForm}
              className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-4">ðŸ‘¥ Buscar Cliente</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o telÃ©fono..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {filteredCustomers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No se encontraron clientes
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

      <button
        onClick={handleCreateNew}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={20} />
        Nuevo Cliente
      </button>
    </div>
  );
};

export default CustomerSelector;


