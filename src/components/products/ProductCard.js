import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import ComboSelector from './ComboSelector';
import BebidaSelectorCombo from './BebidaSelectorCombo';

const ProductCard = ({ product, onAddToCart }) => {
  const [showComboSelector, setShowComboSelector] = useState(false);
  const [showBebidaSelector, setShowBebidaSelector] = useState(false);

  // Productos normales que pueden agregar un combo (papas + bebida)
  const COMBO_CATEGORIES = [
    'Burger Clásicas',
    'Burger Premium',
    'Pepitos Venezolanos',
    'Perros Calientes',
  ];

  // Productos que SON combos directos (ya incluyen bebida)
  const COMBO_PRODUCT_CATEGORIES = [
    'Combos de Burger',
    'Combos de Perros',
    'Combos Express',
  ];

  // DEBUG: Log product structure
  console.log('ProductCard DEBUG - Product:', product);
  console.log('ProductCard DEBUG - product.category:', product.category);

  const shouldShowComboSelector = COMBO_CATEGORIES.includes(product.category);
  const shouldShowBebidaSelector = COMBO_PRODUCT_CATEGORIES.includes(product.category);

  const handleAdd = () => {
    if (shouldShowBebidaSelector) {
      // Es un combo directo, mostrar selector de bebida
      setShowBebidaSelector(true);
    } else if (shouldShowComboSelector) {
      // Es un producto normal, mostrar ComboSelector para agregar combo
      setShowComboSelector(true);
    } else if (onAddToCart) {
      // Es un producto sin combo
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
      });
    }
  };

  const handleComboConfirm = (cartItem) => {
    if (onAddToCart) {
      onAddToCart({
        ...cartItem,
        category: product.category,
      });
      setShowComboSelector(false);
    }
  };

  const handleBebidaConfirm = (cartItem) => {
    if (onAddToCart) {
      onAddToCart(cartItem);
      setShowBebidaSelector(false);
    }
  };

  return (
    <>
      {showComboSelector && (
        <ComboSelector
          product={product}
          onConfirm={handleComboConfirm}
          onCancel={() => setShowComboSelector(false)}
        />
      )}
      {showBebidaSelector && (
        <BebidaSelectorCombo
          product={product}
          onConfirm={handleBebidaConfirm}
          onCancel={() => setShowBebidaSelector(false)}
        />
      )}
      <div className="rounded-lg shadow-md hover:shadow-lg transition-all p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
        <div className="w-full h-20 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-2xl sm:text-3xl"></span>
          )}
        </div>
        
        <h3 className="font-bold text-xs sm:text-sm text-gray-800 dark:text-white mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
          {product.category}
        </p>
        
        <div className="flex flex-col gap-1.5 mt-auto">
          <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-2 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-colors hover:shadow-md"
          >
            Agregar
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
