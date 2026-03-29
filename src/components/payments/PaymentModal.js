import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useTickets } from '../../context/TicketContext';
import { useCash } from '../../context/CashContext';
import { useOrder } from '../../context/OrderContext';
import { CreditCard, Banknote, Smartphone, X } from 'lucide-react';

const paymentTypes = [
  {
    key: 'cash',
    label: 'Efectivo',
    icon: Banknote,
    bg: 'bg-green-100 hover:bg-green-200',
  },
  {
    key: 'card',
    label: 'Tarjeta',
    icon: CreditCard,
    bg: 'bg-blue-100 hover:bg-blue-200',
  },
  {
    key: 'transfer',
    label: 'Transferencia',
    icon: Smartphone,
    bg: 'bg-purple-100 hover:bg-purple-200',
  },
];



// NUEVA LÓGICA DE PAGO INTELIGENTE Y POST-PAGO
function PaymentModal({ isOpen, onClose, orderData, onComplete }) {
  const { createTicket } = useTickets();
  const { addMovement, isCashOpen } = useCash();
  const { updateOrder } = useOrder();
  // Calcular subtotal en tiempo real (productos + addons)
  const calcSubtotal = () => {
    if (!orderData?.items) return 0;
    return orderData.items.reduce((sum, item) => {
      const base = (parseFloat(item.price) || 0) * (item.quantity || 1);
      const addonsTotal = Array.isArray(item.addons)
        ? item.addons.reduce((aSum, addon) => aSum + (parseFloat(addon.price) || 0) * (item.quantity || 1), 0)
        : 0;
      return sum + base + addonsTotal;
    }, 0);
  };
  const subtotal = calcSubtotal();

  // IVA según configuración
  const taxesConfig = orderData.taxesConfig || (window.settings && window.settings.taxes) || {};
  const taxEnabled = taxesConfig && taxesConfig.enabled === true;
  const taxValue = taxesConfig && taxesConfig.value ? parseFloat(taxesConfig.value) : 0;
  const iva = taxEnabled && taxValue > 0 ? subtotal * (taxValue / 100) : 0;
  // El total real a cobrar (sin IVA si está desactivado)
  const deliveryCost = orderData?.deliveryCost || 0;
  const total = subtotal + (taxEnabled ? iva : 0) + deliveryCost;
  const [paymentMethods, setPaymentMethods] = useState([
    { type: 'cash', amount: total, change: 0 }
  ]);
  const [selectedTypes, setSelectedTypes] = useState(['cash']);
  const [amounts, setAmounts] = useState({ cash: total });
  const [success, setSuccess] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [postOrder, setPostOrder] = useState(null);
  const items = orderData?.items || [];

  // Alternar selección de tipo de pago (máximo 2)
  const handleTypeToggle = (key) => {
    setSelectedTypes((prev) => {
      if (prev.includes(key)) {
        // Si ya está seleccionado, lo quitamos
        const updated = prev.filter((t) => t !== key);
        setAmounts((a) => {
          const copy = { ...a };
          delete copy[key];
          return copy;
        });
        return updated;
      } else {
        // Si hay menos de 2, lo agregamos
        if (prev.length < 2) {
          // Autollenar con el total pendiente
          let suggested = '';
          if (prev.length === 0) {
            suggested = total;
          } else if (prev.length === 1) {
            // Si ya hay uno, sugerir el restante
            const other = prev[0];
            const otherVal = parseFloat(amounts[other]) || 0;
            suggested = Math.max(total - otherVal, 0);
          }
          setAmounts((a) => ({ ...a, [key]: suggested }));
          return [...prev, key];
        }
        return prev;
      }
    });
  };

  // Manejar cambio de monto
  const handleAmountChange = (key, value) => {
    // Si el usuario borra el valor, sugerir el total pendiente
    let val = value;
    if (value === '' && selectedTypes.length === 1) {
      val = total;
    }
    setAmounts((a) => ({ ...a, [key]: val }));
  };

  // Calcular cambio para efectivo
  const change = selectedTypes.includes('cash')
    ? (parseFloat(amounts['cash']) || 0) + (selectedTypes.length === 2 ? (parseFloat(amounts[selectedTypes.find(t => t !== 'cash')]) || 0) : 0) - total
    : 0;

  // Calcular total ingresado
  const totalEntered = selectedTypes.reduce((sum, key) => sum + (parseFloat(amounts[key]) || 0), 0);

  // Auto-llenado inteligente
  const addPaymentMethod = () => {
    const totalPaid = paymentMethods.reduce((sum, p) => sum + p.amount, 0);
    const remaining = total - totalPaid;
    setPaymentMethods([
      ...paymentMethods,
      { type: 'card', amount: remaining, change: 0 }
    ]);
  };

  const updatePaymentAmount = (index, amount) => {
    const updated = [...paymentMethods];
    updated[index].amount = parseFloat(amount) || 0;
    // Auto-ajustar el último método si es necesario
    if (index < paymentMethods.length - 1) {
      const totalPaid = updated.reduce((sum, p, i) => i !== index ? sum + p.amount : sum, 0);
      const remaining = total - totalPaid;
      updated[paymentMethods.length - 1].amount = remaining;
    }
    setPaymentMethods(updated);
  };

  const updatePaymentType = (index, type) => {
    const updated = [...paymentMethods];
    updated[index].type = type;
    setPaymentMethods(updated);
  };

  const calculateChange = (methodIndex) => {
    const method = paymentMethods[methodIndex];
    if (method.type === 'cash') {
      return method.amount - total;
    }
    return 0;
  };

  // Calcular total pagado desde selectedTypes y amounts (nuevo sistema)
  const totalPaid = selectedTypes.reduce((sum, key) => sum + (parseFloat(amounts[key]) || 0), 0);

  const handleCompletePayment = () => {
    if (totalPaid < total) {
      alert(`⚠️ Falta pagar: ${(total - totalPaid).toLocaleString()}`);
      return;
    }
    
    // Construir paymentMethods desde selectedTypes y amounts
    const finalPaymentMethods = selectedTypes.map(key => {
      const amount = parseFloat(amounts[key]) || 0;
      return {
        type: key === 'transfer' ? 'transfer' : key,
        amount: amount,
        change: key === 'cash' ? amount - total : 0
      };
    });

    // Crear orden con múltiples métodos de pago
    // Asegurar que los datos de cliente/delivery se pasen correctamente
    let deliveryData = null;
    if (orderData.type === 'delivery') {
      deliveryData = orderData.deliveryData || orderData.customer || orderData.delivery || null;
    }
    
    // Para domicilios pagados: status = 'waiting' (esperando domiciliario)
    // Para otros: status = 'completed' (ya finalizado)
    const orderStatus = orderData.type === 'delivery' ? 'waiting' : 'completed';
    
    const order = {
      ...orderData,
      subtotal,
      total,
      iva,
      deliveryCost,
      status: orderStatus,
      paymentMethods: finalPaymentMethods,
      paymentType: finalPaymentMethods.length === 1 ? finalPaymentMethods[0].type : 'mixed',
      deliveryData,
      customer: deliveryData, // for legacy/compatibility
    };

    // Registrar en caja
    if (isCashOpen) {
      finalPaymentMethods.forEach(method => {
        addMovement('sale', method.amount, `Venta ${method.type} - Ticket #${Date.now().toString().slice(-6)}`);
      });
    }

    // Guardar ticket en local
    createTicket(order);
    
    // Actualizar orden en Firebase para persistir el estado y pago
    if (orderData.id) {
      updateOrder(orderData.id, {
        status: orderStatus,
        paymentMethods: finalPaymentMethods,
        paymentType: orderStatus === 'waiting' ? undefined : finalPaymentMethods.length === 1 ? finalPaymentMethods[0].type : 'mixed',
        deliveryData: orderData.type === 'delivery' ? deliveryData : undefined,
      });
    }
    
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowPostOptions(true);
      setPostOrder(order);
      // Confirmar impresión de ticket
      if (window.confirm('¿Desea imprimir el ticket?')) {
        printReceipt(order);
      }
      onComplete && onComplete(finalPaymentMethods);
      // Cerrar modal después de procesar pago
      onClose();
    }, 1000);
  };

  // Opciones post-pago
  const printReceipt = (order) => {
    // Integrar con el sistema real de impresión de tickets
    window.dispatchEvent(new CustomEvent('orderSaved', { detail: order }));
  };

  const copyToClipboard = (order) => {
    const receiptText = generateWhatsAppReceipt(order);
    navigator.clipboard.writeText(receiptText).then(() => {
      alert('📋 Recibo copiado al portapapeles\n\nPuedes pegarlo en WhatsApp');
    });
  };

  const generateWhatsAppReceipt = (order) => {
    const date = new Date(order.createdAt || Date.now()).toLocaleString('es-CO');
    let text = `*${order.companyName || 'Mi Restaurante'}*\n`;
    text += `*TICKET ${order.ticketNumber || ''}*\n`;
    text += `📅 ${date}\n\n`;
    if (order.type === 'table') {
      text += `🪑 Mesa ${order.tableNumber}\n\n`;
    } else if (order.type === 'delivery') {
      text += `🚴 Domicilio\n`;
      text += `👤 ${order.deliveryData?.name || ''}\n`;
      text += `📞 ${order.deliveryData?.phone || ''}\n`;
      text += `📍 ${order.deliveryData?.address || ''}\n\n`;
    }
    text += `*PEDIDO:*\n`;
    order.items.forEach(item => {
      text += `• ${item.quantity}x ${item.name}\n`;
      if (item.addons && item.addons.length > 0) {
        item.addons.forEach(addon => {
          text += `  + ${addon.name}\n`;
        });
      }
      if (item.notes) {
        text += `  📝 ${item.notes}\n`;
      }
    });
    text += `\n*SUBTOTAL:* $${order.subtotal?.toLocaleString() || ''}\n`;
    if (order.iva > 0) {
      text += `*Impuesto:* $${order.iva?.toLocaleString() || ''}\n`;
    }
    if (order.deliveryCost > 0) {
      text += `*DOMICILIO:* $${order.deliveryCost.toLocaleString()}\n`;
    }
    text += `\n*TOTAL:* *$${order.total?.toLocaleString() || ''}*\n\n`;
    text += `💳 *Pago:*\n`;
    order.paymentMethods.forEach(method => {
      const methodName = method.type === 'cash' ? 'Efectivo' : 
                         method.type === 'card' ? 'Tarjeta' : 'Transferencia';
      text += `• ${methodName}: $${method.amount.toLocaleString()}\n`;
    });
    text += `\n¡Gracias por tu compra! 🎉`;
    return text;
  };

  // Renderizado
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl relative transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Procesar Pago</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
        {/* Resumen de la orden */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 transition-colors">
          <ul className="mb-2">
            {items.map((item) => {
              const name = item.name || item.productName || 'Producto';
              const price = parseFloat(item.price) || parseFloat(item.unitPrice) || 0;
              const quantity = parseInt(item.quantity) || 1;
              const subtotal = price * quantity;
              return (
                <li key={item.id} className="flex justify-between text-sm mb-1">
                  <span className="dark:text-gray-200">{name} x{quantity}</span>
                  <span className="dark:text-gray-200">{formatCurrency(subtotal)}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between text-xs mb-1 text-gray-700 dark:text-gray-300">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {deliveryCost > 0 && (
            <div className="flex justify-between text-xs mb-1 text-gray-700 dark:text-gray-300">
              <span>Costo domicilio</span>
              <span>{formatCurrency(deliveryCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold mt-2 text-gray-900 dark:text-primary-400">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        {/* Tipos de pago (selección múltiple hasta 2) */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {paymentTypes.map(({ key, label, icon: Icon, bg }) => (
            <button
              key={key}
              type="button"
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-semibold transition-all border-2 ${bg} ${selectedTypes.includes(key) ? 'border-primary-600 ring-2 ring-primary-400' : 'border-transparent'}`}
              onClick={() => handleTypeToggle(key)}
              disabled={selectedTypes.length === 2 && !selectedTypes.includes(key)}
            >
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
        {/* Inputs para los métodos seleccionados */}
        {selectedTypes.map(key => {
          const type = paymentTypes.find(t => t.key === key);
          return (
            <div className="mb-4" key={key}>
              <label className="block text-sm font-semibold mb-1">{type.label} - Monto</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 mb-1"
                placeholder={`Monto en ${type.label}`}
                value={amounts[key] || ''}
                onChange={e => handleAmountChange(key, e.target.value)}
              />
              {key === 'cash' && (
                <div className="text-xs text-gray-600">
                  Cambio: <span className="font-bold">${change.toFixed(2)}</span>
                </div>
              )}
            </div>
          );
        })}
        {/* Confirmar pago */}
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl w-full font-bold text-lg mt-2 disabled:opacity-60"
          onClick={handleCompletePayment}
          disabled={selectedTypes.length === 0 || selectedTypes.some(key => !amounts[key] || parseFloat(amounts[key]) <= 0) || Math.abs(totalEntered - total) > 0.01}
        >
          {selectedTypes.length > 1 ? 'Confirmar Pago Dividido' : 'Confirmar Pago'}
        </button>
        {/* Mensaje de éxito */}
        {success && (
          <div className="mt-4 text-center text-green-600 font-bold text-lg animate-pulse">
            ¡Pago realizado con éxito!
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
