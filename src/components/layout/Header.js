import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import DarkModeToggle from '../layout/DarkModeToggle';

function formatDateEs(date) {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function Header({ sidebarOpen, toggleSidebar }) {
  const user = {
    name: 'Cajero Demo',
    role: 'Cajero',
    avatar: null,
  };
  const today = new Date();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-3 sm:py-4 transition-colors">
      <div className="flex justify-between items-center gap-3 sm:gap-6">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Bienvenido</h2>
          <p className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm hidden sm:block">{formatDateEs(today)}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          <button className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700 dark:text-gray-200" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span>
          </button>
          <DarkModeToggle />
          <div className="w-px h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">{user.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
