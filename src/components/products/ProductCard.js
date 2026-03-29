import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }
  };

  return (
    <>
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
