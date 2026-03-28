import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Products from './Products';
import Categories from './Categories';
import Addons from './Addons';

const tabRoutes = [
  { id: 'products', label: 'Productos', icon: '📦', path: '/articles/products' },
  { id: 'categories', label: 'Categorías', icon: '📂', path: '/articles/categories' },
  { id: 'addons', label: 'Adicionales', icon: '🎁', path: '/articles/addons' },
];

const Articles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Detectar tab activo según la ruta
  const getTabFromPath = () => {
    const found = tabRoutes.find(tab => location.pathname.startsWith(tab.path));
    return found ? found.id : 'products';
  };
  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-3xl">📦</span>
          Gestión de Artículos
        </h1>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex gap-4">
          {tabRoutes.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                px-4 py-3 font-medium text-sm border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'products' && <Products />}
        {activeTab === 'categories' && <Categories />}
        {activeTab === 'addons' && <Addons />}
      </div>
    </div>
  );
};

export default Articles;
