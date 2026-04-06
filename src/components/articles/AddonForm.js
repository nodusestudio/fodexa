import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { X, Gift } from 'lucide-react';

const AddonForm = ({ addon, onSave, onClose }) => {
  const { products } = useProducts();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    status: 'active',
    applicableProducts: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (addon) {
      setFormData({
        name: addon.name || '',
        price: addon.price?.toString() || '',
        status: addon.status || 'active',
        applicableProducts: addon.applicableProducts || [],
      });
    }
  }, [addon]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const addonData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      status: formData.status,
      applicableProducts: formData.applicableProducts,
    };

    onSave(addonData);
  };

  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter(id => id !== productId)
        : [...prev.applicableProducts, productId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Gift size={28} className="text-purple-600 dark:text-purple-400" />
            {addon ? '✏️ Editar Adicional' : '➕ Nuevo Adicional'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Adicional *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ej: Queso Extra"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio Adicional *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              onFocus={(e) => e.target.select()}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Productos Aplicables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aplicable a Productos
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Selecciona los productos donde se puede agregar este adicional (deja vacío para todos)
            </p>
            <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              {products.map(product => (
                <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.applicableProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{product.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-700 dark:text-gray-300">✅ Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-gray-700 dark:text-gray-300">❌ Inactivo</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              {addon ? '💾 Actualizar' : '➕ Crear Adicional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddonForm;
