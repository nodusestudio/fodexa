import React, { useState, useEffect, useRef, useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, CreditCard, Trash2, User, MapPin, Utensils, Truck } from 'lucide-react';
import DeliveryTimer from './DeliveryTimer';

const OrderCard = ({ order, onEdit, onPay, onDelete, onUpdateStatus, onPrintKitchen }) => {
  const { settings } = useContext(SettingsContext);
  
  // Valores por defecto para botones de órdenes
  const defaultOrderButtons = {
    alarmTime: 20,
    alarmSound: true,
    buttonTexts: { cook: '▶ Cocinar', cooking: '🍳 Cocinando', served: '✅ Mesa servida' },
    colors: { pending: '#FBBF24', preparing: '#F97316', ready: '#22C55E' },
    showTimer: true,
    enableAutoAlarm: true
  };

  // Valores por defecto para botón de cocina
  const defaultKitchenButton = {
    buttonText: '🔔 Cocina',
    buttonColor: '#f97316',
    ticketTitle: '🍳 COCINA',
    showTableInfo: true,
    showPhone: true,
    showNotes: true,
    showAddons: true,
    paperWidth: 80,
    headerText: '',
    footerText: '',
    showTimestamp: true,
    separatorCharacter: '-'
  };

  // Valores por defecto para pago
  const defaultPayment = {
    buttonText: '💳 Cobrar',
    buttonColor: '#22c55e',
    methods: {
      cash: { name: '💵 Efectivo', enabled: true, icon: '💵', submethods: [] },
      card: { 
        name: '💳 Tarjeta', 
        enabled: true, 
        icon: '💳',
        submethods: [
          { id: 'visa', name: '💳 Visa', enabled: true },
          { id: 'mastercard', name: '💳 Mastercard', enabled: true },
          { id: 'amex', name: '💳 American Express', enabled: false },
          { id: 'other_card', name: '💳 Otra Tarjeta', enabled: true }
        ]
      },
      transfer: { 
        name: '🏦 Transferencia', 
        enabled: true, 
        icon: '🏦',
        submethods: [
          { id: 'bancolombia', name: '🏦 Bancolombia', enabled: true },
          { id: 'nequi', name: '📱 Nequi', enabled: true },
          { id: 'daviplata', name: '📱 Daviplata', enabled: false },
          { id: 'other_transfer', name: '🏦 Otra Transferencia', enabled: true }
        ]
      },
      pse: { name: '🔗 PSE', enabled: false, icon: '🔗', submethods: [] },
      check: { name: '📋 Cheque', enabled: false, icon: '📋', submethods: [] },
      credit: { name: '📝 Crédito', enabled: false, icon: '📝', submethods: [] }
    },
    splitPayment: {
      enabled: true,
      maxMethods: 2,
      allowPartial: true
    },
    requireNote: false,
    showBalance: true,
    autoClose: false
  };
  
  // Obtener valores actuales o usar defaults para órdenes
  const orderButtons = settings?.orderButtons || defaultOrderButtons;
  
  const alarmTime = orderButtons?.alarmTime ?? defaultOrderButtons.alarmTime;
  const alarmSound = orderButtons?.alarmSound ?? defaultOrderButtons.alarmSound;
  const showTimer = orderButtons?.showTimer ?? defaultOrderButtons.showTimer;
  const enableAutoAlarm = orderButtons?.enableAutoAlarm ?? defaultOrderButtons.enableAutoAlarm;
  const colors = { 
    ...defaultOrderButtons.colors, 
    ...orderButtons?.colors 
  };
  const buttonTexts = { 
    ...defaultOrderButtons.buttonTexts, 
    ...orderButtons?.buttonTexts 
  };

  // Obtener valores para botón de cocina
  const kitchenButton = {
    ...defaultKitchenButton,
    ...settings?.kitchenButton
  };
  const kitchenButtonText = kitchenButton?.buttonText ?? defaultKitchenButton.buttonText;
  const kitchenButtonColor = kitchenButton?.buttonColor ?? defaultKitchenButton.buttonColor;

  // Obtener valores para pago
  const payment = {
    ...defaultPayment,
    ...settings?.payment,
    methods: {
      ...defaultPayment.methods,
      ...(settings?.payment?.methods || {})
    },
    splitPayment: {
      ...defaultPayment.splitPayment,
      ...(settings?.payment?.splitPayment || {})
    }
  };
  const paymentButtonText = payment?.buttonText ?? defaultPayment.buttonText;
  const paymentButtonColor = payment?.buttonColor ?? defaultPayment.buttonColor;

  if (!order) return null;
  
  // ============================================================
  // 🔴 SEGUNDA BARRERA DE DEFENSA: Nunca renderizar órdenes inválidas
  // ============================================================
  
  // ✅ Protección 1: RECHAZAR órdenes sin status válido
  const validStatuses = ['pending', 'waiting', 'preparing'];
  if (!order.status || !validStatuses.includes(order.status)) {
    console.log(`🚫 [OrderCard] NO RENDERIZAR: ${order.id} (status inválido: "${order.status}")`);
    return null;
  }
  
  // ✅ Protección 2: RECHAZAR CUALQUIER orden pagada
  if (order.status === 'completed') {
    console.log(`🚫 [OrderCard] NO RENDERIZAR: ${order.id} (COMPLETADA - PAGADA)`);
    return null;
  }
  
  // ✅ Protección 3: RECHAZAR órdenes sin type
  if (!order.type) {
    console.log(`🚫 [OrderCard] NO RENDERIZAR: ${order.id} (sin type definido)`);
    return null;
  }

  const [elapsedTime, setElapsedTime] = useState(0);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Siempre colapsado por defecto (ambos: mobile y desktop)
  const [displayMinutes, setDisplayMinutes] = useState(0); // 🔴 Minutos para display
  const [displaySeconds, setDisplaySeconds] = useState(0); // 🔴 Segundos para display
  const [deliveryCountdownMinutes, setDeliveryCountdownMinutes] = useState(0); // Timer para delivery recién creado
  const [deliveryCountdownSeconds, setDeliveryCountdownSeconds] = useState(0); // Timer para delivery recién creado
  const [deliveryTimerStarted, setDeliveryTimerStarted] = useState(false);
  const [showDeliveryAlertModal, setShowDeliveryAlertModal] = useState(false); // Modal cuando llega a 10 min
  const [showDeliveryTimerModal, setShowDeliveryTimerModal] = useState(false); // Control para cerrar DeliveryTimer flotante
  
  // 🔴 Obtener configuración del timer de delivery
  const firstAlarmMinutes = settings?.deliveryTimer?.firstAlarmMinutes ?? 10;
  const secondAlarmMinutes = settings?.deliveryTimer?.secondAlarmMinutes ?? 5;
  const [deliveryTimerThreshold, setDeliveryTimerThreshold] = useState(firstAlarmMinutes); // Umbral configurable
  
  // 🔴 Obtener tiempos de Firestore
  const preparingStartTime = order.preparingStartTime ? new Date(order.preparingStartTime) : null;
  const servedStartTime = order.servedStartTime ? new Date(order.servedStartTime) : null;
  const deliveryTimerStartTime = order.deliveryTimerStartTime ? new Date(order.deliveryTimerStartTime) : null;
  
  // 🔴 Determinar qué contador mostrar
  const isServedPhase = !!servedStartTime;
  
  // Estados para domicilio
  const [deliveryStartTime, setDeliveryStartTime] = useState(null);
  const [deliveryElapsedTime, setDeliveryElapsedTime] = useState(0);
  const [deliveryAlarmTriggered, setDeliveryAlarmTriggered] = useState(false);
  const [showDeliveryWarningModal, setShowDeliveryWarningModal] = useState(false);

  // Refs para rastrear alarmas y prevenir doble click
  const lastDeliveryAlarmMinuteRef = useRef(-1);
  const isProcessingStatusChangeRef = useRef(false); // 🔴 Prevenir doble click en botón de status
  const alarmTriggeredRef = useRef(false); // 🔴 Rastrear si ya se disparó alarma a los 20min

  // Timer para contar tiempo de preparación o servido en mesa
  useEffect(() => {
    if (order.status !== 'preparing') return;

    // 🔴 RESET: Resetear alarma cuando ENTRA a preparing
    alarmTriggeredRef.current = false;
    setAlarmTriggered(false);

    const interval = setInterval(() => {
      // Usar servedStartTime si existe, si no usar preparingStartTime
      const currentStartTime = isServedPhase ? servedStartTime : preparingStartTime;
      if (!currentStartTime) return;

      const now = new Date();
      const totalSeconds = Math.floor((now - currentStartTime) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      setDisplayMinutes(minutes);
      setDisplaySeconds(seconds);
      setElapsedTime(minutes);

      // 🔴 SOLO en fase de PREPARACIÓN: Mostrar alerta según el tiempo configurado
      if (!isServedPhase && minutes >= alarmTime && !alarmTriggeredRef.current) {
        playAlarm();
        alarmTriggeredRef.current = true;
        setAlarmTriggered(true);
        // Solo mostrar modal automático si enableAutoAlarm está activado
        if (enableAutoAlarm) {
          setShowWarningModal(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, preparingStartTime, servedStartTime, isServedPhase]);

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

      // Alarma de domicilio retrasado según el tiempo configurado, entonces cada 5 minutos
      if (minutes >= alarmTime && minutes % 5 === 0 && lastDeliveryAlarmMinuteRef.current !== minutes) {
        playAlarm();
        setShowDeliveryWarningModal(true);
        lastDeliveryAlarmMinuteRef.current = minutes;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, deliveryStartTime]);

  // 🚚 Reinicializar threshold cuando cambia la orden
  useEffect(() => {
    if (order.type === 'delivery' && (order.status === 'pending' || order.status === 'waiting')) {
      // Solo resetear si es una nueva orden o si ya no tiene deliveryTimerStartTime
      if (!order.deliveryTimerStartTime) {
        setDeliveryTimerThreshold(firstAlarmMinutes); // Usar configuración para nueva orden
      }
    }
  }, [order.id, order.deliveryTimerStartTime, firstAlarmMinutes]);

  // 🚚 Efecto para cerrar el modal cuando el status cambia a 'waiting'
  useEffect(() => {
    if (order.status === 'waiting') {
      console.log(`🚚 [OrderCard] Status es 'waiting', cerrando modal flotante`);
      setShowDeliveryTimerModal(false);
    }
  }, [order.status]);

  // 🚚 Timer para órdenes de delivery - SIEMPRE mostrar contador
  useEffect(() => {
    // Timer se ejecuta para delivery en pending O waiting
    if (order.type !== 'delivery' || (order.status !== 'pending' && order.status !== 'waiting')) {
      setDeliveryTimerStarted(false);
      return;
    }

    console.log(`🚚 [OrderCard] Delivery timer effect - order: ${order.id}, status: ${order.status}, startTime: ${deliveryTimerStartTime}`);

    // Si no tiene deliveryTimerStartTime, crearlo (fallback)
    if (!deliveryTimerStartTime) {
      console.warn(`🚚 [OrderCard] Sin deliveryTimerStartTime, guardando uno nuevo...`);
      const startTime = new Date().getTime();
      onUpdateStatus(order.id, { deliveryTimerStartTime: startTime });
      return; // Esperar a que se actualice la orden
    }

    setDeliveryTimerStarted(true);

    const interval = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now - deliveryTimerStartTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;

      setDeliveryCountdownMinutes(minutes);
      setDeliveryCountdownSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.type, order.status, deliveryTimerStartTime]);

  // 🚚 Effect SEPARADO para mostrar el modal (solo si pending)
  useEffect(() => {
    // Solo abrir modal si status es pending Y minutos >= umbral Y modal no está abierto
    if (order.type !== 'delivery') {
      console.log(`🚚 [Modal Effect] No es delivery`);
      return;
    }
    
    if (order.status !== 'pending') {
      console.log(`🚚 [Modal Effect] Status no es pending: ${order.status}`);
      return;
    }
    
    if (showDeliveryTimerModal) {
      console.log(`🚚 [Modal Effect] Modal ya está abierto`);
      return;
    }

    console.log(`🚚 [Modal Effect] Chequeando: minutos=${deliveryCountdownMinutes}, umbral=${deliveryTimerThreshold}`);

    // Verificar si ya llegó al umbral
    if (deliveryCountdownMinutes >= deliveryTimerThreshold) {
      console.log(`⏰ [OrderCard] ¡ALERTA! Delivery lleva ${deliveryCountdownMinutes} minutos, umbral ${deliveryTimerThreshold}`);
      playAlarm();
      setShowDeliveryTimerModal(true);
    }
  }, [order.type, order.status, deliveryCountdownMinutes, deliveryTimerThreshold, showDeliveryTimerModal]);

  // Reproducir alarma de sonido
  const playAlarm = () => {
    // Solo reproducir sonido si está habilitado
    if (!alarmSound) return;
    
    try {
      // Obtener tipo de sonido de settings
      const soundType = settings?.systemAlerts?.soundType || 'beep-double';
      const soundVolume = (settings?.systemAlerts?.soundVolume || 80) / 100;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Diferentes tipos de sonido
      const playSound = (startTime, frequency, duration, volume) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume * soundVolume, audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };
      
      // Reproducir según tipo de sonido
      switch(soundType) {
        case 'beep-triple':
          playSound(0, 800, 0.2, 0.8);
          playSound(0.25, 800, 0.2, 0.8);
          playSound(0.5, 800, 0.2, 0.8);
          break;
        case 'alarm':
          playSound(0, 1000, 0.3, 1.0);
          playSound(0.35, 1200, 0.3, 1.0);
          playSound(0.7, 1000, 0.3, 1.0);
          break;
        case 'siren':
          for (let i = 0; i < 3; i++) {
            playSound(i * 0.4, 600 + (i * 200), 0.3, 1.0);
          }
          break;
        default: // beep-double
          playSound(0, 800, 0.25, 0.9);
          playSound(0.3, 800, 0.25, 0.9);
          break;
      }
    } catch (error) {
      console.warn('Error reproduciendo alarma:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Usar una notificación silenciosa sin modal ni botón
      console.log('✓ Mensaje copiado al portapapeles');
    }).catch((err) => {
      console.error('Error al copiar:', err);
    });
  };

  const handleDelivery = () => {
    // Solicitar domiciliario - funciona tanto en estado pending como ready
    if (order.status !== 'ready' && order.status !== 'pending' && order.status !== 'waiting') {
      console.warn('⚠️ No puedes solicitar domicilio en estado:', order.status);
      return;
    }
    
    console.log('� [OrderCard] handleDelivery() EJECUTADO para orden:', order.id);
    const message = `me mandas un domiciliario por favor, va para ${order.deliveryData?.address || 'la dirección'}`;
    copyToClipboard(message);
    
    // Cambiar estado a "waiting" (esperando domiciliario)
    // Actualizar múltiples campos al mismo tiempo
    const updateData = {
      status: 'waiting',
      deliveryRequestedAt: new Date().getTime()
    };
    
    console.log('🚚 [OrderCard] Llamando onUpdateStatus con:', updateData);
    onUpdateStatus(order.id, updateData);
    setDeliveryStartTime(new Date());
    lastDeliveryAlarmMinuteRef.current = -1; // Reset ref para nueva alarma
    setShowDeliveryAlertModal(false); // Cerrar modal del timer si está abierto
    setShowDeliveryTimerModal(false); // Cerrar modal flotante
    console.log('✅ [OrderCard] handleDelivery() completado');
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

  // 🚚 Callback cuando se pulsa "Aún preparando" en el DeliveryTimer flotante
  const handleContinuePreparingDelivery = () => {
    // Resetear el timer guardando un nuevo deliveryTimerStartTime en la orden
    const newStartTime = new Date().getTime();
    onUpdateStatus(order.id, { deliveryTimerStartTime: newStartTime });
    setDeliveryCountdownMinutes(0);
    setDeliveryCountdownSeconds(0);
    setShowDeliveryAlertModal(false);
    setShowDeliveryTimerModal(false); // Cerrar modal al continuar preparando
    // Cambiar umbral al segundo valor configurado
    setDeliveryTimerThreshold(secondAlarmMinutes);
    console.log(`🟡 [OrderCard] Timer reseteado. Próximo umbral: ${secondAlarmMinutes} minutos`);
  };

  // 🚚 Callback cuando se pulsa "Solicitar Domi" en el DeliveryTimer flotante
  const handleRequestDeliveryFromTimer = () => {
    console.log('🚚 [OrderCard] handleRequestDeliveryFromTimer() ejecutado');
    setShowDeliveryAlertModal(false);
    setShowDeliveryTimerModal(false); // Cerrar modal inmediatamente
    handleDelivery();
  };

  const handleStatusChange = () => {
    // 🔴 PROTECCIÓN: Evitar doble click
    if (isProcessingStatusChangeRef.current) {
      console.log(`⚠️ [OrderCard] Doble click prevenido en orden ${order.id}`);
      return;
    }
    
    isProcessingStatusChangeRef.current = true;

    if (order.status === 'pending') {
      // 🔴 FASE 1: INICIA CONTADOR DE PREPARACIÓN
      const startTime = new Date().getTime();
      onUpdateStatus(order.id, { status: 'preparing', preparingStartTime: startTime });
      console.log(`🍳 [OrderCard] Iniciando contador de preparación para orden ${order.id}`);
    } else if (order.status === 'preparing' && !servedStartTime) {
      // 🟢 FASE 2: CAMBIAR A CONTADOR DE "SERVIDO EN MESA" (reinicia contador a 00:00)
      const startTime = new Date().getTime();
      onUpdateStatus(order.id, { servedStartTime: startTime });
      console.log(`🟢 [OrderCard] Iniciando contador de 'Servido en mesa' para orden ${order.id}`);
    }

    // Liberar el lock después de 500ms
    setTimeout(() => {
      isProcessingStatusChangeRef.current = false;
    }, 500);
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

  // 💳 Determinar si la orden ya fue pagada
  const isPaid = order.paymentMethods && order.paymentMethods.length > 0;

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
    <div className={`rounded-lg border-l-4 p-4 shadow-md hover:shadow-lg transition-all ${
      order.status === 'completed' 
        ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 opacity-75 text-gray-600 dark:text-gray-400' 
        : 'bg-white dark:bg-gray-800 border-blue-500'
    }`} onClick={() => setIsExpanded(!isExpanded)}>
      {/* HEADER COMPACTO - Siempre visible */}
      <div className="flex justify-between items-start gap-2 cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold truncate ${order.status === 'completed' ? 'text-gray-600 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>{getName()}</h4>
            <span className={`text-xs ${order.status === 'completed' ? 'text-gray-500 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Si es delivery pending/waiting y se toca el timer, solicitar domicilio
                if ((order.status === 'pending' || order.status === 'waiting') && order.type === 'delivery') {
                  handleDelivery();
                } else {
                  handleStatusChange();
                }
              }}
              style={{
                backgroundColor: (order.status === 'pending' || order.status === 'waiting') && order.type === 'delivery' ? '#FCD34D'
                  : order.status === 'pending' ? colors.pending
                  : order.status === 'preparing' ? colors.preparing
                  : order.status === 'waiting' ? '#c084fc'
                  : order.status === 'ready' ? colors.ready
                  : '#9ca3af',
                color: (order.status === 'pending' || order.status === 'waiting') && order.type === 'delivery' ? '#000'
                  : order.status === 'pending' || (order.status === 'preparing' && !isServedPhase) || order.status === 'waiting'
                  ? '#000' : '#fff'
              }}
              className={`text-xs px-2 py-1 rounded font-bold cursor-pointer transition-all shadow-md flex items-center justify-center gap-1 flex-shrink-0 ${
                ((order.status === 'pending' || order.status === 'waiting') && order.type === 'delivery') || (order.status === 'preparing' || order.status === 'ready') ? 'animate-pulse' : ''
              }`}>
              {(order.status === 'pending' || order.status === 'waiting') && order.type === 'delivery' ? (
                <span className="text-xs font-bold">EN PREPARACIÓN {deliveryCountdownMinutes.toString().padStart(2, '0')}:{deliveryCountdownSeconds.toString().padStart(2, '0')}</span>
              ) : order.status === 'pending' 
                ? buttonTexts.cook :  
               order.status === 'preparing' && !isServedPhase 
                 ? `${buttonTexts.cooking}${showTimer ? ` ${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}` : ''}` 
                 : order.status === 'preparing' && isServedPhase
                 ? `${buttonTexts.served}${showTimer ? ` ${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}` : ''}`
                 : order.status === 'waiting' ? `⏰ Esperando` :
                 order.status === 'ready' ? (buttonTexts.served?.split(' ')[0] || '✅') : 
                 '💰'}
              {(alarmTriggered || deliveryAlarmTriggered) && ' 🔔'}
            </button>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-lg font-bold ${order.status === 'completed' ? 'text-gray-500 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'}`}>{formatCurrency(order.total || 0)}</p>
          <p className={`text-xs ${order.status === 'completed' ? 'text-gray-400 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>{(order.items?.length || 0)} items</p>
        </div>
      </div>

      {/* DETALLES EXPANDIBLES */}
      {isExpanded && (
        <div className={`mt-4 pt-4 border-t space-y-3 ${order.status === 'completed' ? 'border-gray-400 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`} onClick={(e) => e.stopPropagation()}>
          
          {/* Items List */}
          <div>
            <p className={`text-sm font-semibold mb-2 ${order.status === 'completed' ? 'text-gray-600 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>📦 Productos:</p>
            <div className="space-y-1 max-h-[150px] overflow-y-auto">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, i) => (
                  <div key={i} className={`text-xs pl-2 border-l-2 ${order.status === 'completed' ? 'text-gray-500 dark:text-gray-600 border-gray-400 dark:border-gray-600' : 'text-gray-600 dark:text-gray-400 border-blue-300'}`}>
                    <div className="flex justify-between">
                      <span>• {item.quantity}x {item.name}</span>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div className="pl-2 text-xs opacity-75">
                        {item.addons.map((addon, j) => (
                          <div key={j}>+ {addon.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs opacity-50">Sin items</p>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          {order.type === 'delivery' && order.deliveryData && (
            <div className={`p-2 rounded text-xs ${order.status === 'completed' ? 'bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-600' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
              <p><strong>Dirección:</strong> {order.deliveryData.address}</p>
              <p><strong>🚚 Costo:</strong> {formatCurrency(order.deliveryCost || 0)}</p>
              {calculateDeliveryPayment() && (
                <p className={`font-bold mt-1 ${
                  order.status === 'completed'
                    ? 'opacity-50' 
                    : calculateDeliveryPayment().type === 'pagar' 
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
          <div className={`pt-3 border-t ${order.status === 'completed' ? 'border-gray-400 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrintKitchen && onPrintKitchen(order);
                }}
                disabled={order.status === 'completed'}
                className={`flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold cursor-pointer transition-all shadow-md ${
                  order.status === 'completed' 
                    ? 'text-gray-600 dark:text-gray-500 cursor-not-allowed opacity-50' 
                    : 'text-white hover:opacity-90'
                }`}
                style={{
                  backgroundColor: order.status === 'completed' 
                    ? '#9ca3af' 
                    : kitchenButtonColor,
                  opacity: order.status === 'completed' ? 0.5 : 1
                }}
                title="Imprimir para Cocina"
              >
                {kitchenButtonText}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPaid) {
                    alert('No se puede editar un pedido ya pagado. Para modificarlo, debes anularlo en la sección Tickets.');
                    return;
                  }
                  if (order.status === 'completed') {
                    alert('No se puede editar un pedido ya entregado');
                    return;
                  }
                  onEdit && onEdit(order);
                }}
                disabled={isPaid || order.status === 'completed'}
                className={`flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold transition-all shadow-md ${
                  isPaid || order.status === 'completed'
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                }`}
              >
                ✏️ Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPaid) {
                    alert('Este pedido ya ha sido pagado');
                    return;
                  }
                  if (order.status === 'completed') {
                    alert('Este pedido ya ha sido pagado');
                    return;
                  }
                  onPay && onPay(order);
                }}
                disabled={isPaid || order.status === 'completed'}
                className={`flex-1 min-w-[60px] text-xs px-2 py-1.5 rounded font-bold transition-all shadow-md ${
                  isPaid || order.status === 'completed'
                    ? 'text-gray-600 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-white cursor-pointer hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isPaid || order.status === 'completed' 
                    ? '#d1d5db' 
                    : paymentButtonColor,
                  opacity: isPaid || order.status === 'completed' ? 0.5 : 1
                }}
              >
                {paymentButtonText}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmMsg = order.status === 'completed'
                    ? '⚠️ Esta orden ya está entregada. ¿Deseas eliminarla?'
                    : '¿Estás seguro de que deseas eliminar esta orden?';
                  
                  if (window.confirm(confirmMsg)) {
                    onDelete && onDelete(order);
                  }
                }}
                className={`min-w-[40px] text-xs px-1.5 py-1.5 rounded font-bold transition-all shadow-md bg-red-500 hover:bg-red-600 text-white cursor-pointer`}
                title="Eliminar orden"
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

      {/* Modal de Advertencia - Pedido Demorado en Cocina */}
      {showWarningModal && order.status === 'preparing' && !isServedPhase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-11/12 shadow-2xl border-4 border-orange-500">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2 animate-pulse">🍳</div>
              <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">¡PEDIDO DEMORADO!</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                {getName()}
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-600 p-4 mb-6 rounded">
              <p className="text-gray-800 dark:text-gray-200 font-semibold text-center">
                ⚠️ El pedido lleva {displayMinutes} minutos en cocina
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setAlarmTriggered(false);
                  alarmTriggeredRef.current = false;
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                👍 Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating DeliveryTimer - Aparece cuando llega al umbral (10 o 5 minutos) */}
      {showDeliveryTimerModal && order.type === 'delivery' && (
        <DeliveryTimer 
          orderId={order.id} 
          currentMinutes={deliveryCountdownMinutes}
          currentSeconds={deliveryCountdownSeconds}
          onContinuePreparing={handleContinuePreparingDelivery}
          onRequestDelivery={handleRequestDeliveryFromTimer}
        />
      )}
    </div>
  );
};

export default OrderCard;