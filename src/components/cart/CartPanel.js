
// CartPanel.js - Optimized for mobile-first design
import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import PaymentModal from '../payments/PaymentModal';
import { Trash2, CreditCard, ShoppingBag } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';

const CartPanel = ({ orderType, selectedTable, deliveryData: deliveryDataProp }) => {
	const { deliveryData } = useOrder();
	const { items, clearCart, updateQuantity, removeItem } = useCart();
	const { createOrder, clearCurrentOrder } = useOrder();
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const { settings } = useSettings();

	const currencyCode = settings?.currency?.code || 'COP';
	const useDecimals = settings?.currency?.decimals ?? false;
	const taxEnabled = settings?.taxes?.enabled ?? true;
	const taxValue = settings?.taxes?.iva ?? 0;
	const deliveryEnabled = settings?.delivery?.enabled ?? true;
	const deliveryBaseAmount = settings?.delivery?.baseAmount ?? 0;

	const calculateTotals = () => {
		if (!items || items.length === 0) {
			return { subtotal: 0, iva: 0, deliveryCost: 0, total: 0 };
		}

		const subtotal = items.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0;
			const qty = parseInt(item.quantity) || 1;
			const addonsTotal = item.addons?.reduce((addonSum, addon) => {
				return addonSum + (parseFloat(addon.price) || 0);
			}, 0) || 0;
			return sum + (price * qty) + addonsTotal;
		}, 0);

		// Use settings for tax calculation
		const iva = taxEnabled ? subtotal * (taxValue / 100) : 0;
		// Si el tipo es delivery y estÃ¡ habilitado, usar el costo de delivery del pedido, o el base de settings
		let deliveryCost = 0;
		if (orderType === 'delivery' && deliveryEnabled) {
			if (deliveryData && deliveryData.cost !== undefined && deliveryData.cost !== null && deliveryData.cost !== '') {
				deliveryCost = parseFloat(deliveryData.cost) || 0;
			} else {
				deliveryCost = deliveryBaseAmount;
			}
		}
		const total = subtotal + iva + deliveryCost;

		return { subtotal, iva, deliveryCost, total };
	};

	const { subtotal, iva, deliveryCost, total } = calculateTotals();

	const handleSaveOrder = () => {
		if (!items || items.length === 0) {
			alert('âš ï¸ Agrega productos al carrito');
			return;
		}
    
		const orderData = {
			type: orderType,
			tableNumber: orderType === 'table' ? selectedTable : null,
			deliveryData: orderType === 'delivery' ? deliveryData : null,
			items: items,
			subtotal: subtotal,
			total: total,
			deliveryCost: deliveryCost,
			status: 'pending',
		};
    
		createOrder(orderData);
		clearCart();
		clearCurrentOrder();
			const handleSaveOrder = () => {
				if (!items || items.length === 0) {
					alert('âš ï¸ Agrega productos al carrito');
					return;
				}
	
				const orderData = {
					type: orderType,
					tableNumber: orderType === 'table' ? selectedTable : null,
					deliveryData: orderType === 'delivery' ? deliveryData : null,
					items: items,
					subtotal: subtotal,
					total: total,
					deliveryCost: deliveryCost,
					status: 'pending',
					// Pasar explÃ­citamente los datos de cliente/domicilio
					customer: orderType === 'delivery' ? deliveryData : null,
					delivery: orderType === 'delivery' ? deliveryData : null,
				};
	
				createOrder(orderData);
				clearCart();
				clearCurrentOrder();
				window.dispatchEvent(new CustomEvent('orderSaved'));
				alert('âœ… Â¡Pedido guardado exitosamente!');
			};
		window.dispatchEvent(new CustomEvent('orderSaved'));
		alert('âœ… Â¡Pedido guardado exitosamente!');
	};

	const handleProcessPayment = () => {
		if (!items || items.length === 0) {
			alert('âš ï¸ Agrega productos al carrito');
			return;
		}
		setShowPaymentModal(true);
	};

	return (
		<>
			<div className="bg-white dark:bg-gray-800 h-full flex flex-col border-0 md:border-l border-gray-300 dark:border-gray-700 rounded-none md:rounded-none">
				{/* Header */}
				<div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
					<h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-white">Orden ({items?.length || 0})</h2>
					{items && items.length > 0 && (
						<button 
							onClick={clearCart}
							className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
							title="Limpiar carrito"
						>
							<Trash2 size={18} />
						</button>
					)}
				</div>

				{/* Items - Scrollable */}
				<div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3">
					{!items || items.length === 0 ? (
						<div className="text-center py-8">
							<ShoppingBag className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
							<p className="text-gray-500 dark:text-gray-400 text-sm">Sin productos</p>
						</div>
					) : (
						<div>
							{items.map((item, index) => (
								<div key={`${item.id}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-600">
									<div className="flex justify-between items-start mb-2">
										<div className="flex-1">
											<h4 className="font-bold text-sm md:text-base text-gray-800 dark:text-white">{item.name}</h4>
											<p className="text-sm text-blue-600 dark:text-blue-400">
												${parseFloat(item.price).toLocaleString('es-CO')} c/u
											</p>
                      
											{item.addons && item.addons.length > 0 && (
												<div className="mt-2 space-y-1">
													{item.addons.map((addon, idx) => (
														<div key={idx} className="text-xs text-purple-600 dark:text-purple-400 pl-3 border-l-2 border-purple-300 dark:border-purple-600">
															+ {addon.name} - ${parseFloat(addon.price).toLocaleString('es-CO')}
														</div>
													))}
												</div>
											)}
                      
											{item.notes && (
												<div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded text-xs text-blue-800 dark:text-blue-300">
													ðŸ“ {item.notes}
												</div>
											)}
										</div>
										<p className="font-bold text-gray-800 dark:text-white ml-4">
											${(parseFloat(item.price) * parseInt(item.quantity) + (item.addons?.reduce((sum, a) => sum + parseFloat(a.price), 0) || 0)).toLocaleString('es-CO')}
										</p>
									</div>
                  
									<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
										<div className="flex items-center gap-2">
											<button
												onClick={() => {
													const newQty = parseInt(item.quantity) - 1;
													if (newQty >= 1) {
														updateQuantity(item.id, newQty);
													}
												}}
												className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
											>
												-
											</button>
											<span className="w-8 text-center font-bold text-gray-800 dark:text-white">
												{item.quantity}
											</span>
											<button
												onClick={() => {
													const newQty = parseInt(item.quantity) + 1;
													updateQuantity(item.id, newQty);
												}}
												className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
											>
												+
											</button>
										</div>
										<button
											onClick={() => {
												removeItem(item.id);
											}}
											className="text-red-500 hover:text-red-700 p-2"
										>
											<Trash2 size={18} />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer - Totales y Botones */}
				{items && items.length > 0 && (
					<div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
						<div className="space-y-2">
							<div className="flex justify-between text-gray-600 dark:text-gray-400">
								<span>Subtotal</span>
								<span className="font-medium">{formatCurrency(subtotal, currencyCode, useDecimals)}</span>
							</div>
							{taxEnabled && (
								<div className="flex justify-between text-gray-600 dark:text-gray-400">
									<span>Impuesto ({taxValue}%)</span>
									<span className="font-medium">{formatCurrency(iva, currencyCode, useDecimals)}</span>
								</div>
							)}
							{orderType === 'delivery' && deliveryCost > 0 && (
								<div className="flex justify-between text-orange-600 dark:text-orange-400 font-medium">
									<span>ðŸš´ Costo domicilio</span>
									<span>{formatCurrency(deliveryCost, currencyCode, useDecimals)}</span>
								</div>
							)}
							<div className="flex justify-between text-lg md:text-2xl font-bold text-gray-800 dark:text-white pt-3 border-t-2 border-gray-300 dark:border-gray-600">
								<span>Total</span>
								<span className="text-blue-600 dark:text-blue-400">{formatCurrency(total, currencyCode, useDecimals)}</span>
							</div>
						</div>

						<div className="space-y-2 md:space-y-3">
							<button
								onClick={handleSaveOrder}
								className="w-full bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-colors shadow-lg"
							>
								ðŸ’¾ Guardar Pedido
							</button>
              
							<button
								onClick={handleProcessPayment}
								className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all shadow-lg flex items-center justify-center gap-2"
							>
								<CreditCard size={20} />
								Procesar Pago
							</button>
						</div>
					</div>
				)}
			</div>

			<PaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				orderData={{
					items,
					total,
					deliveryCost,
					type: orderType,
					deliveryData: orderType === 'delivery' ? deliveryData : null
				}}
			/>
		</>
	);
};

export default CartPanel;



