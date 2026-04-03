import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import OrderCard from './OrderCard';
import { Table, ShoppingBag, Bike, Plus } from 'lucide-react';
import KitchenTicketModal from './KitchenTicketModal';

const OrderBoard = ({ onNewOrder, onEditOrder, onPayOrder, onDeleteOrder }) => {
  const { orders = [], updateOrder } = useOrder();
  console.log('🎯 [TABLERO] Órdenes cargadas del contexto:', orders.length);
  orders.forEach((o, idx) => {
    console.log(`  [${idx}] ${o.id.substring(0,8)}... type=${o.type} status=${o.status}`);
  });

  const [showKitchenTicket, setShowKitchenTicket] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handlePrintKitchen = (order) => {
    setSelectedOrder(order);
    setShowKitchenTicket(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      console.log(`✅ Orden ${orderId} actualizada a estado: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error actualizando orden:', error);
      alert('Error al actualizar el estado');
    }
  };

  // ============================================================
  // 🔴 REGLA FUNDAMENTAL: Solo mostrar órdenes SIN COBRAR
  // ============================================================
  // VÁLIDO PARA MOSTRAR:
  // - type='table' AND status='pending'
  // - type='takeout' AND status='pending'  
  // - type='delivery' AND status='pending'
  // 
  // EXCLUIR ABSOLUTAMENTE:
  // - Cualquier status que NO sea 'pending'
  // - Órdenes sin type definido
  // - Órdenes sin status definido
  // ============================================================

  // Filtro IMPENETRABLE: Solo MESA status='pending'
  const tableOrders = (orders || [])
    .filter(o => {
      // DEBE ser: type='table' Y status='pending' EXACTAMENTE
      const isTablePending = o.type === 'table' && o.status === 'pending';
      
      if (!isTablePending && o.type === 'table') {
        console.log(`❌ EXCLUIDA MESA: ${o.id} (status="${o.status}", NO es 'pending')`);
      }
      
      return isTablePending;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Filtro IMPENETRABLE: Solo TAKEOUT status='pending'
  const takeoutOrders = (orders || [])
    .filter(o => {
      const isTakeoutPending = o.type === 'takeout' && o.status === 'pending';
      
      if (!isTakeoutPending && o.type === 'takeout') {
        console.log(`❌ EXCLUIDA TAKEOUT: ${o.id} (status="${o.status}", NO es 'pending')`);
      }
      
      return isTakeoutPending;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Filtro IMPENETRABLE: Solo DELIVERY status='pending'
  const deliveryOrders = (orders || [])
    .filter(o => {
      const isDeliveryPending = o.type === 'delivery' && o.status === 'pending';
      
      if (!isDeliveryPending && o.type === 'delivery') {
        console.log(`❌ EXCLUIDA DELIVERY: ${o.id} (status="${o.status}", NO es 'pending')`);
      }
      
      return isDeliveryPending;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Sumar costos de entrega SOLO de domicilios en espera o completados
  // (órdenes pendientes sin pagar no tienen costo de entrega aún confirmado)
  const deliveryTotal = (orders || [])
    .filter(o => o.type === 'delivery' && (o.status === 'waiting' || o.status === 'completed'))
    .reduce((sum, o) => sum + (o.deliveryCost || 0), 0);

  console.log(`📊 [TABLERO ACTUALIZADO] Mesa: ${tableOrders.length} (pending), Takeout: ${takeoutOrders.length} (pending), Delivery: ${deliveryOrders.length} (pending)`);
  if (orders.length > tableOrders.length + takeoutOrders.length + deliveryOrders.length) {
    console.log(`   ⚠️ ${orders.length - tableOrders.length - takeoutOrders.length - deliveryOrders.length} órdenes excluidas (status inválido)`);
  }

  const Column = ({ title, Icon, orders, type, color, totalCost }) => {
    if (orders && orders.length > 0) {
      console.log(`📦 [${title.toUpperCase()}] Mostrando ${orders.length} órdenes`);
    }
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
          orders.map((order, idx) => {
            console.log(`  [${idx}] Renderizando: ${order.id.substring(0,8)}... (type=${order.type}, status=${order.status})`);
            return (
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
            );
          })
        )}
      </div>
    </div>
    );
  };

  return (
    <>
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

export default OrderBoard;
