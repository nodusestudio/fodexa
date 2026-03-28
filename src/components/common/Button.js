import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  full = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizes = {
    sm: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
    md: 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base',
    lg: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg',
  };

  const fullWidth = full ? 'w-full' : '';

  return (
    <button
      className={
        rounded-lg sm:rounded-lg 
        font-semibold
        transition-colors
        \
        \
        \
        \
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
