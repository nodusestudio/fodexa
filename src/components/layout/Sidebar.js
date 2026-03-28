import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, FileText, Settings, DollarSign, Users, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: ShoppingCart, label: 'Punto de Venta' },
  { to: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'reports', icon: FileText, label: 'Reportes' },
  { to: 'tickets', icon: FileText, label: 'Tickets' },
];

function Sidebar({ onClose }) {
  const handleNavClick = () => {
    onClose();
  };

  const toggleSubmenu = (id) => {
    const submenu = document.getElementById(id);
    submenu.classList.toggle('hidden');
  };

  return (
    <aside className="w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col transition-colors h-full">
      <div className="h-16 flex items-center justify-between px-4 text-2xl font-bold text-primary-400 border-b border-gray-800 dark:border-gray-900 select-none">
        <span>FODEXA</span>
        <button
          onClick={onClose}
          className="md:hidden p-1 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors rounded-lg mx-2 mb-1 hover:bg-primary-700/40 ${
                isActive ? 'bg-primary-600 dark:bg-primary-700' : ''
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}

        {/* Caja - Con Submenú */}
        <div className="px-3 py-2">
          <button
            onClick={() => toggleSubmenu('cash-submenu')}
            className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Caja</span>
            </div>
            <svg className="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div id="cash-submenu" className="hidden mt-1 ml-4 space-y-1">
            <NavLink
              to="/cash"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              📊 Caja Actual
            </NavLink>
            <NavLink
              to="/cash/history"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              📋 Historial
            </NavLink>
          </div>
        </div>

        {/* Clientes - Con Submenú */}
        <div className="px-3 py-2">
          <button
            onClick={() => toggleSubmenu('customers-submenu')}
            className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">Clientes</span>
            </div>
            <svg className="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div id="customers-submenu" className="hidden mt-1 ml-4 space-y-1">
            <NavLink
              to="/customers"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              👥 Listado de Clientes
            </NavLink>
            <NavLink
              to="/customers/reports"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              📊 Reportes de Clientes
            </NavLink>
          </div>
        </div>

        {/* Artículos - Con Submenú */}
        <div className="px-3 py-2">
          <button
            onClick={() => toggleSubmenu('articles-submenu')}
            className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium">Artículos</span>
            </div>
            <svg className="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div id="articles-submenu" className="hidden mt-1 ml-4 space-y-1">
            <NavLink
              to="/articles/products"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              📦 Productos
            </NavLink>
            <NavLink
              to="/articles/categories"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              📂 Categorías
            </NavLink>
            <NavLink
              to="/articles/addons"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
                }`
              }
            >
              🎁 Adicionales
            </NavLink>
          </div>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-800 dark:border-gray-900">
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 dark:bg-primary-700 text-white'
                : 'bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-200'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          Configuración
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;