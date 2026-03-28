import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Search, Edit, Trash2, Gift } from 'lucide-react';
import AddonForm from '../../components/articles/AddonForm';

const Addons = () => {
  const { addons, addAddon, updateAddon, deleteAddon, products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);

  const filteredAddons = addons.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (addon) => {
    setEditingAddon(addon);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar adicional?')) {
      deleteAddon(id);
    }
  };

  const handleSave = (addonData) => {
    if (editingAddon) {
      updateAddon(editingAddon.id, addonData);
    } else {
      addAddon(addonData);
    }
    setShowModal(false);
    setEditingAddon(null);
  };

  const getApplicableProductsCount = (addon) => {
    if (!addon.applicableProducts || addon.applicableProducts.length === 0) {
      return products.length; // Aplicable a todos
    }
    return addon.applicableProducts.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar adicional..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button 
          onClick={() => { setEditingAddon(null); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo Adicional
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Adicional</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAddons.map(addon => (
                <tr key={addon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Gift className="text-purple-600 dark:text-purple-400" size={20} />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">{addon.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-purple-600 dark:text-purple-400">
                    ${addon.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {getApplicableProductsCount(addon)} productos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      addon.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {addon.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleEdit(addon)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(addon.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddonForm
          addon={editingAddon}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingAddon(null); }}
        />
      )}
    </div>
  );
};

export default Addons;
