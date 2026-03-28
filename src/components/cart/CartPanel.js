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
		// If delivery type and enabled, use delivery cost from data or base amount
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

	const handleSaveOrder = async () => {
		if (!items || items.length === 0) {
			alert('⚠️ Agregue productos al carrito');
			return;
		}

		const orderData = {
			type: orderType,
			tableNumber: orderType === 'table' ? selectedTable : null,
			deliveryData: orderType === 'delivery' ? deliveryData : null,
			items: items,
			subtotal: subtotal,
			iva: iva,
			total: total,
			deliveryCost: deliveryCost,
			status: 'pending',
			taxesConfig: { enabled: taxEnabled, value: taxValue },
			currencyCode: currencyCode,
			timestamp: new Date(),
		};

		try {
			console.log('📝 Creando orden:', orderData);
			const savedOrder = await createOrder(orderData);
			console.log('✅ Orden guardada:', savedOrder);
			clearCart();
			clearCurrentOrder();
			
			// ✅ Disparar evento para guardar ORDEN (sin imprimir ticket)
			window.dispatchEvent(new CustomEvent('orderSaved', { detail: { ...savedOrder, status: 'pending' } }));
			
			// Mostrar confirmación después
			setTimeout(() => {
				alert('✅ ¡Orden guardada exitosamente!');
			}, 300);
		} catch (error) {
			console.error('❌ Error guardando orden:', error);
			alert('❌ Error: No se pudo guardar la orden');
		}
	};

	const handleProcessPayment = () => {
		if (!items || items.length === 0) {
			alert('⚠️ Agregue productos al carrito');
			return;
		}
		setShowPaymentModal(true);
	};

	return (
		<>
			<div className="bg-white dark:bg-gray-800 h-full flex flex-col border-0 md:border-l border-gray-300 dark:border-gray-700 rounded-none md:rounded-none lg:rounded-lg">
				{/* Header */}
				<div className="flex items-center justify-between p-2 sm:p-3 md:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
					<h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">Orden ({items?.length || 0})</h2>
					{items && items.length > 0 && (
						<button 
							onClick={clearCart}
							className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
							title="Clear cart"
						>
							<Trash2 size={18} />
						</button>
					)}
				</div>

				{/* Items - Scrollable */}
				<div className="flex-1 overflow-y-auto p-1.5 sm:p-2 md:p-3 lg:p-4 space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4">
					{!items || items.length === 0 ? (
						<div className="text-center py-8">
							<ShoppingBag className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
						<p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Sin productos</p>
						</div>
					) : (
						<div>
							{items.map((item, index) => (
								<div key={`${item.id}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 md:p-4 lg:p-5 border border-gray-200 dark:border-gray-600">
									<div className="flex justify-between items-start mb-1.5 sm:mb-2 md:mb-3">
										<div className="flex-1 min-w-0">
											<h4 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white truncate">{item.name}</h4>
											<p className="text-xs sm:text-sm md:text-base text-blue-600 dark:text-blue-400">
												${parseFloat(item.price).toLocaleString('es-CO')} c/u
											</p>

											{item.addons && item.addons.length > 0 && (
												<div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
													{item.addons.map((addon, idx) => (
														<div key={idx} className="text-xs text-purple-600 dark:text-purple-400 pl-2 sm:pl-3 border-l-2 border-purple-300 dark:border-purple-600">
															+ {addon.name} - ${parseFloat(addon.price).toLocaleString('es-CO')}
														</div>
													))}
												</div>
											)}

											{item.notes && (
												<div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded text-xs text-blue-800 dark:text-blue-300">
													Note: {item.notes}
												</div>
											)}
										</div>
										<p className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white ml-2 sm:ml-3 md:ml-4 flex-shrink-0">
											${(parseFloat(item.price) * parseInt(item.quantity) + (item.addons?.reduce((sum, a) => sum + parseFloat(a.price), 0) || 0)).toLocaleString('es-CO')}
										</p>
									</div>

									<div className="flex items-center justify-between mt-2 sm:mt-2.5 md:mt-3 pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-200 dark:border-gray-600">
										<div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
											<button
												onClick={() => {
													const newQty = parseInt(item.quantity) - 1;
													if (newQty >= 1) {
														updateQuantity(item.id, newQty);
													}
												}}
												className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold"
											>
												-
											</button>
											<span className="w-6 sm:w-7 md:w-8 text-center font-bold text-xs sm:text-sm md:text-base text-gray-800 dark:text-white">
												{item.quantity}
											</span>
											<button
												onClick={() => {
													const newQty = parseInt(item.quantity) + 1;
													updateQuantity(item.id, newQty);
												}}
												className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold"
											>
												+
											</button>
										</div>
										<button
											onClick={() => {
												removeItem(item.id);
											}}
											className="text-red-500 hover:text-red-700 p-1.5 sm:p-2"
										>
											<Trash2 size={18} />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer - Totals and Buttons */}
				{items && items.length > 0 && (
					<div className="border-t border-gray-200 dark:border-gray-700 p-2.5 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 bg-gray-50 dark:bg-gray-900">
						<div className="space-y-2 sm:space-y-2.5 md:space-y-3">
							<div className="flex justify-between text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400">
								<span>Subtotal</span>
								<span className="font-medium">{formatCurrency(subtotal, currencyCode, useDecimals)}</span>
							</div>
							{taxEnabled && (
								<div className="flex justify-between text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400">
									<span>Impuesto ({taxValue}%)</span>
									<span className="font-medium">{formatCurrency(iva, currencyCode, useDecimals)}</span>
								</div>
							)}
							{orderType === 'delivery' && deliveryCost > 0 && (
								<div className="flex justify-between text-xs sm:text-sm md:text-base lg:text-lg text-orange-600 dark:text-orange-400 font-medium">
									<span>Costo de Domicilio</span>
									<span>{formatCurrency(deliveryCost, currencyCode, useDecimals)}</span>
								</div>
							)}
							<div className="flex justify-between text-sm sm:text-base md:text-xl lg:text-3xl font-bold text-gray-800 dark:text-white pt-3 border-t-2 border-gray-300 dark:border-gray-600">
								<span>Total</span>
								<span className="text-blue-600 dark:text-blue-400">{formatCurrency(total, currencyCode, useDecimals)}</span>
							</div>
						</div>

						<div className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-4">
							<button
								onClick={handleSaveOrder}
								className="w-full bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-colors shadow-lg hover:shadow-xl active:scale-95"
							>
								💾 <span className="hidden sm:inline">Guardar</span> Orden
							</button>

							<button
								onClick={handleProcessPayment}
								className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
							>
								<CreditCard size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
								💳 <span className="hidden sm:inline">Procesar</span> Pago
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



