// Datos ficticios para pruebas en Firebase

export const mockCategories = [
  { name: 'Burger Clásicas', description: 'Hamburguesas clásicas jugosas con ingredientes frescos', color: '#F59E0B', status: 'active' },
  { name: 'Burger Premium', description: 'Hamburguesas premium con ingredientes especiales de primera calidad', color: '#EF4444', status: 'active' },
  { name: 'Pepitos Venezolanos', description: 'Deliciosos pepitos rellenos y sabrosos', color: '#DC2626', status: 'active' },
  { name: 'Perros Calientes', description: 'Perros calientes con variedad de toppings', color: '#EA580C', status: 'active' },
  { name: 'Salchicpapas', description: 'Salchipapas crujientes con salsas variadas', color: '#D97706', status: 'active' },
  { name: 'Entradas', description: 'Entradas y acompañamientos variados', color: '#10B981', status: 'active' },
  { name: 'Combos Express', description: 'Combos rápidos y deliciosos para llevar', color: '#06B6D4', status: 'active' },
  { name: 'Combos de Perros', description: 'Combos de perros calientes con papas y bebida', color: '#8B5CF6', status: 'active' },
  { name: 'Combos de Burger', description: 'Combos de hamburguesas con papas y bebida', color: '#10B981', status: 'active' },
  { name: 'Adicionales', description: 'Ingredientes y agregados extras para personalizar tu orden', color: '#A78BFA', status: 'active' },
  { name: 'Bebidas', description: 'Gaseosas, jugos naturales y agua embotellada', color: '#3B82F6', status: 'active' },
];

