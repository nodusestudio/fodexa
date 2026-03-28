// Datos ficticios para pruebas en Firebase

export const mockCategories = [
  { name: 'Burger Premium', description: 'Hamburguesas premium con ingredientes especiales', color: '#EF4444', status: 'active' },
  { name: 'Burger Clásicas', description: 'Hamburguesas clásicas en diferentes tamaños', color: '#F59E0B', status: 'active' },
  { name: 'Combos Burger', description: 'Combos de hamburguesas con papas y bebida', color: '#10B981', status: 'active' },
  { name: 'Combos Perros', description: 'Combos de perros calientes con papas y bebida', color: '#8B5CF6', status: 'active' },
  { name: 'Bebidas', description: 'Gaseosas, jugos y agua', color: '#3B82F6', status: 'active' },
];

export const mockProducts = [
  // Burger Premium
  { name: 'Cordillera', category: 'Burger Premium', price: 34000, cost: 13600, description: 'Carne jugosa, queso fundido, maduritos fritos, pepinillos dulces, lechuga fresca', stock: 100, status: 'active', image: null },
  { name: 'Ranchera', category: 'Burger Premium', price: 30000, cost: 12000, description: 'Carne jugosa, salchicha dorada, queso fundido, coronada con maíz dulce', stock: 100, status: 'active', image: null },
  { name: 'Plus', category: 'Burger Premium', price: 30000, cost: 12000, description: 'Carne jugosa, queso, topping de chorizo artesanal, ripio de papa', stock: 100, status: 'active', image: null },
  
  // Burger Clásicas
  { name: 'Clásica Normal Pequeña (1 Carne)', category: 'Burger Clásicas', price: 14000, cost: 5600, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
  { name: 'Clásica Normal Mediana (1 Carne)', category: 'Burger Clásicas', price: 17000, cost: 6800, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
  { name: 'Clásica Normal Grande (2 Carnes)', category: 'Burger Clásicas', price: 30000, cost: 12000, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
  
  // Combos Burger
  { name: 'Combo 1 Burger Clásica Normal', category: 'Combos Burger', price: 21000, cost: 8400, description: 'Hamburguesa clásica + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Burger Clásica Normal', category: 'Combos Burger', price: 38000, cost: 15200, description: '2 hamburguesas clásicas + papas + bebida', stock: 100, status: 'active', image: null },
  
  // Combos Perros
  { name: 'Combo 1 Perro', category: 'Combos Perros', price: 17000, cost: 6800, description: 'Perro caliente + papas + bebida', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Perros', category: 'Combos Perros', price: 25000, cost: 10000, description: '2 perros calientes + papas + bebida', stock: 100, status: 'active', image: null },
  
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
