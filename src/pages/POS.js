
import React, { useState, useEffect } from 'react';
import TicketPrint from '../components/tickets/TicketPrint';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import OrderBoard from '../components/orders/OrderBoard';
import TableSelector from '../components/orders/TableSelector';
import CustomerSelector from '../components/customers/CustomerSelector';
import ProductGrid from '../components/products/ProductGrid';
import CartPanel from '../components/cart/CartPanel';
import OrderInfo from '../components/orders/OrderInfo';
import PaymentModal from '../components/payments/PaymentModal';
import tables from '../data/tables';
import { useProducts } from '../context/ProductContext';
import { ShoppingCart } from 'lucide-react';

const POS = () => {
  const [localOrderType, setLocalOrderType] = useState(null);
  const { currentOrderType, selectedTable, deliveryData, setOrderType, selectTable, setDeliveryData, clearCurrentOrder } = useOrder();
  const { addItem, clearCart, items } = useCart();
  const [view, setView] = useState('board');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);

  const { getActiveProducts, getActiveCategories } = useProducts();
  const dynamicProducts = getActiveProducts();
  const dynamicCategories = getActiveCategories();

  useEffect(() => {
    window.setDeliveryData = (data) => {
      setDeliveryData(prev => ({ ...prev, ...data }));
    };
    return () => {
      delete window.setDeliveryData;
    };
  }, [setDeliveryData]);

  useEffect(() => {
    const handleOrderSaved = (e) => {
      // Solo mostrar ticket si es un PAGO (status: completed)
      const order = e.detail;
      if (order && order.status === 'completed') {
        setTicketToPrint(order);
        setShowPrintModal(true);
      }
      
      // Siempre volver al tablero después de guardar cualquier orden
      setView('board');
      setLocalOrderType(null);
      setShowTableSelector(false);
      setShowCustomerSelector(false);
      setShowProducts(false);
      setShowCartDrawer(false);
      clearCart();
      clearCurrentOrder();
    };
    window.addEventListener('orderSaved', handleOrderSaved);
    return () => {
      window.removeEventListener('orderSaved', handleOrderSaved);
    };
  }, [clearCurrentOrder, clearCart]);

  const { deleteOrder, updateOrder } = useOrder();

  const handleNewOrder = (type) => {
    setView('creating');
    setLocalOrderType(type);
    setOrderType(type);
    clearCart();
    clearCurrentOrder();
    setShowCartDrawer(false);
    
    if (type === 'table') {
      setShowTableSelector(true);
      setShowCustomerSelector(false);
      setShowProducts(false);
    } else if (type === 'delivery') {
      setShowCustomerSelector(true);
      setShowTableSelector(false);
      setShowProducts(false);
    } else {
      setShowTableSelector(false);
      setShowCustomerSelector(false);
      setShowProducts(true);
    }
  };

  const handleEditOrder = (order) => {
    setView('editing');
    setCurrentOrder(order);
    setShowProducts(true);
    setShowTableSelector(false);
    setShowCustomerSelector(false);
    setLocalOrderType(order.type);
    if (order.type === 'table') {
      setOrderType('table');
      selectTable(order.tableNumber);
    } else if (order.type === 'delivery') {
      setOrderType('delivery');
      setDeliveryData(order.deliveryData || {});
    } else if (order.type === 'takeout') {
      setOrderType('takeout');
    }
    clearCart();
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        addItem({ ...item });
      });
    }
  };

  const handlePayOrder = (order) => {
    setCurrentOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentData) => {
    if (currentOrder) {
      // No actualizar status aquí - PaymentModal ya lo hizo
      // Solo actualizar si es un tipo que no sea delivery (que ya maneja su status en PaymentModal)
      const updateData = { payment: paymentData };
      
      // Solo actualizar status para orders que NO son delivery
      // Los delivery ya tienen status = 'waiting' desde PaymentModal
      if (currentOrder.type !== 'delivery') {
        updateData.status = 'completed';
      }
      
      updateOrder(currentOrder.id, updateData);
      
      // Limpiar e ir al tablero
      setCurrentOrder(null);
      setShowPaymentModal(false);
      clearCart();
      setView('board');
      setLocalOrderType(null);
      setShowTableSelector(false);
      setShowCustomerSelector(false);
      setShowProducts(false);
      setShowCartDrawer(false);
      clearCurrentOrder();
    }
  };

  const handleDeleteOrder = (order) => {
    if (window.confirm('¿Eliminar pedido?')) {
      deleteOrder(order.id);
    }
  };

  const handleTableSelect = (tableId) => {
    selectTable(tableId);
    setShowTableSelector(false);
    setShowProducts(true);
  };

  const handleCustomerSelect = (customer) => {
    setDeliveryData({ ...deliveryData, ...customer });
    setShowCustomerSelector(false);
    setShowProducts(true);
  };

  const handleBackToBoard = () => {
    setView('board');
    setLocalOrderType(null);
    setShowTableSelector(false);
    setShowCustomerSelector(false);
    setShowProducts(false);
    setShowCartDrawer(false);
    clearCurrentOrder();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 h-full flex flex-col transition-colors">
      {view === 'board' && (
        <OrderBoard 
          onNewOrder={handleNewOrder}
          onEditOrder={handleEditOrder}
          onPayOrder={handlePayOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {(view === 'creating' || view === 'editing') && (
        <div className="flex flex-col md:flex-row h-full overflow-hidden relative gap-0 md:gap-2 lg:gap-3">
          {/* Main Content - Full width mobile, flex-1 desktop */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-2 sm:p-3 md:p-4 lg:p-6">
            <button 
              onClick={handleBackToBoard}
              className="mb-2 sm:mb-3 md:mb-4 px-3 py-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
            >
              ← Volver al tablero
            </button>

            {showTableSelector === true && localOrderType === 'table' && (
              <div key="table-selector">
                <TableSelector 
                  tables={tables || []} 
                  selectedTable={selectedTable} 
                  onSelectTable={handleTableSelect} 
                />
              </div>
            )}

            {showCustomerSelector && localOrderType === 'delivery' && (
              <CustomerSelector 
                onSelectCustomer={handleCustomerSelect}
              />
            )}

            {localOrderType && !showTableSelector && !showCustomerSelector && (
              <OrderInfo 
                orderType={localOrderType} 
                tableNumber={selectedTable} 
                deliveryData={deliveryData} 
                onClear={handleBackToBoard}
              />
            )}

            {showProducts && (
              <>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 lg:gap-4 mb-2 sm:mb-3 md:mb-4 lg:mb-4">
                  <div className="flex-1 min-w-0 relative">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 md:pl-4 pr-3 md:pr-4 py-2 text-xs sm:text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-2 md:px-3 lg:px-4 py-2 text-xs sm:text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  >
                    <option value="all">Todas las categorías</option>
                    {dynamicCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                  <ProductGrid
                    products={dynamicProducts}
                    onAddToCart={addItem}
                    searchQuery={searchQuery}
                    category={category}
                  />
                </div>
              </>
            )}
          </div>

          {/* Desktop Cart Panel - Hidden on mobile */}
          <div className="hidden md:flex w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-700 flex-col min-h-0">
            <CartPanel 
              orderType={localOrderType}
              selectedTable={selectedTable}
              deliveryData={deliveryData}
              currentOrder={currentOrder}
              onPayOrder={handlePayOrder}
            />
          </div>

          {/* Mobile Cart Button - Fixed floating button */}
          {showProducts && items && items.length > 0 && (
            <button
              onClick={() => setShowCartDrawer(true)}
              className="fixed bottom-4 right-4 md:hidden z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg font-bold text-base transition-all hover:scale-110 active:scale-95 flex-col gap-0.5"
            >
              <ShoppingCart size={20} />
              <span className="text-xs">{items.length}</span>
            </button>
          )}

          {/* Mobile Cart Drawer */}
          {showCartDrawer && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                onClick={() => setShowCartDrawer(false)}
              />
              
              <div className="fixed inset-y-0 right-0 z-50 md:hidden w-full h-full flex flex-col bg-white dark:bg-gray-800 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Tu Orden</h2>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <CartPanel 
                    orderType={localOrderType}
                    selectedTable={selectedTable}
                    deliveryData={deliveryData}
                    currentOrder={currentOrder}
                    onPayOrder={handlePayOrder}
                    onCloseCart={() => setShowCartDrawer(false)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={currentOrder}
          onComplete={handlePaymentComplete}
        />
      )}

      {showPrintModal && ticketToPrint && (
        <TicketPrint
          ticket={ticketToPrint}
          onClose={() => { setShowPrintModal(false); setTicketToPrint(null); }}
        />
      )}
    </div>
  );
};

export default POS;
