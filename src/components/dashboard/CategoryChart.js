import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CategoryChart = ({ data, title }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 sm:h-64 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>No hay datos</p>
        </div>
      </div>
    );
  }

  // Ordenar por valor descendente y tomar top 10 para mejor visualización
  const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          />
          <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {data.length > 10 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          📊 Mostrando top 10 de {data.length} categorías
        </p>
      )}
    </div>
  );
};

export default CategoryChart;
