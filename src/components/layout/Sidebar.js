import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, FileText, Settings, DollarSign, Users, X, Truck } from 'lucide-react';

const navItems = [
  { to: '/', icon: ShoppingCart, label: 'Punto de Venta' },
  { to: 'deliveries', icon: Truck, label: 'Domicilios' },
  { to: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'reports', icon: FileText, label: 'Reportes' },
  { to: 'ledger', icon: FileText, label: 'Libro Contable' },
  { to: 'tickets', icon: FileText, label: 'Tickets' },
  { to: 'cash', icon: DollarSign, label: 'Caja' },
  { to: 'customers', icon: Users, label: 'Clientes' },
  { to: 'articles', icon: null, label: 'Artículos', customIcon: true },
];

function Sidebar({ onClose }) {
  const handleNavClick = () => {
    onClose();
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
        {navItems.map(({ to, icon: Icon, label, customIcon }) => (
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
            {customIcon ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ) : (
              Icon && <Icon className="w-5 h-5" />
            )}
            {label}
          </NavLink>
        ))}
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