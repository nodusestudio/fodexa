import React, { memo, useCallback, useMemo, useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import OrderCard from './OrderCard';
import { Table, ShoppingBag, Bike, Plus } from 'lucide-react';
import KitchenTicketModal from './KitchenTicketModal';

const OrderBoard = ({ onNewOrder, onEditOrder, onPayOrder, onDeleteOrder }) => {
  const { orders = [], updateOrder, isOffline } = useOrder();

  const [showKitchenTicket, setShowKitchenTicket] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handlePrintKitchen = useCallback((order) => {
    setSelectedOrder(order);
    setShowKitchenTicket(true);
  }, []);

  const handleUpdateStatus = useCallback(async (orderId, statusData) => {
    try {
      const updateData = typeof statusData === 'string' 
        ? { status: statusData }
        : statusData;

      await updateOrder(orderId, updateData);
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }, [updateOrder]);

  const { tableOrders, takeoutOrders, deliveryOrders, deliveryTotal } = useMemo(() => {
    const validStatuses = new Set(['pending', 'preparing', 'waiting', 'ready']);
    const nextTable = [];
    const nextTakeout = [];
    const nextDelivery = [];
    let nextDeliveryTotal = 0;

    (orders || []).forEach((order) => {
      if (!order?.type || !validStatuses.has(order?.status)) return;

      if (order.type === 'table') {
        nextTable.push(order);
      } else if (order.type === 'takeout') {
        nextTakeout.push(order);
      } else if (order.type === 'delivery') {
        nextDelivery.push(order);
      }

      if (order.type === 'delivery' && (order.status === 'waiting' || order.status === 'completed')) {
        nextDeliveryTotal += order.deliveryCost || 0;
      }
    });

    const sortByTimestampDesc = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
    nextTable.sort(sortByTimestampDesc);
    nextTakeout.sort(sortByTimestampDesc);
    nextDelivery.sort(sortByTimestampDesc);

    return {
      tableOrders: nextTable,
      takeoutOrders: nextTakeout,
      deliveryOrders: nextDelivery,
      deliveryTotal: nextDeliveryTotal,
    };
  }, [orders]);

  const Column = ({ title, Icon, orders, type, color, totalCost }) => {
    return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] transition-colors">
      <div className={color + " text-white dark:text-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 flex justify-between items-center gap-2 shadow-md transition-colors"}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Icon size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">{title}</h3>
            <span className="text-xs sm:text-sm">{(orders || []).length} pedidos</span>
            {totalCost !== undefined && (
              <span className="text-xs sm:text-sm block mt-1">Total: ${totalCost.toFixed(0)}</span>
            )}
          </div>
        </div>
        <button 
          type="button"
          onClick={() => {
            if (onNewOrder) {
              onNewOrder(type);
            }
          }}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors flex-shrink-0 cursor-pointer"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm">Nuevo</span>
        </button>
      </div>
      <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto pb-2">
        {!orders || orders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">Sin pedidos</p>
        ) : (
          orders.map((order, idx) => (
            <div key={order.id || idx}>
              <OrderCard 
                order={order} 
                onEdit={onEditOrder} 
                onPay={onPayOrder}
                onDelete={onDeleteOrder}
                onUpdateStatus={handleUpdateStatus}
                onPrintKitchen={handlePrintKitchen}
              />
            </div>
          ))
        )}
      </div>
    </div>
    );
  };

  return (
    <>
      {isOffline && (
        <div className="mb-3 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs sm:text-sm">
          Trabajando en Modo Local (Sincronizacion pausada)
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Column title="Mesa" Icon={Table} orders={tableOrders} type="table" color="bg-blue-600" />
        <Column title="Para Llevar" Icon={ShoppingBag} orders={takeoutOrders} type="takeout" color="bg-green-600" />
        <Column title="Domicilio" Icon={Bike} orders={deliveryOrders} type="delivery" color="bg-orange-600" totalCost={deliveryTotal} />
      </div>

      {showKitchenTicket && selectedOrder && (
        <KitchenTicketModal
          order={selectedOrder}
          onClose={() => { setShowKitchenTicket(false); setSelectedOrder(null); }}
        />
      )}
    </>
  );
};

export default memo(OrderBoard);
