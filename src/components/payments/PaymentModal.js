import React, { useState, useContext, useMemo, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useTickets } from '../../context/TicketContext';
import { useCash } from '../../context/CashContext';
import { useOrder } from '../../context/OrderContext';
import { useSettings } from '../../context/SettingsContext';
import { CreditCard, Banknote, Smartphone, X } from 'lucide-react';

// Mapa de iconos por tipo de método
const iconMap = {
  cash: Banknote,
  card: CreditCard,
  transfer: Smartphone,
  pse: Smartphone,
  check: Banknote,
  credit: CreditCard,
};

// NUEVA LÓGICA DE PAGO INTELIGENTE Y POST-PAGO
function PaymentModal({ isOpen, onClose, orderData, onComplete }) {
  const { createTicket, updateTicket } = useTickets();
  const { addMovement, isCashOpen } = useCash();
  const { updateOrder } = useOrder();
  const { settings } = useSettings();

  // Obtener métodos de pago desde configuración
  const paymentTypes = useMemo(() => {
    const methods = settings?.payment?.methods || {};
    const colorMap = {
      cash: 'bg-green-100 hover:bg-green-200',
      card: 'bg-blue-100 hover:bg-blue-200',
      transfer: 'bg-purple-100 hover:bg-purple-200',
      pse: 'bg-orange-100 hover:bg-orange-200',
      check: 'bg-yellow-100 hover:bg-yellow-200',
      credit: 'bg-pink-100 hover:bg-pink-200',
    };

    return Object.entries(methods)
      .filter(([_, method]) => method?.enabled)
      .map(([key, method]) => ({
        key,
        label: method?.name || key,
        icon: iconMap[key] || Banknote,
        bg: colorMap[key],
      }));
  }, [settings?.payment?.methods]);
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
  const [transferType, setTransferType] = useState(null);
  const [cardType, setCardType] = useState(null);
  const items = orderData?.items || [];

  // Reinicializar amounts cuando la orden cambia
  useEffect(() => {
    if (isOpen) {
      setAmounts(prev => {
        // Solo reinicializar si el cash no tiene el total correcto
        if (!prev['cash'] || parseFloat(prev['cash']) === 0) {
          return { cash: total };
        }
        return prev;
      });
    }
  }, [isOpen]);

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

  // Calcular total ingresado (con conversión segura)
  const totalEntered = selectedTypes.reduce((sum, key) => {
    const amount = parseFloat(amounts[key]) || 0;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Validar que hay suficiente dinero (con tolerancia de 0.01)
  const hasEnoughPayment = totalEntered >= (total - 0.01);

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

  // Obtener submétodos disponibles para transferencia (dinámicamente desde configuración)
  const transferSubmethods = useMemo(() => {
    const transferMethod = settings?.payment?.methods?.transfer;
    if (!transferMethod?.submethods) return [];
    return transferMethod.submethods
      .filter(sm => sm?.enabled !== false)
      .map(sm => ({
        id: sm.id,
        label: sm.name,
        value: sm.id
      }));
  }, [settings?.payment?.methods?.transfer?.submethods]);

  // Obtener submétodos disponibles para tarjeta (dinámicamente desde configuración)
  const cardSubmethods = useMemo(() => {
    const cardMethod = settings?.payment?.methods?.card;
    if (!cardMethod?.submethods) return [];
    return cardMethod.submethods
      .filter(sm => sm?.enabled !== false)
      .map(sm => ({
        id: sm.id,
        label: sm.name,
        value: sm.id
      }));
  }, [settings?.payment?.methods?.card?.submethods]);

  const validateTransferType = () => {
    // Si transferencia está seleccionada, validar que hay submétodos disponibles
    if (selectedTypes.includes('transfer')) {
      if (transferSubmethods.length === 0) {
        alert('⚠️ No hay tipos de transferencia disponibles configurados');
        return false;
      }
      if (!transferType) {
        alert('⚠️ Debes seleccionar el tipo de transferencia');
        return false;
      }
    }
    return true;
  };

  const validateCardType = () => {
    // Si tarjeta está seleccionada, validar que hay submétodos disponibles
    if (selectedTypes.includes('card')) {
      if (cardSubmethods.length === 0) {
        alert('⚠️ No hay tipos de tarjeta disponibles configurados');
        return false;
      }
      if (!cardType) {
        alert('⚠️ Debes seleccionar el tipo de tarjeta');
        return false;
      }
    }
    return true;
  };
  const totalPaid = selectedTypes.reduce((sum, key) => sum + (parseFloat(amounts[key]) || 0), 0);

  const handleCompletePayment = async () => {
    if (totalPaid < total) {
      alert(`⚠️ Falta pagar: ${(total - totalPaid).toLocaleString()}`);
      return;
    }

    // Validar transferencia y tarjeta
    if (!validateTransferType()) {
      return;
    }
    if (!validateCardType()) {
      return;
    }
    
    console.log('🛒 [PAGO] Iniciando processamiento de pago...');
    console.log('  Orden ID:', orderData.id);
    console.log('  Tipo:', orderData.type);
    console.log('  Total:', total);
    
    // Construir paymentMethods desde selectedTypes y amounts
    const finalPaymentMethods = selectedTypes.map(key => {
      const amount = parseFloat(amounts[key]) || 0;
      const method = {
        type: key === 'transfer' ? 'transfer' : key,
        amount: amount,
        change: key === 'cash' ? amount - total : 0
      };
      
      // Agregar subtipo de transferencia si aplica
      if (key === 'transfer' && transferType) {
        method.transferType = transferType; // 'nequi' o 'bancolombia'
      }
      
      // Agregar subtipo de tarjeta si aplica
      if (key === 'card' && cardType) {
        method.cardType = cardType; // 'visa', 'mastercard', 'amex', etc
      }
      
      return method;
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

    // Calcular montos pagados por tipo ANTES de crear ticket
    const pago_efectivo = finalPaymentMethods
      .filter(m => m.type === 'cash')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const pago_digital = finalPaymentMethods
      .filter(m => m.type === 'card' || m.type === 'transfer')
      .reduce((sum, m) => sum + m.amount, 0);
    
    // Agregar datos de pago al order ANTES de crear ticket
    // Obtener el tipo de transferencia si existe
    const transferMethod = finalPaymentMethods.find(m => m.type === 'transfer');
    const cardMethod = finalPaymentMethods.find(m => m.type === 'card');
    const orderWithPayment = {
      ...order,
      pago_efectivo,
      pago_digital,
      paymentType: finalPaymentMethods.length === 1 ? finalPaymentMethods[0].type : 'mixed',
      transferType: transferMethod?.transferType || null, // Pasar el transferType explícitamente
      cardType: cardMethod?.cardType || null, // Pasar el cardType explícitamente
    };
    
    // Registrar en caja
    if (isCashOpen) {
      finalPaymentMethods.forEach(method => {
        // Preparar descripción y metadata
        let description = `Venta ${method.type} - Ticket #${Date.now().toString().slice(-6)}`;
        const metadata = {
          paymentType: method.type // IMPORTANTE: Guardar el tipo de pago
        };
        
        // Si es transferencia, agregar el subtipo a la descripción y metadata
        if (method.type === 'transfer' && method.transferType) {
          const transferTypeLabel = method.transferType === 'nequi' ? 'Nequi' : 'Bancolombia';
          description = `Venta Transferencia ${transferTypeLabel} - Ticket #${Date.now().toString().slice(-6)}`;
          metadata.transferType = method.transferType;
          metadata.transferTypeLabel = transferTypeLabel;
        }
        
        // Si es tarjeta, agregar el subtipo a la descripción y metadata
        if (method.type === 'card' && method.cardType) {
          const cardTypeData = cardSubmethods.find(c => c.id === method.cardType);
          const cardTypeLabel = cardTypeData?.label || method.cardType;
          description = `Venta Tarjeta ${cardTypeLabel} - Ticket #${Date.now().toString().slice(-6)}`;
          metadata.cardType = method.cardType;
          metadata.cardTypeLabel = cardTypeLabel;
        }
        
        addMovement('sale', method.amount, description, metadata);
      });
    }

    // Guardar ticket en local CON datos de pago incluidos desde el inicio
    console.log('💾 [TICKET] Creando ticket con datos de pago:', {
      pago_efectivo,
      pago_digital,
      type: orderData.type,
    });
    const newTicket = createTicket(orderWithPayment);
    
    // Actualizar orden en Firebase para persistir el estado
    // ✅ IMPORTANTE: Esperar a que updateOrder se complete antes de continuar
    if (orderData.id) {
      const paymentType = finalPaymentMethods.length === 1 ? finalPaymentMethods[0].type : 'mixed';
      
      console.log('💾 [ORDEN] Actualizando orden con status:', orderStatus);
      console.log('   ID de orden:', orderData.id);
      console.log('   Tipo de orden:', orderData.type);
      
      try {
        // ✅ ESPERAR a que se actualice en Firestore - Crítico para persistencia
        // Construir objeto de actualización SIN campos undefined
        const updateData = {
          status: orderStatus,
          paymentMethods: finalPaymentMethods,
          paymentType: paymentType,
          transferType: transferMethod?.transferType || null,
          cardType: cardMethod?.cardType || null,
          pago_efectivo,
          pago_digital,
        };
        
        // Solo agregar deliveryData si es una orden de delivery y existe
        if (orderData.type === 'delivery' && deliveryData) {
          updateData.deliveryData = deliveryData;
        }
        
        console.log('💾 [FIRESTORE] Datos a actualizar:', updateData);
        
        await updateOrder(orderData.id, updateData);
        console.log('✅ [ÉXITO] Orden actualizada en Firestore con status:', orderStatus);
      } catch (error) {
        console.error('❌ [CRÍTICO] Error al actualizar orden en Firestore:', error);
        console.error('   El pago se procesó pero la orden NO se guardó correctamente');
        console.error('   Detalles:', error.message);
        
        // Mostrar error crítico al usuario
        alert(`⚠️ ERROR CRÍTICO:\n\nEl pago se realizó pero hay un problema guardando la orden en la base de datos.\n\nDetalles: ${error.message}\n\nContacte al administrador.`);
        
        // No continuar con el flujo de éxito
        console.log('⏸️ Deteniendo flujo de pago - El usuario debe reintentar');
        return;
      }
    } else {
      console.warn('⚠️ La orden no tiene ID - No se puede actualizar en Firestore');
      alert('⚠️ ADVERTENCIA: La orden no tiene ID para guardar. Contacte al administrador.');
      return;
    }
    
    console.log('✅ Ticket + Orden actualizados correctamente:', {
      ticketId: newTicket?.id,
      pago_efectivo,
      pago_digital,
      type: orderData.type,
      newStatus: orderStatus,
    });
    
    console.log('🎉 [PAGO EXITOSO COMPLETO] Orden con ID:', orderData.id, 'Status:', orderStatus);
    
    setSuccess(true);
    
    // ✅ Disparar AUTOMÁTICAMENTE el ticket de venta para imprimir
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('orderSaved', { 
        detail: {
          ...order,
          ticketType: 'customer' // Tipo de ticket: recibo de cliente
        }
      }));
      
      setSuccess(false);
      onClose();
      onComplete && onComplete(finalPaymentMethods);
    }, 1000);
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
        {/* Tipos de pago (selección múltiple hasta 2) - COMPACTO */}
        <div className={`grid gap-2 mb-4 ${paymentTypes.length <= 2 ? 'grid-cols-2' : paymentTypes.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {paymentTypes.map(({ key, label, icon: Icon, bg }) => (
            <button
              key={key}
              type="button"
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg font-semibold transition-all border-2 text-xs ${bg} ${selectedTypes.includes(key) ? 'border-primary-600 ring-1 ring-primary-400' : 'border-transparent'}`}
              onClick={() => {
                handleTypeToggle(key);
                // Reset tipos si deseleccionamos
                if (key === 'transfer' && selectedTypes.includes(key)) {
                  setTransferType(null);
                }
                if (key === 'card' && selectedTypes.includes(key)) {
                  setCardType(null);
                }
              }}
              disabled={selectedTypes.length === 2 && !selectedTypes.includes(key)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Selector de tipo de transferencia (si está seleccionada) */}
        {selectedTypes.includes('transfer') && transferSubmethods.length > 0 && (
          <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg border border-purple-200 dark:border-purple-700">
            <label className="text-xs font-semibold mb-2 text-gray-900 dark:text-white block">Transferencia:</label>
            <div className="flex flex-wrap gap-1">
              {transferSubmethods.map(submethod => (
                <button
                  key={submethod.id}
                  onClick={() => setTransferType(submethod.id)}
                  className={`py-1 px-2 rounded text-xs font-medium transition-all border-2 ${
                    transferType === submethod.id
                      ? 'bg-purple-600 text-white border-purple-700'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800'
                  }`}
                >
                  {submethod.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de tipo de tarjeta (si está seleccionada) */}
        {selectedTypes.includes('card') && cardSubmethods.length > 0 && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg border border-blue-200 dark:border-blue-700">
            <label className="text-xs font-semibold mb-2 text-gray-900 dark:text-white block">Tipo de Tarjeta:</label>
            <div className="flex flex-wrap gap-1">
              {cardSubmethods.map(submethod => (
                <button
                  key={submethod.id}
                  onClick={() => setCardType(submethod.id)}
                  className={`py-1 px-2 rounded text-xs font-medium transition-all border-2 ${
                    cardType === submethod.id
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800'
                  }`}
                >
                  {submethod.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inputs para los métodos seleccionados */}
        {selectedTypes.map(key => {
          const type = paymentTypes.find(t => t.key === key);
          const label = type?.label || key.charAt(0).toUpperCase() + key.slice(1);
          
          return (
            <div className="mb-4" key={key}>
              <label className="block text-sm font-semibold mb-1">{label} - Monto</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 mb-1"
                placeholder={`Monto en ${label}`}
                value={amounts[key] || ''}
                onChange={e => handleAmountChange(key, e.target.value)}
                onFocus={(e) => {
                  // Seleccionar todo el texto para que el usuario pueda escribir sin borrar manualmente
                  e.target.select();
                }}
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
          disabled={
            paymentTypes.length === 0 || 
            selectedTypes.length === 0 || 
            selectedTypes.some(key => !amounts[key] || parseFloat(amounts[key]) <= 0) || 
            !hasEnoughPayment || 
            (selectedTypes.includes('transfer') && transferSubmethods.length > 0 && !transferType) ||
            (selectedTypes.includes('card') && cardSubmethods.length > 0 && !cardType)
          }
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
