import React from 'react';

const MetricCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg sm:hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white truncate">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>{trend === 'up' ? '📈' : '📉'}</span>
              <span className="font-medium">{trendValue}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} className="sm:w-8 sm:h-8" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
