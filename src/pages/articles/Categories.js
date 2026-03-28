import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import CategoryForm from '../../components/articles/CategoryForm';

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const hasProducts = products.some(p => p.category === categories.find(c => c.id === id)?.name);
    if (hasProducts) {
      if (!window.confirm('⚠️ Esta categoría tiene productos asociados. ¿Eliminar de todos modos?')) {
        return;
      }
    }
    deleteCategory(id);
  };

  const handleSave = (categoryData) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }
    setShowModal(false);
    setEditingCategory(null);
  };

  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(category => (
          <div 
            key={category.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
            style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Tag className="text-xl" style={{ color: category.color }} size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getProductCount(category.name)} productos
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                category.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {category.status === 'active' ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{category.description}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(category)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Edit size={16} />
                Editar
              </button>
              <button 
                onClick={() => handleDelete(category.id)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingCategory(null); }}
        />
      )}
    </div>
  );
};

export default Categories;