export const mockProducts = [
  // Burger Premium
  { name: 'Cordillera', category: 'Burger Premium', price: 34000, cost: 13600, description: 'Carne jugosa, queso fundido, maduritos fritos, pepinillos dulces, lechuga fresca, exquisito topping de chuleta ahumada y salsas artesanales', stock: 100, status: 'active', image: null },
  { name: 'Ranchera ⭐', category: 'Burger Premium', price: 30000, cost: 12000, description: 'Carne jugosa, salchicha dorada, queso fundido, coronada con maíz dulce, plátano maduro, ripio de papa, vegetales y salsas de la casa (La más pedida)', stock: 100, status: 'active', image: null },
  { name: 'Plus', category: 'Burger Premium', price: 30000, cost: 12000, description: 'Carne jugosa, queso, topping de chorizo artesanal, ripio de papa, plátano maduro, huevos de codorniz, vegetales y salsas de la casa', stock: 100, status: 'active', image: null },
  { name: 'Triplete', category: 'Burger Premium', price: 29000, cost: 11600, description: 'La combinación perfecta de carne, pollo y chorizo bien dorados, con queso fundido, tocineta crocante, ripio crujiente, vegetales frescos y salsas irresistibles', stock: 100, status: 'active', image: null },
  { name: 'Caracas', category: 'Burger Premium', price: 26000, cost: 10400, description: 'Carne artesanal, chorizo jugoso y queso fundido, acompañados de tocineta crocante, huevo a la plancha, aguacate, vegetales y salsas tradicionales', stock: 100, status: 'active', image: null },
  { name: 'Papuda', category: 'Burger Premium', price: 20000, cost: 8000, description: 'Carne jugosa con queso fundido y tocineta crocante, cargada de papas a la francesa, plátano maduro dorado, con vegetales frescos y salsas de la casa', stock: 100, status: 'active', image: null },
  
  // Burger Clásicas
  { name: 'Clásica Normal Pequeña (1 Carne)', category: 'Burger Clásicas', price: 14000, cost: 5600, description: 'Hamburguesa jugosa con queso, tocineta, ripio, lechuga, tomate y salsas', stock: 100, status: 'active', image: null },
  { name: 'Clásica Normal Mediana (1 Carne)', category: 'Burger Clásicas', price: 17000, cost: 6800, description: 'Hamburguesa de tamaño medio con queso fundido, tocineta, ripio de papa, vegetales frescos y salsas de la casa', stock: 100, status: 'active', image: null },
  { name: 'Clásica Normal Grande (2 Carnes)', category: 'Burger Clásicas', price: 24000, cost: 9600, description: 'Hamburguesa grande con doble carne, queso fundido, tocineta crocante, ripio, vegetales frescos y salsas', stock: 100, status: 'active', image: null },
  
  // Pepitos Venezolanos
  { name: 'Plus ⭐', category: 'Pepitos Venezolanos', price: 36000, cost: 14400, description: 'Pepito ultra cargado con cuatro carnes jugosas, tocineta crocante, queso fundido, ripio crujiente, vegetales frescos y salsas de la casa. Para el que quiere todo', stock: 100, status: 'active', image: null },
  { name: 'Ranchero', category: 'Pepitos Venezolanos', price: 34000, cost: 13600, description: 'Explosión de carnes con salchicha, queso fundido, ripio crujiente y maíz dulce, acompañado de vegetales frescos y salsas venezolanas. Abundante y callejero.', stock: 100, status: 'active', image: null },
  { name: 'Urbano', category: 'Pepitos Venezolanos', price: 30000, cost: 12000, description: 'Pepito cargado con una poderosa combinación de carnes, queso fundido, ripio crujiente, aguacate fresco, vegetales y salsas que elevan el sabor a otro nivel.', stock: 100, status: 'active', image: null },
  { name: 'Mix', category: 'Pepitos Venezolanos', price: 29000, cost: 11600, description: 'Mezcla irresistible de carnes bien jugosas, con queso fundido, papas a la francesa, huevo, vegetales frescos y salsas de la casa. El clásico completo que nunca falla.', stock: 100, status: 'active', image: null },
  
  // Perros Calientes
  { name: 'Perro Clásico Simple', category: 'Perros Calientes', price: 12000, cost: 4800, description: 'Salchicha premium en pan tostado con salsas caseras, mostaza y vegetales', stock: 100, status: 'active', image: null },
  { name: 'Perro Especial', category: 'Perros Calientes', price: 15000, cost: 6000, description: 'Salchicha premium con queso fundido, tocineta crocante, papas fritas y salsas de la casa', stock: 100, status: 'active', image: null },
  { name: 'Perro Argentino', category: 'Perros Calientes', price: 16000, cost: 6400, description: 'Salchicha premium con chimichurri casero, queso fundido, vegetales y salsas premium', stock: 100, status: 'active', image: null },
  
  // Salchicpapas
  { name: 'Salchicpapas Individual', category: 'Salchicpapas', price: 13500, cost: 5400, description: 'Salchichas con papas fritas crujientes y salsas variadas', stock: 100, status: 'active', image: null },
  { name: 'Salchicpapas Doble', category: 'Salchicpapas', price: 21000, cost: 8400, description: 'Doble porción de salchichas con papas fritas y queso fundido derretido', stock: 100, status: 'active', image: null },
  { name: 'Salchicpapas Especial', category: 'Salchicpapas', price: 25000, cost: 10000, description: 'Salchichas premium con papas fritas, queso fundido, tocineta y salsas caseras', stock: 100, status: 'active', image: null },
  
  // Entradas
  { name: 'Papas Fritas Premium', category: 'Entradas', price: 8000, cost: 3200, description: 'Papas fritas crujientes con sal marina y especias', stock: 100, status: 'active', image: null },
  { name: 'Aros de Cebolla Dorados', category: 'Entradas', price: 9000, cost: 3600, description: 'Aros de cebolla dorados y crujientes con salsa de ajo', stock: 100, status: 'active', image: null },
  { name: 'Tabla de Queso y Embutidos', category: 'Entradas', price: 28000, cost: 11200, description: 'Tabla variada con queso fundido, jamón, salchicha y panes tostados', stock: 100, status: 'active', image: null },
  
  // Combos Express
  { name: 'Combo Burger Simple', category: 'Combos Express', price: 19000, cost: 7600, description: 'Hamburguesa clásica + papas medianas + bebida 400ml', stock: 100, status: 'active', image: null },
  { name: 'Combo Burger Doble', category: 'Combos Express', price: 35000, cost: 14000, description: '2 hamburguesas clásicas + papas grandes + bebida 600ml', stock: 100, status: 'active', image: null },
  { name: 'Combo Premium Express', category: 'Combos Express', price: 42000, cost: 16800, description: 'Hamburguesa premium + papas grandes + bebida + postre', stock: 100, status: 'active', image: null },
  
  // Combos de Perros
  { name: 'Combo 1 Perro', category: 'Combos de Perros', price: 17000, cost: 6800, description: 'Perro caliente + papas medianas + bebida 400ml', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Perros', category: 'Combos de Perros', price: 25000, cost: 10000, description: '2 perros calientes + papas grandes + bebida 600ml', stock: 100, status: 'active', image: null },
  { name: 'Combo 3 Perros', category: 'Combos de Perros', price: 38000, cost: 15200, description: '3 perros calientes especiales + papas grandes + bebida grande + salsa extra', stock: 100, status: 'active', image: null },
  
  // Combos de Burger
  { name: 'Combo 1 Burger Clásica', category: 'Combos de Burger', price: 21000, cost: 8400, description: '1 Hamburguesa clásica + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Burger Clásica', category: 'Combos de Burger', price: 38000, cost: 15200, description: '2 Hamburguesas clásicas + papas grandes + bebida grande', stock: 100, status: 'active', image: null },
  { name: 'Combo Burger Premium', category: 'Combos de Burger', price: 48000, cost: 19200, description: 'Hamburguesa Premium Ranchera + papas premium + bebida grande + postre', stock: 100, status: 'active', image: null },
  
  // Bebidas
  { name: 'Coca Cola 400ml', category: 'Bebidas', price: 5500, cost: 2200, description: 'Refresco gaseoso Coca Cola 400ml helado', stock: 100, status: 'active', image: null },
  { name: 'Coca Cola 600ml', category: 'Bebidas', price: 7000, cost: 2800, description: 'Refresco gaseoso Coca Cola 600ml helado', stock: 100, status: 'active', image: null },
  { name: 'Agua Embotellada 600ml', category: 'Bebidas', price: 3500, cost: 1400, description: 'Agua embotellada purificada 600ml fría', stock: 100, status: 'active', image: null },
  { name: 'Jugo Natural Mango 400ml', category: 'Bebidas', price: 6000, cost: 2400, description: 'Jugo natural de mango fresco 400ml', stock: 100, status: 'active', image: null },
  { name: 'Jugo Natural Fresa 400ml', category: 'Bebidas', price: 6000, cost: 2400, description: 'Jugo natural de fresa fresca 400ml', stock: 100, status: 'active', image: null },
  { name: 'Cerveza Artesanal 355ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Cerveza artesanal 355ml fría', stock: 100, status: 'active', image: null },
  
  // Adicionales
  { name: 'Queso Extra Fundido', category: 'Adicionales', price: 2500, cost: 1000, description: 'Queso fundido adicional de alta calidad', stock: 100, status: 'active', image: null },
  { name: 'Tocineta Crocante Extra', category: 'Adicionales', price: 3000, cost: 1200, description: 'Porción extra de tocineta crocante', stock: 100, status: 'active', image: null },
  { name: 'Huevo a la Plancha', category: 'Adicionales', price: 2000, cost: 800, description: 'Huevo a la plancha bien hecho', stock: 100, status: 'active', image: null },
  { name: 'Salsa Extra Casera', category: 'Adicionales', price: 1000, cost: 400, description: 'Porción extra de salsa artesanal de la casa', stock: 100, status: 'active', image: null },
  { name: 'Aguacate Fresco', category: 'Adicionales', price: 4000, cost: 1600, description: 'Aguacate fresco y maduro', stock: 100, status: 'active', image: null },
  { name: 'Chorizo Extra', category: 'Adicionales', price: 3500, cost: 1400, description: 'Porción extra de chorizo artesanal', stock: 100, status: 'active', image: null },
];

export const mockAddons = [
  { name: 'Queso Extra', price: 2500, status: 'active' },
  { name: 'Tocineta Adicional', price: 3000, status: 'active' },
  { name: 'Huevo', price: 2000, status: 'active' },
  { name: 'Salsa Extra', price: 1000, status: 'active' },
  // Bebidas para Combo (Papas + Bebida)
  { name: 'Pepsi Original', price: 0, category: 'bebidas-combo', status: 'active' },
  { name: 'Pepsi 0', price: 0, category: 'bebidas-combo', status: 'active' },
  { name: 'Naranja', price: 0, category: 'bebidas-combo', status: 'active' },
  { name: 'Manzana', price: 0, category: 'bebidas-combo', status: 'active' },
  { name: 'Colombiana', price: 0, category: 'bebidas-combo', status: 'active' },
  { name: 'Uva', price: 0, category: 'bebidas-combo', status: 'active' },
  { name: 'Toronja', price: 0, category: 'bebidas-combo', status: 'active' },
];

export const mockOrders = [
  {
    id: 'order_0',
    type: 'table',
    tableNumber: 5,
    items: [
      { id: 1, name: 'Cordillera', price: 34000, quantity: 1, addons: [] },
      { id: 11, name: 'Coca Cola 400ml', price: 5500, quantity: 2, addons: [] },
    ],
    status: 'pending',
    notes: 'Sin picante',
    timestamp: new Date(),
    total: 45000,
  },
  {
    id: 'order_1',
    type: 'delivery',
    deliveryData: { name: 'Juan Pérez', phone: '300 123 4567', address: 'Calle 123 #45', cost: 5000 },
    items: [
      { id: 2, name: 'Ranchera', price: 30000, quantity: 2, addons: [{ name: 'Queso Extra', price: 2500 }] },
      { id: 12, name: 'Agua 600ml', price: 3500, quantity: 3, addons: [] },
    ],
    status: 'preparing',
    notes: 'Entregar después de las 7pm',
    timestamp: new Date(),
    total: 75000,
  },
  {
    id: 'order_2',
    type: 'takeout',
    items: [
      { id: 3, name: 'Combo 1 Burger Clásica Normal', price: 21000, quantity: 1, addons: [] },
      { id: 10, name: 'Combo 2 Perros', price: 25000, quantity: 1, addons: [{ name: 'Salsa Extra', price: 1000 }] },
    ],
    status: 'ready',
    notes: 'Para llevar',
    timestamp: new Date(),
    total: 47000,
  },
];

export const mockExpenses = [
  { amount: 50000, category: 'supplies', description: 'Compra de pan para hamburguesas' },
  { amount: 25000, category: 'utilities', description: 'Pago parcial de electricidad' },
  { amount: 10000, category: 'maintenance', description: 'Limpieza de equipos' },
];
