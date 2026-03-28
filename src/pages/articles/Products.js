import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';

import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import ProductForm from '../../components/articles/ProductForm';

// Datos de ejemplo
const sampleProducts = [
  { id: 1, name: 'Hamburguesa Clásica', category: 'Comida', price: 8.99, stock: 50, status: 'active' },
  { id: 2, name: 'Hamburguesa Doble', category: 'Comida', price: 12.99, stock: 30, status: 'active' },
  { id: 3, name: 'Papas Fritas', category: 'Comida', price: 3.99, stock: 100, status: 'active' },
  { id: 4, name: 'Refresco', category: 'Bebidas', price: 2.49, stock: 200, status: 'active' },
  { id: 5, name: 'Cerveza', category: 'Bebidas', price: 4.99, stock: 80, status: 'active' },
];


const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar producto?')) {
      deleteProduct(id);
    }
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-semibold flex items-center gap-1 sm:gap-2 transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mx-3 sm:mx-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Categoría</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Stock</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Estado</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-3">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="text-gray-500 dark:text-gray-400" size={16} />
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 hidden sm:table-cell text-xs sm:text-sm">{product.category}</td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">${product.price.toFixed(2)}</td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 hidden sm:table-cell text-xs sm:text-sm">{product.stock}</td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {product.status === 'active' ? '✓' : '✕'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-1 sm:mr-3 inline-flex items-center gap-1">
                      <Edit size={16} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 inline-flex items-center gap-1">
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Borrar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Producto - Agregar después */}
      {showModal && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
};

export default Products;
