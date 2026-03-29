import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, CreditCard, Trash2, User, MapPin, Utensils, Truck } from 'lucide-react';

const OrderCard = ({ order, onEdit, onPay, onDelete, onUpdateStatus, onPrintKitchen }) => {
  if (!order) return null;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Siempre colapsado por defecto (ambos: mobile y desktop)
  
  // Estados para domicilio
  const [deliveryStartTime, setDeliveryStartTime] = useState(null);
  const [deliveryElapsedTime, setDeliveryElapsedTime] = useState(0);
  const [deliveryAlarmTriggered, setDeliveryAlarmTriggered] = useState(false);
  const [showDeliveryWarningModal, setShowDeliveryWarningModal] = useState(false);

  // Refs para rastrear alarmas
  const lastDeliveryAlarmMinuteRef = useRef(-1);

  // Timer para contar tiempo de preparación
  useEffect(() => {
    if (order.status !== 'preparing') return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTime = new Date(order.timestamp);
      const minutes = Math.floor((now - startTime) / 60000);
      
      setElapsedTime(minutes);

      // Mostrar modal de advertencia a los 20 minutos
      if (minutes >= 20 && !alarmTriggered) {
        playAlarm();
        setAlarmTriggered(true);
        setShowWarningModal(true);
      }
      // Alarma cada 5 minutos después de los 20
      else if (minutes >= 20 && minutes % 5 === 0 && Math.floor(minutes) === minutes) {
        playAlarm();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, order.timestamp, alarmTriggered]);

  // Timer para contar tiempo de espera de domicilio
  useEffect(() => {
    if (order.status !== 'waiting') return;

    // Si no tenemos deliveryStartTime, usa el timestamp de cuando pasó a waiting (o el timestamp actual)
    if (!deliveryStartTime) {
      setDeliveryStartTime(new Date());
      lastDeliveryAlarmMinuteRef.current = -1;
      return; // Recursión del useEffect con el nuevo deliveryStartTime
    }

    const interval = setInterval(() => {
      const now = new Date();
      const minutes = Math.floor((now - deliveryStartTime) / 60000);
      
      setDeliveryElapsedTime(minutes);

      // Alarma de domicilio retrasado a los 20 minutos, entonces cada 5 minutos
      if (minutes >= 20 && minutes % 5 === 0 && lastDeliveryAlarmMinuteRef.current !== minutes) {
        playAlarm();
        setShowDeliveryWarningModal(true);
        lastDeliveryAlarmMinuteRef.current = minutes;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, deliveryStartTime]);

  // Reproducir alarma de sonido
  const playAlarm = () => {
    // Crear un sonido "puf" con Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✓ Mensaje copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar al portapapeles');
    });
  };

  const handleDelivery = () => {
    // Inicia el seguimiento de domicilio - solo si está en estado ready
    if (order.status !== 'ready') return;
    
    const message = `me mandas un domiciliario por favor, va para ${order.deliveryData?.address || 'la dirección'}`;
    copyToClipboard(message);
    // Cambiar estado a "waiting" (esperando domiciliario)
    onUpdateStatus(order.id, 'waiting');
    setDeliveryStartTime(new Date());
    lastDeliveryAlarmMinuteRef.current = -1; // Reset ref para nueva alarma
  };

  const handleDeliveryCompleted = () => {
    // Mensaje final cuando se entrega
    const finalMessage = `Hola ${order.deliveryData?.name || 'cliente'} tu pedido ya va en camino, que tengas muy buen provecho, te agradecemos por preferirnos, te esperamos pronto.

📲 Síguenos en nuestras redes sociales y entérate de promociones, nuevos productos y contenido brutal 🔥🍔

TikTok:
https://www.tiktok.com/@roalburger?_r=1&_t=ZS-94kgEkN4aEH

Instagram:
https://www.instagram.com/roalburgerarmenia?igsh=cWE2eGRyNnlxaXgy&utm_source=qr

Facebook:
https://www.facebook.com/share/1B9MGGXh6h/?mibextid=wwXIfr

ROAL Burger
Comida rápida con acento venezolano 🇻🇪🔥`;
    
    copyToClipboard(finalMessage);
    onUpdateStatus(order.id, 'completed');
    setShowDeliveryWarningModal(false);
  };

  const handleStatusChange = () => {
    if (order.type === 'takeout') {
      // Flujo especial para Para Llevar
      if (order.status === 'pending') {
        onUpdateStatus(order.id, 'preparing');
      } else if (order.status === 'preparing') {
        onUpdateStatus(order.id, 'ready');
        // Copiar mensaje al portapapeles
        copyToClipboard('Hola tu pedido ya se encuentra listo para retirar, te esperamos');
      }
      // Para Llevar NO tiene tercer toque, solo se cierra al cobrar/cancelar
    } else {
      // Flujo para Mesa y Domicilio
      if (order.status === 'pending') {
        onUpdateStatus(order.id, 'preparing');
      } else if (order.status === 'preparing') {
        onUpdateStatus(order.id, 'ready');
      }
    }
  };

  const getName = () => {
    if (order.type === 'table') {
      return 'Mesa ' + (order.tableNumber || '?');
    } else if (order.type === 'delivery') {
      return order.deliveryData?.name || 'Domicilio';
    } else {
      return 'Pedido #' + String(order.id).slice(-4);
    }
  };

  // Calcular lo que el domiciliario debe pagar/recibir
  const calculateDeliveryPayment = () => {
    if (order.type !== 'delivery') return null;

    const deliveryCost = order.deliveryCost || 0;
    const paymentMethods = order.paymentMethods || [];
    
    // Calcular cuánto se pagó en efectivo
    const cashPaid = paymentMethods
      .filter(m => m.type === 'cash' || m.type === 'efectivo')
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    // El domiciliario necesita recibir exactamente el costo del domicilio
    const deliveryBalance = deliveryCost - cashPaid;

    if (deliveryBalance > 0) {
      return {
        type: 'pagar',
        amount: deliveryBalance,
        message: `Pagar a domicilio: ${formatCurrency(deliveryBalance)}`
      };
    } else if (deliveryBalance < 0) {
      return {
        type: 'cobrar',
        amount: Math.abs(deliveryBalance),
        message: `Cobrar a domicilio: ${formatCurrency(Math.abs(deliveryBalance))}`
      };
    } else {
      return {
        type: 'nada',
        amount: 0,
        message: 'No cobrar nada'
      };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500 p-4 shadow-md hover:shadow-lg transition-shadow" onClick={() => setIsExpanded(!isExpanded)}>
      {/* HEADER COMPACTO - Siempre visible */}
      <div className="flex justify-between items-start gap-2 cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800 dark:text-white truncate">{getName()}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange();
              }}
              className={`text-xs px-2 py-1 rounded font-bold cursor-pointer transition-all shadow-md flex items-center justify-center gap-1 flex-shrink-0 ${
                order.status === 'pending' ? 'bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100' :
                order.status === 'preparing' ? 'bg-orange-400 dark:bg-orange-600 text-orange-900 dark:text-orange-100 animate-pulse' :
                order.status === 'ready' ? 'bg-green-400 dark:bg-green-600 text-green-900 dark:text-green-100' :
                order.status === 'waiting' ? 'bg-purple-400 dark:bg-purple-600 text-purple-900 dark:text-purple-100 animate-pulse' :
                'bg-gray-400 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
              }`}>
              {order.status === 'pending' ? '▶' : 
               order.status === 'preparing' ? `⏱️ ${elapsedTime}m` : 
               order.status === 'waiting' ? `⏰ ${deliveryElapsedTime}m` :
               order.status === 'ready' ? '✅' : 
               '💰'}
              {(alarmTriggered || deliveryAlarmTriggered) && ' 🔔'}
            </button>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(order.total || 0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{(order.items?.length || 0)} items</p>
        </div>
      </div>

      {/* DETALLES EXPANDIBLES */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3" onClick={(e) => e.stopPropagation()}>
          
          {/* Items List */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📦 Productos:</p>
            <div className="space-y-1 max-h-[150px] overflow-y-auto">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, i) => (
                  <div key={i} className="text-xs text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-blue-300">
                    <div className="flex justify-between">
                      <span>• {item.quantity}x {item.name}</span>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div className="pl-2 text-xs text-gray-500">
                        {item.addons.map((addon, j) => (
                          <div key={j}>+ {addon.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">Sin items</p>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          {order.type === 'delivery' && order.deliveryData && (
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded text-xs">
              <p><strong>Dirección:</strong> {order.deliveryData.address}</p>
              <p><strong>🚚 Costo:</strong> {formatCurrency(order.deliveryCost || 0)}</p>
              {calculateDeliveryPayment() && (
                <p className={`font-bold mt-1 ${
                  calculateDeliveryPayment().type === 'pagar' 
                    ? 'text-red-700 dark:text-red-400' 
                    : calculateDeliveryPayment().type === 'cobrar'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-green-700 dark:text-green-400'
                }`}>
                  {calculateDeliveryPayment().message}
                </p>
              )}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrintKitchen && onPrintKitchen(order);
                }}
                className="flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold cursor-pointer bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-md"
                title="Imprimir para Cocina"
              >
                🍳 Cocina
              </button>
              {order.type === 'delivery' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (order.status === 'ready') {
                      handleDelivery();
                    } else if (order.status === 'waiting') {
                      handleDeliveryCompleted();
                    }
                  }}
                  className={`flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold transition-all shadow-md ${
                    order.status === 'ready'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white cursor-pointer'
                      : order.status === 'waiting'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer animate-pulse'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🚚 Domi
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(order);
                }}
                className="flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold cursor-pointer bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md"
              >
                ✏️ Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPay && onPay(order);
                }}
                className="flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold cursor-pointer bg-green-500 hover:bg-green-600 text-white transition-all shadow-md"
              >
                💳 Cobrar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(order);
                }}
                className="min-w-[40px] text-xs px-1.5 py-1.5 rounded font-bold cursor-pointer bg-red-500 hover:bg-red-600 text-white transition-all shadow-md"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Advertencia - Domicilio Retrasado */}
      {showDeliveryWarningModal && order.status === 'waiting' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-11/12 shadow-2xl border-4 border-red-500">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">⏰</div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">¡DOMICILIO RETRASADO!</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                {getName()}
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 p-4 mb-6 rounded">
              <p className="text-gray-800 dark:text-gray-200 font-semibold text-center">
                🚚 El domiciliario lleva {deliveryElapsedTime} minutos
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm mt-2">
                Verifica el estado del pedido
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeliveryWarningModal(false);
                  setDeliveryAlarmTriggered(false);
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ⏳ Esperar 5 min más
              </button>
              <button
                onClick={handleDeliveryCompleted}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ✅ Entregado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;