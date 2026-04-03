import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import OrderCard from './OrderCard';
import { Table, ShoppingBag, Bike, Plus } from 'lucide-react';
import KitchenTicketModal from './KitchenTicketModal';

const OrderBoard = ({ onNewOrder, onEditOrder, onPayOrder, onDeleteOrder }) => {
  const { orders = [], updateOrder } = useOrder();
  console.log('🎯 OrderBoard - Órdenes del contexto:', orders);

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
  // 🔴 REGLA FUNDAMENTAL: Solo mostrar órdenes NO COBRADAS
  // ============================================================
  // Status válidos en tablero:
  // - 'pending': Orden recién creada, sin cobrar
  // - 'waiting': Delivery pagado, esperando domiciliario
  // - 'preparing': Mesa/Takeout en preparación
  // 
  // Nunca mostrar:
  // - 'completed': Orden pagada y completada
  // - undefined/null: Órdenes corruptas o viejas
  // ============================================================

  // Filtro estricto: Solo MESA con status 'pending'
  const tableOrders = (orders || [])
    .filter(o => {
      // Mesa + pending = orden sin cobrar
      const isValid = o.type === 'table' && o.status === 'pending';
      if (o.type === 'table' && !isValid) {
        console.log(`🚫 Mesa ${o.id} ocultada: status="${o.status}" (solo mostrar si es 'pending')`);
      }
      return isValid;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Filtro estricto: Solo TAKEOUT con status 'pending'
  const takeoutOrders = (orders || [])
    .filter(o => {
      const isValid = o.type === 'takeout' && o.status === 'pending';
      if (o.type === 'takeout' && !isValid) {
        console.log(`🚫 Takeout ${o.id} ocultada: status="${o.status}"`);
      }
      return isValid;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Filtro estricto: Solo DELIVERY con status 'pending' (sin cobrar)
  // Una vez pagado pasa a 'waiting' y sale de aquí
  const deliveryOrders = (orders || [])
    .filter(o => {
      const isValid = o.type === 'delivery' && o.status === 'pending';
      if (o.type === 'delivery' && !isValid) {
        console.log(`🚫 Delivery ${o.id} ocultada: status="${o.status}"`);
      }
      return isValid;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Sumar costos de entrega SOLO de domicilios en espera o completados
  // (órdenes pendientes sin pagar no tienen costo de entrega aún confirmado)
  const deliveryTotal = (orders || [])
    .filter(o => o.type === 'delivery' && (o.status === 'waiting' || o.status === 'completed'))
    .reduce((sum, o) => sum + (o.deliveryCost || 0), 0);

  console.log(`📊 TABLERO - Mesa: ${tableOrders.length} (pending), Takeout: ${takeoutOrders.length} (pending), Delivery: ${deliveryOrders.length} (pending) | Total cargadas: ${orders.length}`);

  const Column = ({ title, Icon, orders, type, color, totalCost }) => {
    console.log(`🔶 Column ${title} - Órdenes recibidas:`, orders);
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
            console.log(`📌 Renderizando orden ${idx}:`, order);
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
