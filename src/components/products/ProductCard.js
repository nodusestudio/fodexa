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
    <div className="rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all p-2 sm:p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="w-full h-24 sm:h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 sm:mb-4 flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-3xl sm:text-5xl"></span>
        )}
      </div>
      
      <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white mb-1 truncate">
        {product.name}
      </h3>
      
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
        {product.category}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 flex-1">
          {formatCurrency(product.price)}
        </span>
        <button
          onClick={handleAdd}
          className="w-full sm:flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
