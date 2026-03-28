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
    <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl transition-all p-2 sm:p-3 md:p-4 lg:p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:scale-105">
      <div className="w-full h-20 sm:h-28 md:h-32 lg:h-40 bg-gray-100 dark:bg-gray-700 rounded-lg mb-1 sm:mb-2 md:mb-3 lg:mb-4 flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"></span>
        )}
      </div>
      
      <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white mb-0.5 sm:mb-1 truncate line-clamp-2">
        {product.name}
      </h3>
      
      <p className="text-xs sm:text-xs md:text-sm lg:text-sm text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 line-clamp-1">
        {product.category}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-blue-600 dark:text-blue-400 flex-1">
          {formatCurrency(product.price)}
        </span>
        <button
          onClick={handleAdd}
          className="w-full sm:flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2 rounded-lg font-semibold text-xs sm:text-xs md:text-sm lg:text-sm transition-colors active:scale-95"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
