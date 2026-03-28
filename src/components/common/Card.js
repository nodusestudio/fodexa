import React from 'react';

const Card = ({ 
  children, 
  className = '',
  noPadding = false,
  ...props 
}) => {
  const padding = noPadding ? '' : 'p-3 sm:p-4 md:p-6';

  return (
    <div
      className={
        bg-white dark:bg-gray-800
        rounded-lg sm:rounded-xl
        shadow-md hover:shadow-lg
        transition-all
        border border-gray-200 dark:border-gray-700
        \
        \
      }
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
