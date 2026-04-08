export function formatCurrency(amount, currencyCode = 'COP', useDecimals = false) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: useDecimals ? 2 : 0,
    maximumFractionDigits: useDecimals ? 2 : 0,
  }).format(amount);
}
