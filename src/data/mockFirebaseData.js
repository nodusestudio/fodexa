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
  { name: 'Clásica Normal Pequeña (1 Carne)', category: 'Burger Clásicas', price: 14000, cost: 5600, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
  { name: 'Clásica Normal Mediana (1 Carne)', category: 'Burger Clásicas', price: 17000, cost: 6800, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
  { name: 'Clásica Normal Grande (2 Carnes)', category: 'Burger Clásicas', price: 30000, cost: 12000, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
  
  // Pepitos Venezolanos
  { name: 'Pepito de Carne', category: 'Pepitos Venezolanos', price: 18000, cost: 7200, description: 'Pan blanco relleno de carne tierna, queso y vegetales', stock: 100, status: 'active', image: null },
  { name: 'Pepito Mixto', category: 'Pepitos Venezolanos', price: 20000, cost: 8000, description: 'Pan blanco con carne y salchicha, queso fundido y salsas', stock: 100, status: 'active', image: null },
  
  // Perros Calientes
  { name: 'Perro Clásico', category: 'Perros Calientes', price: 12000, cost: 4800, description: 'Salchicha premium en pan tostado con salsas y vegetales', stock: 100, status: 'active', image: null },
  { name: 'Perro Especial', category: 'Perros Calientes', price: 15000, cost: 6000, description: 'Salchicha premium con queso, tocineta y papas crujientes', stock: 100, status: 'active', image: null },
  
  // Salchicpapas
  { name: 'Salchicpapas Individual', category: 'Salchicpapas', price: 13500, cost: 5400, description: 'Salchichas con papas fritas y salsas variadas', stock: 100, status: 'active', image: null },
  { name: 'Salchicpapas Doble', category: 'Salchicpapas', price: 21000, cost: 8400, description: 'Doble porción de salchichas con papas y queso fundido', stock: 100, status: 'active', image: null },
  
  // Entradas
  { name: 'Papas Fritas Premium', category: 'Entradas', price: 8000, cost: 3200, description: 'Papas fritas crujientes con sal marina', stock: 100, status: 'active', image: null },
  { name: 'Aros de Cebolla', category: 'Entradas', price: 9000, cost: 3600, description: 'Aros de cebolla dorados y crujientes', stock: 100, status: 'active', image: null },
  
  // Combos Express
  { name: 'Combo Express Simple', category: 'Combos Express', price: 19000, cost: 7600, description: 'Hamburguesa + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo Express Doble', category: 'Combos Express', price: 35000, cost: 14000, description: 'Doble hamburguesa + papas grandes + bebida grande', stock: 100, status: 'active', image: null },
  
  // Combos de Perros
  { name: 'Combo 1 Perro', category: 'Combos de Perros', price: 17000, cost: 6800, description: 'Perro caliente + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Perros', category: 'Combos de Perros', price: 25000, cost: 10000, description: '2 perros calientes + papas + bebida', stock: 100, status: 'active', image: null },
  
  // Combos de Burger
  { name: 'Combo 1 Burger Clásica Normal', category: 'Combos de Burger', price: 21000, cost: 8400, description: 'Hamburguesa clásica + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Burger Clásica Normal', category: 'Combos de Burger', price: 38000, cost: 15200, description: '2 hamburguesas clásicas + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo Burger Premium', category: 'Combos de Burger', price: 42000, cost: 16800, description: 'Burger premium + papas grandes + bebida', stock: 100, status: 'active', image: null },
  
  // Bebidas
  { name: 'Coca Cola 400ml', category: 'Bebidas', price: 5500, cost: 2200, description: 'Bebida gaseosa Coca Cola 400ml', stock: 100, status: 'active', image: null },
  { name: 'Agua 600ml', category: 'Bebidas', price: 3500, cost: 1400, description: 'Agua embotellada 600ml', stock: 100, status: 'active', image: null },
  { name: 'Jugo Natural 400ml', category: 'Bebidas', price: 6000, cost: 2400, description: 'Jugo natural 400ml', stock: 100, status: 'active', image: null },
];

export const mockAddons = [
  { name: 'Queso Extra', price: 2500, status: 'active' },
  { name: 'Tocineta Adicional', price: 3000, status: 'active' },
  { name: 'Huevo', price: 2000, status: 'active' },
  { name: 'Salsa Extra', price: 1000, status: 'active' },
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
