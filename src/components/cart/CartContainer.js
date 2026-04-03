// CartContainer.js - Single responsive cart instance for desktop/mobile
import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import CartPanel from './CartPanel';

const CartContainer = ({ 
  orderType, 
  selectedTable, 
  deliveryData, 
  currentOrder, 
  onPayOrder,
  items 
}) => {
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Monitor viewport changes
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      // Close drawer when transitioning to desktop
      if (window.innerWidth >= 768) {
        setShowCartDrawer(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ONLY ONE CartPanel instance - rendered based on viewport
  const cartPanelContent = (
    <CartPanel
      orderType={orderType}
      selectedTable={selectedTable}
      deliveryData={deliveryData}
      currentOrder={currentOrder}
      onPayOrder={onPayOrder}
      onCloseCart={!isDesktop ? () => setShowCartDrawer(false) : () => null}
    />
  );

  return (
    <>
      {/* DESKTOP: Sidebar panel (only render on desktop) */}
      {isDesktop && (
        <div className="w-96 border-l border-gray-300 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 min-h-0">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Tu Orden</h2>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {cartPanelContent}
          </div>
        </div>
      )}

      {/* MOBILE: Floating button + Drawer (only render on mobile) */}
      {!isDesktop && (
        <>
          {/* Floating Button */}
          {items && items.length > 0 && (
            <button
              onClick={() => setShowCartDrawer(true)}
              className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center shadow-lg font-bold text-xs sm:text-sm transition-all hover:scale-110 active:scale-95 flex-col gap-0.5"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs">{items.length}</span>
            </button>
          )}

          {/* Drawer Overlay */}
          {showCartDrawer && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => setShowCartDrawer(false)}
              />
              <div className="fixed inset-y-0 right-0 z-50 w-full h-full flex flex-col bg-white dark:bg-gray-800 animate-in slide-in-from-right-80 duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Tu Orden</h2>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-auto min-h-0">
                  {cartPanelContent}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default CartContainer;
