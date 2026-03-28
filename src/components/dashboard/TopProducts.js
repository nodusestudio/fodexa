import React from 'react';
import { Package } from 'lucide-react';

const TopProducts = ({ products, totalSales }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
            <Package className="text-blue-600 dark:text-blue-400" size={20} />
            🏆 Top Productos
          </h3>
        </div>
        <div className="p-3 sm:p-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Sin ventas en este período
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
          <Package className="text-blue-600 dark:text-blue-400" size={20} />
          🏆 Top Productos
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Categoría</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cant.</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <span className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                    index === 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    index === 1 ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200' :
                    index === 2 ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </span>
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-medium text-gray-800 dark:text-white text-xs sm:text-sm">
                  {product.name}
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">
                  {product.category}
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                  {product.quantity}
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-semibold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  ${product.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                  {totalSales > 0 ? ((product.total / totalSales) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
