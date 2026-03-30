/**
 * Calcula el monto a cobrar o pagar al domiciliario
 * 
 * LÓGICA:
 * - El domiciliario recibe pago_efectivo
 * - El domiciliario debe dar a empresa: pago_efectivo - costo_domicilio
 * - Si hay dinero faltante en efectivo: empresa paga la comisión al domiciliario
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

  // Lo que el domiciliario debe dar a la empresa
  // = Lo que recibió en efectivo - Su comisión
  const montoParaEmpresa = montoEfectivo - costoDomi;

  if (montoEfectivo === 0) {
    // Sin efectivo: empresa PAGA al domiciliario su comisión
    return {
      monto: costoDomi,
      tipo: 'pagar',
      mensaje: `La empresa paga al domiciliario`,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
    };
  }

  if (montoParaEmpresa > 0) {
    // Domiciliario PAGA a empresa (tiene dinero sobrante)
    return {
      monto: montoParaEmpresa,
      tipo: 'cobrar',
      mensaje: `Domiciliario paga a la empresa`,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
    };
  }

  if (montoParaEmpresa === 0) {
    // Exacto: sin movimiento
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
