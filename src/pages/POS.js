
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CashFundControl from '../components/cash/CashFundControl';
import tables from '../data/tables';
import { useProducts } from '../context/ProductContext';
import { useCash } from '../context/CashContext';
import { ShoppingCart, Lock, AlertCircle, Check } from 'lucide-react';

const POS = () => {
  const navigate = useNavigate();
  const [localOrderType, setLocalOrderType] = useState(null);
  const { currentOrderType, selectedTable, deliveryData, setOrderType, selectTable, setDeliveryData, clearCurrentOrder } = useOrder();
  const { addItem, clearCart, items } = useCart();
  const { isCashOpen, cashSession, openCash, setCashSession } = useCash();
  const [showNoCashModal, setShowNoCashModal] = useState(false);
  const [showOpenCashFlow, setShowOpenCashFlow] = useState(false);
  const [showFundModalFromPOS, setShowFundModalFromPOS] = useState(false);
  const [view, setView] = useState('board');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showOrderInfo, setShowOrderInfo] = useState(false);
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

  // ✅ PHASE 3: Validar que caja esté abierta
  useEffect(() => {
    if (!isCashOpen) {
      setShowNoCashModal(true);
      setView('board');
      setLocalOrderType(null);
      setShowTableSelector(false);
      setShowCustomerSelector(false);
      setShowProducts(false);
    }
  }, [isCashOpen]);

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
      // Mostrar ticket para imprimir (para cualquier tipo de orden)
      const order = e.detail;
      if (order) {
        setTicketToPrint(order);
        setShowPrintModal(true);
      }
      
      // Siempre volver al tablero después de guardar cualquier orden
      setView('board');
      setLocalOrderType(null);
      setShowTableSelector(false);
      setShowCustomerSelector(false);
      setShowOrderInfo(false);
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

  // Crear ticket cuando se guarda domicilio sin pago
  useEffect(() => {
    const handleCreateDeliveryTicket = (e) => {
      const { createTicket } = require('../context/TicketContext');
      console.log('📦 Creando ticket de domicilio automáticamente');
      // Este evento se dispara desde CartPanel cuando se guarda un domicilio
    };
    window.addEventListener('createDeliveryTicket', handleCreateDeliveryTicket);
    return () => {
      window.removeEventListener('createDeliveryTicket', handleCreateDeliveryTicket);
    };
  }, []);

  const { deleteOrder, updateOrder } = useOrder();

  const handleNewOrder = (type) => {
    // ✅ PHASE 3: Bloquear si caja no está abierta
    if (!isCashOpen) {
      alert('⚠️ Debes abrir caja antes de crear órdenes');
      setShowNoCashModal(true);
      return;
    }

    console.log('📝 handleNewOrder llamado con type:', type);
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
      console.log('🚚 Abriendo selector de clientes para delivery');
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
    console.log('✅ Cliente seleccionado:', customer.name);
    setDeliveryData({ ...deliveryData, ...customer });
    setShowCustomerSelector(false);  // ← Cierra el selector automáticamente
    setShowOrderInfo(true);  // ← Muestra OrderInfo para ingresar costo
  };

  const handleBackToBoard = () => {
    setView('board');
    setLocalOrderType(null);
    setShowTableSelector(false);
    setShowCustomerSelector(false);
    setShowOrderInfo(false);
    setShowProducts(false);
    setShowCartDrawer(false);
    clearCurrentOrder();
  };

  const handleDeliveryInfoConfirm = () => {
    setShowOrderInfo(false);
    setShowProducts(true);
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

            {/* Mostrar OrderInfo SOLO si es delivery y se seleccionó cliente */}
            {localOrderType === 'delivery' && !showTableSelector && !showCustomerSelector && showOrderInfo && (
              <OrderInfo 
                orderType={localOrderType} 
                tableNumber={selectedTable} 
                deliveryData={deliveryData} 
                onClear={handleBackToBoard}
                onConfirm={handleDeliveryInfoConfirm}
              />
            )}

            {/* Para ordenes de mesa, mostrar OrderInfo si no se selecciona mesa aún */}
            {localOrderType === 'table' && !showTableSelector && !showCustomerSelector && (
              <OrderInfo 
                orderType={localOrderType} 
                tableNumber={selectedTable} 
                deliveryData={deliveryData} 
                onClear={handleBackToBoard}
              />
            )}

            {/* Para ordenes takeout, mostrar OrderInfo */}
            {localOrderType === 'takeout' && !showTableSelector && !showCustomerSelector && (
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
              className="fixed bottom-4 right-4 md:hidden z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center shadow-lg font-bold text-xs sm:text-sm transition-all hover:scale-110 active:scale-95 flex-col gap-0.5"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
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
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Tu Orden</h2>
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

      {/* Modal - Pregunta conteo de billetes */}
      {showOpenCashFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-8 text-center space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                <Check size={28} className="sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                ✅ Caja Abierta
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                ¿Deseas hacer el conteo de billetes y monedas ahora?
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                onClick={() => {
                  setShowOpenCashFlow(false);
                  setShowFundModalFromPOS(true);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                Sí, Contar Ahora
              </button>
              <button
                onClick={() => setShowOpenCashFlow(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                No, Más Tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CashFundControl desde POS */}
      {showFundModalFromPOS && (
        <CashFundControl
          fundAmount={cashSession?.fundAmount || 0}
          onClose={() => setShowFundModalFromPOS(false)}
          onUpdate={(newAmount) => {
            if (cashSession) {
              setCashSession({
                ...cashSession,
                fundAmount: newAmount
              });
            }
            setShowFundModalFromPOS(false);
          }}
          isStandalone={true}
        />
      )}

      {/* ✅ PHASE 3: Modal - Caja no abierta */}
      {showNoCashModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-8 text-center space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-orange-100 dark:bg-orange-900 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                <Lock size={28} className="sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                💰 Caja Cerrada
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Debes abrir caja antes de crear órdenes
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle size={18} className="sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-orange-900 dark:text-orange-300 text-xs sm:text-sm">
                    {cashSession 
                      ? `Caja abierta: ${new Date(cashSession.openDate).toLocaleTimeString('es-CO')}`
                      : 'No hay sesión de caja activa. Accede a la sección de Caja para abrir.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                onClick={() => {
                  setShowNoCashModal(false);
                  setShowOpenCashFlow(true);
                  openCash({ initialAmount: 0 });
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                Abrir Caja Now
              </button>
              <button
                onClick={() => setShowNoCashModal(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
