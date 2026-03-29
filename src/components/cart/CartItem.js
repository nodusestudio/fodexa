import React, { useState } from 'react';
import { Minus, Plus, Trash2, MessageSquare, Package, Edit2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ComboEditor from './ComboEditor';

const CartItem = ({ item, index }) => {
  const { updateQuantity, removeItem, updateItemNotes, updateAddons } = useCart();
  const [showNotes, setShowNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [showComboEditor, setShowComboEditor] = useState(false);

  // Debug: Verificar que CartItem se está renderizando
  console.log('🔵 CartItem renderiza:', item.name, 'Item:', item);

  const price = parseFloat(item.price) || 0;
  const quantity = parseInt(item.quantity) || 1;
  const addonsTotal = item.addons?.reduce((sum, addon) => sum + (parseFloat(addon.price) || 0), 0) || 0;
  const itemSubtotal = (price * quantity) + addonsTotal;

  const handleSaveNotes = () => {
    updateItemNotes(item.id, localNotes);
    setShowNotes(false);
  };

  const handleCancelNotes = () => {
    setLocalNotes(item.notes || '');
    setShowNotes(false);
  };

  const handleComboEditorConfirm = (newAddons) => {
    updateAddons(item.id, newAddons);
    setShowComboEditor(false);
  };

  return (
    <>
      {showComboEditor && (
        <ComboEditor
          item={item}
          onConfirm={handleComboEditorConfirm}
          onCancel={() => setShowComboEditor(false)}
        />
      )}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* Imagen/Icono */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="text-blue-600 dark:text-blue-400" size={28} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {/* Nombre y Precio */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base leading-tight">
                  {item.name}
                </h4>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  ${price.toLocaleString('es-CO')} c/u
                </p>
              </div>
              
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Adicionales */}
            {item.addons && item.addons.length > 0 && (
              <div className="mb-3 space-y-1">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  🎁 Adicionales:
                </p>
                {item.addons.map((addon, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-purple-300 dark:border-purple-600">
                    <span>+ {addon.name}</span>
                    <span>${parseFloat(addon.price).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Nota del producto */}
            {item.notes && !showNotes && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded text-xs text-blue-800 dark:text-blue-300">
                📝 {item.notes}
              </div>
            )}

            {/* Campo de nota */}
            {showNotes && (
              <div className="mb-3 space-y-2">
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, sin tomate, bien cocida..."
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    ✓ Guardar
                  </button>
                  <button
                    onClick={handleCancelNotes}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Controles */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 gap-3 flex-wrap">
              {/* Botones de acciones */}
              <div className="flex gap-1.5 flex-wrap">
                {/* Botón de notas */}
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    showNotes || item.notes
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <MessageSquare size={14} />
                  {item.notes ? 'Editar nota' : 'Agregar nota'}
                </button>

              {/* Botón de editar combo */}
              <button
                onClick={() => setShowComboEditor(true)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  item.addons?.some(a => a.id === 'combo-papas-bebida')
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <Edit2 size={14} />
                {item.addons?.some(a => a.id === 'combo-papas-bebida') ? 'Editar combo' : 'Agregar combo'}
              </button>
              </div>

              {/* Contador de cantidad */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md shadow-sm hover:shadow text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                
                <span className="w-10 text-center font-bold text-gray-800 dark:text-white">
                  {quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md shadow-sm hover:shadow text-gray-700 dark:text-gray-300 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right ml-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400">Subtotal</p>
                <p className="font-bold text-gray-800 dark:text-white">
                  ${itemSubtotal.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartItem;

