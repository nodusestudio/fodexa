import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext';

/**
 * Componente de diagnóstico para verificar el estado de las órdenes
 * Debe mostrarse solo en desarrollo para debuggear problemas de persistencia
 */
const DebugOrderStatus = () => {
  const { orders } = useOrder();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    console.log('🔍 [DEBUG] Estado actual de órdenes:', {
      total: orders.length,
      byStatus: orders.reduce((acc, o) => {
        const status = o.status || 'SIN_STATUS';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byType: orders.reduce((acc, o) => {
        const type = o.type || 'SIN_TYPE';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      localIds: orders.filter(o => o.id.startsWith('local_')).length,
      firebaseIds: orders.filter(o => !o.id.startsWith('local_')).length,
    });
  }, [orders]);

  // Mostrar panel de debug (comentar para ocultar)
  const DEBUG = true;
  if (!DEBUG) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: '#0f0',
      padding: '8px',
      borderRadius: '4px',
      maxWidth: expanded ? '400px' : '120px',
      maxHeight: expanded ? '500px' : '30px',
      overflow: 'auto',
      cursor: 'pointer',
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        📊 ÓRDENES: {orders.length}
      </div>
      
      {expanded && (
        <div>
          <div style={{ marginBottom: '4px', borderTop: '1px solid #0f0', paddingTop: '4px' }}>
            Por Status:
            {Object.entries(orders.reduce((acc, o) => {
              const status = o.status || 'SIN_STATUS';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {})).map(([status, count]) => (
              <div key={status} style={{ 
                color: status === 'pending' ? '#0f0' : status === 'completed' ? '#f00' : '#ff0'
              }}>
                {status}: {count}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '4px', borderTop: '1px solid #0f0', paddingTop: '4px' }}>
            Por Tipo:
            {Object.entries(orders.reduce((acc, o) => {
              const type = o.type || 'SIN_TYPE';
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})).map(([type, count]) => (
              <div key={type}>{type}: {count}</div>
            ))}
          </div>

          <div style={{ marginBottom: '4px', borderTop: '1px solid #0f0', paddingTop: '4px' }}>
            IDs:
            <div style={{ color: '#f00' }}>
              Local: {orders.filter(o => o.id.startsWith('local_')).length}
            </div>
            <div style={{ color: '#0f0' }}>
              Firebase: {orders.filter(o => !o.id.startsWith('local_')).length}
            </div>
          </div>

          {orders.length > 0 && (
            <div style={{ marginTop: '4px', borderTop: '1px solid #0f0', paddingTop: '4px', maxHeight: '200px', overflow: 'auto' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Detalle:</div>
              {orders.map(order => (
                <div key={order.id} style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '2px 4px',
                  marginBottom: '2px',
                  fontSize: '9px',
                  color: order.status === 'pending' ? '#0f0' : order.status === 'completed' ? '#f00' : '#ff0'
                }}>
                  <div>{order.type}({order.id.substring(0, 8)})</div>
                  <div>status: {order.status || 'null'}</div>
                  <div>items: {order.items?.length || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugOrderStatus;
