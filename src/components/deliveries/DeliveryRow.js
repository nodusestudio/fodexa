import React, { useState, useEffect } from 'react';
import { CheckCircle, Printer, Edit2, Save, X, ChevronDown, ChevronUp, Copy, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calcularCobraoPagar, validarPagos } from '../../utils/deliveryCalculations';

const DeliveryRow = ({ ticket, onUpdateField, onMarkDelivered, onPrintGuide, loading }) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [localStatus, setLocalStatus] = useState(ticket.deliveryStatus || 'solicitar-domi');

  // Sincronizar estado local cuando cambia el ticket o su estado
  useEffect(() => {
    setLocalStatus(ticket.deliveryStatus || 'solicitar-domi');
  }, [ticket.id, ticket.deliveryStatus]);

  const deliveryData = ticket.deliveryData || ticket.customer || {};
  const status = ticket.deliveryStatus || 'pending';

  // Variables de pago
  const pago_efectivo = parseFloat(ticket.pago_efectivo) || 0;
  const pago_digital = parseFloat(ticket.pago_digital) || 0;
  const costo_domicilio = parseFloat(ticket.deliveryCost) || 0;
  const total_pedido = parseFloat(ticket.subtotal) || 0; // Solo productos sin domicilio
  const total_con_domicilio = parseFloat(ticket.total) || 0; // Total incluyendo domicilio

  // Calcular Cobrar/Pagar
  const resultado = calcularCobraoPagar(pago_efectivo, costo_domicilio, total_pedido);
  
  // Validar pagos
  const validacion = validarPagos(pago_efectivo, pago_digital, total_pedido, costo_domicilio);

  // Mensajes para copiar al portapapeles
  const statusMessages = {
    'solicitar-domi': `Hola, me mandas un domi por favor, va para ${deliveryData.address || '(dirección del cliente)'}`,
    'en-camino': `Hola ${deliveryData.name || 'cliente'} tu pedido ya va en camino, que tengas muy buen provecho, te agradecemos por preferirnos, te esperamos pronto.\n\n📲 Síguenos en nuestras redes sociales y entérate de promociones, nuevos productos y contenido brutal 🔥🍔\n\nTikTok:\nhttps://www.tiktok.com/@roalburger?_r=1&_t=ZS-94kgEkN4aEH\n\nInstagram:\nhttps://www.instagram.com/roalburgerarmenia?igsh=cWE2eGRyNnlxaXgy&utm_source=qr\n\nFacebook:\nhttps://www.facebook.com/share/1B9MGGXh6h/?mibextid=wwXIfr\n\nROAL Burger\nComida rápida con acento venezolano 🇻🇪🔥`
  };

  const copyToClipboard = (message) => {
    navigator.clipboard.writeText(message).then(() => {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    });
  };

  const statusColors = {
    'solicitar-domi': 'bg-red-100 text-red-800 dark:bg-red-900',
    'en-camino': 'bg-blue-100 text-blue-800 dark:bg-blue-900',
    'delivered': 'bg-green-100 text-green-800 dark:bg-green-900',
    'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700',
  };

  const statusLabels = {
    'solicitar-domi': '🚨 Solicitar Domi',
    'en-camino': '🛵 En camino',
    'delivered': '✅ Entregado',
    'cancelled': '❌ Cancelado',
  };

  const handleStartEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const handleSaveEdit = (field) => {
    if (field.startsWith('deliveryData.')) {
      const subField = field.split('.')[1];
      const newData = { ...deliveryData, [subField]: editValue };
      onUpdateField(ticket.id, 'deliveryData', newData);
    } else {
      onUpdateField(ticket.id, field, editValue);
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const InlineEdit = ({ field, value, placeholder }) => (
    <>
      {editingField === field ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="px-1.5 py-0.5 border border-blue-400 rounded text-xs bg-white dark:bg-gray-700 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(field);
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <button onClick={() => handleSaveEdit(field)} className="text-green-600 hover:text-green-800 flex-shrink-0" title="Guardar">
            <Save size={12} />
          </button>
          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800 flex-shrink-0" title="Cancelar">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 group">
          <span className="text-xs truncate text-gray-900 dark:text-gray-100">
            {value || <span className="text-gray-400">-</span>}
          </span>
          <button 
            onClick={() => handleStartEdit(field, value)}
            className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            title="Editar"
          >
            <Edit2 size={12} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Fila principal - compacta tipo tabla */}
      <div className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center gap-1 p-2 text-xs bg-white dark:bg-gray-800 overflow-x-auto">
          
          {/* Ticket # */}
          <div className="flex-shrink-0 font-mono font-bold text-blue-600 dark:text-blue-400">
            #{ticket.ticketNumber}
          </div>

          {/* Cliente */}
          <div className="flex-1 min-w-0 px-1">
            <InlineEdit field="deliveryData.name" value={deliveryData.name} placeholder="Cliente" />
          </div>

          {/* Teléfono */}
          <div className="flex-shrink-0 px-1 whitespace-nowrap">
            <InlineEdit field="deliveryData.phone" value={deliveryData.phone} placeholder="Teléfono" />
          </div>

          {/* Dirección */}
          <div className="flex-1 min-w-0 px-1">
            <InlineEdit field="deliveryData.address" value={deliveryData.address} placeholder="Dirección" />
          </div>

          {/* Estado - con botón copiar */}
          <div className="flex-shrink-0 flex items-center gap-1 px-1">
            <select
              value={localStatus}
              onChange={(e) => {
                const newStatus = e.target.value;
                console.log('🔄 Estado cambiado a:', newStatus);
                setLocalStatus(newStatus);
                // Actualizar en Firebase sin esperar (se maneja con setLoading en padre)
                onUpdateField(ticket.id, 'deliveryStatus', newStatus).catch((error) => {
                  console.error('❌ Error al guardar estado:', error.message || error);
                  // Revertir al estado anterior si falla
                  setLocalStatus(ticket.deliveryStatus || 'solicitar-domi');
                  alert('⚠️ Error al guardar el estado. Intenta nuevamente.');
                });
              }}
              disabled={loading}
              className={`px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-semibold whitespace-nowrap ${statusColors[localStatus]} dark:text-white focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer`}
            >
              <option value="solicitar-domi">🚨 Solicitar Domi</option>
              <option value="en-camino">🛵 En Camino</option>
            </select>
            
            {/* Botón para copiar mensaje */}
            {statusMessages[localStatus] && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('📋 Copiando:', statusMessages[localStatus]);
                  copyToClipboard(statusMessages[localStatus]);
                }}
                className={`p-1 rounded transition-all flex-shrink-0 ${
                  copiedMessage 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-400 hover:text-white'
                }`}
                title="Copiar mensaje al portapapeles"
              >
                {copiedMessage ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </div>

          {/* Cobrar / Pagar */}
          <div className={`flex-shrink-0 px-2 text-center rounded py-1 font-semibold text-xs whitespace-nowrap ${resultado.color}`}>
            <div className="leading-tight">
              <div className="text-xs font-medium line-clamp-1">{resultado.mensaje}</div>
              <div className="font-bold">${resultado.monto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex-shrink-0 flex items-center gap-1 px-1 justify-center">
            {localStatus === 'en-camino' && (
              <button
                onClick={() => onMarkDelivered(ticket.id)}
                disabled={loading}
                className="p-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                title="Marcar entregado"
              >
                <CheckCircle size={14} />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={expanded ? 'Contraer' : 'Expandir'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Detalles expandibles */}
        {expanded && (
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              {/* Fecha y hora */}
              <div>
                <label className="text-gray-500 dark:text-gray-400 font-semibold block mb-1">Hora:</label>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(ticket.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>

              {/* Hora estimada */}
              <div>
                <label className="text-gray-500 dark:text-gray-400 font-semibold block mb-1">Est. Entrega:</label>
                <InlineEdit field="estimatedDeliveryTime" value={ticket.estimatedDeliveryTime} placeholder="HH:MM" />
              </div>

              {/* Repartidor */}
              <div>
                <label className="text-gray-500 dark:text-gray-400 font-semibold block mb-1">👤 Repartidor:</label>
                <InlineEdit field="deliveryData.rider" value={deliveryData.rider} placeholder="Asignado" />
              </div>

              {/* Referencias */}
              <div>
                <label className="text-gray-500 dark:text-gray-400 font-semibold block mb-1">📍 Referencias:</label>
                <span className="text-gray-900 dark:text-gray-100 block truncate">
                  {deliveryData.references || '-'}
                </span>
              </div>
            </div>

            {/* Notas */}
            <div className="mt-3">
              <label className="text-gray-500 dark:text-gray-400 font-semibold block mb-1 text-xs">📝 Notas:</label>
              <InlineEdit field="deliveryData.notes" value={deliveryData.notes} placeholder="Instrucciones especiales..." />
            </div>

            {/* Sección de Pagos - CRÍTICA */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1">
                  <span>💰 Cálculo de Pagos</span>
                </label>
                {!validacion.isValid && (
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-yellow-700 dark:text-yellow-300 text-xs font-semibold">
                    <AlertCircle size={12} />
                    <span>Dif: ${validacion.diferencia}</span>
                  </div>
                )}
              </div>

              {/* Grid de Pagos simplificado */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {/* Valor Pedido */}
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pedido</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    ${total_pedido.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                {/* Costo Domicilio */}
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Domi</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    ${costo_domicilio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                {/* Pago Efectivo - Editable */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Efectivo</label>
                  <InlineEdit 
                    field="pago_efectivo" 
                    value={pago_efectivo.toString()} 
                    placeholder="0"
                  />
                </div>

                {/* Pago Digital - Editable */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Digital</label>
                  <InlineEdit 
                    field="pago_digital" 
                    value={pago_digital.toString()} 
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Resultado: Cobrar / Pagar */}
              <div className={`p-3 rounded-lg border-2 text-center font-bold text-sm ${resultado.color}`}>
                <div className="text-xs mb-1">Movimiento de Caja</div>
                <div className="text-lg mb-1">
                  {resultado.tipo === 'cobrar' && '💵'} 
                  {resultado.tipo === 'pagar' && '💸'}
                  {resultado.tipo === 'sin-movimiento' && '⚪'}
                </div>
                <div className="text-sm">{resultado.mensaje}</div>
                <div className="text-lg font-bold mt-1">
                  ${resultado.monto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Items */}
            {ticket.items && ticket.items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <label className="text-gray-500 dark:text-gray-400 font-semibold block mb-2 text-xs">📦 Items:</label>
                <div className="space-y-1">
                  {ticket.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-900 dark:text-gray-100">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        ${(item.price * item.quantity).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DeliveryRow;
