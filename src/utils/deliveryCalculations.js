/**
 * Calcula el monto a cobrar o pagar al domiciliario
 * 
 * LÓGICA CORRECTA:
 * - Si pago_efectivo > 0: El domiciliario PAGA el PEDIDO a la empresa (efectivo)
 * - Si pago_efectivo = 0 (Tarjeta/Digital): La empresa PAGA el costo domi al domiciliario
 * - El costo del domicilio es aparte, solo entra en juego si es tarjeta
 * 
 * @param {number} pago_efectivo - Dinero en efectivo que da el cliente
 * @param {number} costo_domicilio - Costo del domicilio (comisión del repartidor)
 * @param {number} total_pedido - Valor total del pedido SIN domicilio
 * @returns {object} { monto: number, tipo: 'pagar' | 'cobrar' | 'sin-movimiento', mensaje: string, color: string }
 */
export const calcularCobraoPagar = (pago_efectivo = 0, costo_domicilio = 0, total_pedido = 0) => {
  const montoEfectivo = parseFloat(pago_efectivo) || 0;
  const costoDomi = parseFloat(costo_domicilio) || 0;
  const totalPedido = parseFloat(total_pedido) || 0;

  // CASO 1: Pago en EFECTIVO
  if (montoEfectivo > 0) {
    // El domiciliario PAGA el PEDIDO a la empresa
    return {
      monto: totalPedido,
      tipo: 'cobrar',
      mensaje: `Domiciliario paga el pedido a la empresa`,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
    };
  }

  // CASO 2: Pago en TARJETA/DIGITAL (sin efectivo)
  if (montoEfectivo === 0 && costoDomi > 0) {
    // La empresa PAGA el costo del domicilio al domiciliario
    return {
      monto: costoDomi,
      tipo: 'pagar',
      mensaje: `La empresa paga el costo del domicilio`,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
    };
  }

  // CASO 3: Sin movimiento (sin efectivo y sin costo domi)
  if (montoEfectivo === 0 && costoDomi === 0) {
    return {
      monto: 0,
      tipo: 'sin-movimiento',
      mensaje: `Sin movimiento de caja`,
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
    };
  }

  // montoParaEmpresa < 0: empresa PAGA al domiciliario (falta efectivo)
  const montoAPagar = Math.abs(montoParaEmpresa);
  return {
    monto: montoAPagar,
    tipo: 'pagar',
    mensaje: `La empresa paga al domiciliario`,
    color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
  };
};

/**
 * Valida que pago_efectivo + pago_digital = total_pedido + costo_domicilio
 */
export const validarPagos = (pago_efectivo = 0, pago_digital = 0, total_pedido = 0, costo_domicilio = 0) => {
  const totalEsperado = total_pedido + costo_domicilio;
  const totalPagado = pago_efectivo + pago_digital;
  
  return {
    isValid: Math.abs(totalPagado - totalEsperado) < 0.01, // Margen de error por decimales
    totalEsperado: totalEsperado.toFixed(2),
    totalPagado: totalPagado.toFixed(2),
    diferencia: (totalPagado - totalEsperado).toFixed(2),
  };
};
