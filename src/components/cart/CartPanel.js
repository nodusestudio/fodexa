// CartPanel.js - Optimized for mobile-first design
import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { useTickets } from '../../context/TicketContext';
import PaymentModal from '../payments/PaymentModal';
import CartItem from './CartItem';
import { Trash2, CreditCard, ShoppingBag, Edit2, Table, Bike, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';
import OrderTypeEditor from '../orders/OrderTypeEditor';

const CartPanel = ({ orderType, selectedTable, deliveryData: deliveryDataProp, currentOrder, onPayOrder, onCloseCart }) => {
	const { deliveryData } = useOrder();
	const { items, clearCart, updateQuantity, removeItem } = useCart();
	const { createOrder, clearCurrentOrder } = useOrder();
	const { createTicket } = useTickets();
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [showNoteModal, setShowNoteModal] = useState(false);
	const [showOrderTypeEditor, setShowOrderTypeEditor] = useState(false);
	const [selectedItemId, setSelectedItemId] = useState(null);
	const [currentNotes, setCurrentNotes] = useState('');
	const [currentPaymentOrder, setCurrentPaymentOrder] = useState(null);
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

	// Funciones para editar notas
	const openNoteModal = (itemId, notes = '') => {
		setSelectedItemId(itemId);
		setCurrentNotes(notes || '');
		setShowNoteModal(true);
	};

	const closenoteModal = () => {
		setShowNoteModal(false);
		setSelectedItemId(null);
		setCurrentNotes('');
	};

	const handleSaveNotes = () => {
		if (selectedItemId) {
			const item = items.find(i => i.id === selectedItemId);
			if (item) {
				item.notes = currentNotes || null;
			}
		}
		closenoteModal();
	};

	const handleSaveOrder = async () => {
		if (!items || items.length === 0) {
			alert('⚠️ Agregue productos al carrito');
			return;
		}

		if (!orderType) {
			alert('⚠️ Seleccione tipo de orden (Mesa, Para Llevar o Domicilio)');
			return;
		}

		if (orderType === 'table' && !selectedTable) {
			alert('⚠️ Seleccione una mesa');
			return;
		}

		if (orderType === 'delivery' && !deliveryData?.name) {
			alert('⚠️ Ingrese nombre del cliente para entrega');
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
			
			// ✅ Si es domicilio, crear TAMBIÉN el ticket para que aparezca en la sección de Domicilios
			if (orderType === 'delivery') {
				const ticketData = {
					...savedOrder,
					id: savedOrder.id,
					type: 'delivery',
					ticketNumber: savedOrder.ticketNumber || `DOM-${Date.now().toString().slice(-6)}`,
					deliveryStatus: 'solicitar-domi',
					createdAt: new Date().toISOString(),
					deliveryData: deliveryData,
					customer: deliveryData,
				};
				console.log('📦 Creando ticket automáticamente:', ticketData);
				createTicket(ticketData);
			}
			
			clearCart();
			clearCurrentOrder();
			
			// ✅ Cerrar el carrito en móvil si existe la función
			if (onCloseCart) {
				onCloseCart();
			}
			
			// ✅ Disparar evento para IMPRIMIR TICKET DE COCINA
			window.dispatchEvent(new CustomEvent('orderSaved', { 
				detail: { 
					...savedOrder, 
					status: 'pending',
					ticketType: 'kitchen' // Tipo de ticket: cocina
				} 
			}));
			
			// Mostrar notificación automática
			window.dispatchEvent(new CustomEvent('push-message', {
				detail: { message: '✅ ¡Orden guardada exitosamente!', type: 'success' }
			}));
		} catch (error) {
			console.error('❌ Error guardando orden:', error);
			alert('❌ Error: No se pudo guardar la orden');
		}
	};

	const handleProcessPayment = async () => {
		if (!items || items.length === 0) {
			alert('⚠️ Agregue productos al carrito');
			return;
		}

		try {
			// 1️⃣ CREAR la orden primero
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

			console.log('📝 Creando orden para pago:', orderData);
			const savedOrder = await createOrder(orderData);
			console.log('✅ Orden creada con ID:', savedOrder.id);

			// 2️⃣ Guarda la orden en estado local para PaymentModal
			setCurrentPaymentOrder(savedOrder);

			// 3️⃣ Disparar evento con la orden creada (para que POS.js la capture)
			onPayOrder && onPayOrder(savedOrder);

			// 4️⃣ Abrir modal de pago
			setShowPaymentModal(true);
		} catch (error) {
			console.error('❌ Error creando orden para pago:', error);
			alert('❌ Error: No se pudo crear la orden');
		}
	};

	return (
		<>
			<div className="bg-white dark:bg-gray-800 h-full flex flex-col border-0 md:border-l border-gray-300 dark:border-gray-700 rounded-none md:rounded-none">
				{/* Header */}
				<div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
					<div className="flex items-center gap-2 md:hidden">
						{onCloseCart && (
							<button 
								onClick={onCloseCart}
								className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
								title="Volver a productos"
							>
								<ArrowLeft size={20} />
							</button>
						)}
					</div>
					<h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-white flex-1">Orden ({items?.length || 0})</h2>
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

				{/* Order Type Info */}
				{orderType && (
					<div className="px-3 md:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
								{orderType === 'table' && (
									<>
										<Table className="w-4 h-4" />
										Mesa #{selectedTable || '?'}
									</>
								)}
								{orderType === 'delivery' && (
									<>
										<Bike className="w-4 h-4" />
										Domicilio {deliveryData?.name && `- ${deliveryData.name}`}
									</>
								)}
								{orderType === 'takeout' && (
									<>
										<ShoppingBag className="w-4 h-4" />
										Para Llevar
									</>
								)}
							</span>
						</div>
						<button
							onClick={() => setShowOrderTypeEditor(true)}
							className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
							title="Cambiar tipo de pedido"
						>
							<Edit2 size={16} className="text-blue-600 dark:text-blue-400" />
						</button>
					</div>
				)}

				{/* Items - Scrollable */}
				<div className="flex-1 overflow-y-auto p-1.5 md:p-2 space-y-1.5 md:space-y-2">
					{!items || items.length === 0 ? (
						<div className="text-center py-8">
							<ShoppingBag className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
							<p className="text-gray-500 dark:text-gray-400 text-sm">Sin productos</p>
						</div>
					) : (
						items.map((item, index) => (
							<CartItem key={`${item.id}-${index}`} item={item} index={index} />
						))
					)}
				</div>

				{/* Footer - Totals and Buttons */}
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
									<span>Costo de Domicilio</span>
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
								onClick={onCloseCart || (() => {})}
								className="w-full md:hidden bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm transition-colors"
							>
								← Volver a Productos
							</button>

							<button
								onClick={handleSaveOrder}
								className="w-full bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-colors shadow-lg"
							>
								💾 Guardar Orden
							</button>

							<button
								onClick={handleProcessPayment}
								className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all shadow-lg flex items-center justify-center gap-2"
							>
								<CreditCard size={20} />
								💳 Procesar Pago
							</button>
						</div>
					</div>
				)}
			</div>

			<PaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				orderData={currentPaymentOrder || {
					type: orderType,
					deliveryData: orderType === 'delivery' ? deliveryData : null
				}}
			/>

			<OrderTypeEditor
				isOpen={showOrderTypeEditor}
				onClose={() => setShowOrderTypeEditor(false)}
				currentOrderType={orderType}
				selectedTable={selectedTable}
				deliveryData={deliveryData}
			/>

			{/* Modal de editar notas */}
			{showNoteModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full shadow-xl">
						<h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
							Editar nota
						</h3>

						<textarea
							value={currentNotes}
							onChange={(e) => setCurrentNotes(e.target.value)}
							placeholder="Ej: Sin cebolla, sin picante, bien cocido..."
							className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 resize-none h-24"
						/>

						<div className="flex gap-2 mt-4">
							<button
								onClick={closenoteModal}
								className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-400 transition-colors"
							>
								Cancelar
							</button>
							<button
								onClick={handleSaveNotes}
								className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
							>
								Guardar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default CartPanel;



