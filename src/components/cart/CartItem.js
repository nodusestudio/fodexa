import React, { useState } from 'react';
import { Minus, Plus, Trash2, MessageSquare, Package, Edit2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ComboEditor from './ComboEditor';

const CartItem = ({ item, index }) => {
  const { updateQuantity, removeItem, updateItemNotes, updateAddons } = useCart();
  const [showNotes, setShowNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [showComboEditor, setShowComboEditor] = useState(false);

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
      <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="flex gap-2.5">
          {/* Imagen/Icono - Más pequeño */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="text-blue-600 dark:text-blue-400" size={24} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Nombre, Precio y Opciones en una línea */}
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <div className="min-w-0">
                <h4 className="font-bold text-gray-800 dark:text-white text-xs leading-tight truncate">
                  {item.name}
                </h4>
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                  ${price.toLocaleString('es-CO')}
                </p>
              </div>
              
              {/* Botón eliminar compacto */}
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Adicionales en línea compacta */}
            {item.addons && item.addons.length > 0 && (
              <div className="mb-1 text-xs text-purple-600 dark:text-purple-400">
                🎁 {item.addons.map(a => a.name).join(' + ')}
              </div>
            )}

            {/* Bebidas seleccionadas (para combos) */}
            {item.bebidas && item.bebidas.length > 0 && (
              <div className="mb-1 text-xs text-green-600 dark:text-green-400">
                🥤 {item.bebidas.map(b => `${b.name} (${b.tamano})`).join(' + ')}
              </div>
            )}

            {/* Nota inline si existe */}
            {item.notes && !showNotes && (
              <div className="mb-1 text-xs text-blue-700 dark:text-blue-300 truncate">
                📝 {item.notes}
              </div>
            )}

            {/* Campo de nota - Solo cuando está activo */}
            {showNotes && (
              <div className="mb-2 space-y-1">
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, sin tomate..."
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveNotes}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-xs font-semibold transition-colors"
                  >
                    ✓ Guardar
                  </button>
                  <button
                    onClick={handleCancelNotes}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1 rounded text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Controles - Compactos en una línea */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200 dark:border-gray-600">
              {/* Botones de acciones - Iconos solo */}
              <div className="flex gap-1">
                {/* Botón de notas - Solo ícono */}
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`p-1.5 rounded transition-colors ${
                    showNotes || item.notes
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  title={item.notes ? 'Editar nota' : 'Agregar nota'}
                >
                  <MessageSquare size={14} />
                </button>

                {/* Botón de combo - Solo ícono */}
                <button
                  onClick={() => setShowComboEditor(true)}
                  className={`p-1.5 rounded transition-colors ${
                    item.addons?.some(a => a.id === 'combo-papas-bebida')
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  title={item.addons?.some(a => a.id === 'combo-papas-bebida') ? 'Editar combo' : 'Agregar combo'}
                >
                  <Edit2 size={14} />
                </button>
              </div>

              {/* Cantidad - Compacto */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                  disabled={quantity <= 1}
                  title="Disminuir"
                >
                  <Minus size={12} />
                </button>
                
                <span className="w-5 text-center font-bold text-xs text-gray-800 dark:text-white">
                  {quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
                  title="Aumentar"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Subtotal - Compacto */}
              <div className="text-right ml-auto">
                <p className="text-xs font-bold text-gray-800 dark:text-white">
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

