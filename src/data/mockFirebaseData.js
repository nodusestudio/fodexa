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
  { name: 'Super', category: 'Perros Calientes', price: 16000, cost: 6400, description: 'Salchicha americana con queso fundido, huevos de codorniz, ripio crujiente, vegetales frescos y salsas clásicas.', stock: 100, status: 'active', image: null },
  { name: 'Especial ⭐', category: 'Perros Calientes', price: 15000, cost: 6000, description: 'Salchicha americana, queso fundido, ripio crujiente, papas a la francesa, vegetales frescos y salsas clásicas. Favorito callejero.', stock: 100, status: 'active', image: null },
  { name: 'Normal', category: 'Perros Calientes', price: 12000, cost: 4800, description: 'Salchicha americana, queso fundido, ripio crujiente, vegetales frescos y salsas clásicas.', stock: 100, status: 'active', image: null },
  
  // Salchicpapas
  { name: 'SALCHI SUPER ⭐ Pequeña', category: 'Salchicpapas', price: 19000, cost: 7600, description: 'Papas a la francesa cargadas con salchicha, chorizo jugoso, queso fundido, huevos de codorniz, plátano maduro, maíz y salsas venezolanas.', stock: 100, status: 'active', image: null },
  { name: 'SALCHI SUPER ⭐ Grande', category: 'Salchicpapas', price: 34000, cost: 13600, description: 'Papas a la francesa cargadas con salchicha, chorizo jugoso, queso fundido, huevos de codorniz, plátano maduro, maíz y salsas venezolanas. (Ideal para Compartir)', stock: 100, status: 'active', image: null },
  { name: 'SALCHI NORMAL Pequeña', category: 'Salchicpapas', price: 14000, cost: 5600, description: 'Papas a la francesa, salchicha, queso fundido y salsas de la casa aparte.', stock: 100, status: 'active', image: null },
  { name: 'SALCHI NORMAL Grande', category: 'Salchicpapas', price: 21000, cost: 8400, description: 'Papas a la francesa, salchicha, queso fundido y salsas de la casa aparte. (Porción Grande)', stock: 100, status: 'active', image: null },
  
  // Entradas
  { name: 'TEQUEÑOS', category: 'Entradas', price: 11000, cost: 4400, description: '5 tequeños rellenos de queso', stock: 100, status: 'active', image: null },
  { name: 'EMPANADAS', category: 'Entradas', price: 9000, cost: 3600, description: '5 empanaditas sabores varios', stock: 100, status: 'active', image: null },
  { name: 'PAPAS GRANDES', category: 'Entradas', price: 16000, cost: 6400, description: 'Papas a la francesa crocantes y salsas de la casa aparte.', stock: 100, status: 'active', image: null },
  { name: 'PAPAS MEDIANAS', category: 'Entradas', price: 11000, cost: 4400, description: 'Papas a la francesa crocantes y salsas de la casa aparte.', stock: 100, status: 'active', image: null },
  { name: 'PAPAS PEQUEÑAS', category: 'Entradas', price: 7000, cost: 2800, description: 'Papas a la francesa crocantes y salsas de la casa aparte.', stock: 100, status: 'active', image: null },
  
  // Combos Express
  { name: 'Combo Burger Simple', category: 'Combos Express', price: 19000, cost: 7600, description: 'Hamburguesa clásica + papas medianas + bebida 400ml', stock: 100, status: 'active', image: null },
  { name: 'Combo Burger Doble', category: 'Combos Express', price: 35000, cost: 14000, description: '2 hamburguesas clásicas + papas grandes + bebida 600ml', stock: 100, status: 'active', image: null },
  { name: 'Combo Premium Express', category: 'Combos Express', price: 42000, cost: 16800, description: 'Hamburguesa premium + papas grandes + bebida + postre', stock: 100, status: 'active', image: null },
  
  // Combos de Perros
  { name: 'Combo 1 Perro', category: 'Combos de Perros', price: 17000, cost: 6800, description: 'Perro caliente + papas medianas + bebida 400ml', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Perros', category: 'Combos de Perros', price: 25000, cost: 10000, description: '2 perros calientes + papas grandes + bebida 600ml', stock: 100, status: 'active', image: null },
  { name: 'Combo 3 Perros', category: 'Combos de Perros', price: 38000, cost: 15200, description: '3 perros calientes especiales + papas grandes + bebida grande + salsa extra', stock: 100, status: 'active', image: null },
  
  // Combos de Burger
  // BURGER CLÁSICA NORMAL
  { name: 'Combo 1 Burger Clásica Normal', category: 'Combos de Burger', price: 21000, cost: 8400, description: 'Incluye 1 hamburguesa clásica con carne jugosa, queso fundido, tocineta, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 2 bebidas de 250ml (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Burger Clásica Normal ⭐', category: 'Combos de Burger', price: 38000, cost: 15200, description: 'Incluye 2 hamburguesas clásicas con carne jugosa, queso fundido, tocineta, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 2 bebidas de 250ml (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 3 Burger Clásica Normal', category: 'Combos de Burger', price: 57000, cost: 22800, description: 'Incluye 3 hamburguesas clásicas con carne jugosa, queso fundido, tocineta, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 1 bebida de litro (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 4 Burger Clásica Normal', category: 'Combos de Burger', price: 73000, cost: 29200, description: 'Incluye 4 hamburguesas clásicas con carne jugosa, queso fundido, tocineta, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 1 bebida de litro (selector de sabor)', stock: 100, status: 'active', image: null },
  // BURGER CLÁSICA SUPER
  { name: 'Combo 1 Burger Clásica Super', category: 'Combos de Burger', price: 26000, cost: 10400, description: 'Incluye 1 hamburguesa clásica especial con carne jugosa, queso fundido, tocineta, huevos de codorniz, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 2 bebidas de 250ml (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Burger Clásica Super', category: 'Combos de Burger', price: 46000, cost: 18400, description: 'Incluye 2 hamburguesas clásicas especiales con carne jugosa, queso fundido, tocineta, huevos de codorniz, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 2 bebidas de 250ml (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 3 Burger Clásica Super ⭐', category: 'Combos de Burger', price: 68000, cost: 27200, description: 'Incluye 3 hamburguesas clásicas especiales con carne jugosa, queso fundido, tocineta, huevos de codorniz, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 1 bebida de litro (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 4 Burger Clásica Super', category: 'Combos de Burger', price: 87000, cost: 34800, description: 'Incluye 4 hamburguesas clásicas especiales con carne jugosa, queso fundido, tocineta, huevos de codorniz, ripio crujiente, vegetales frescos y salsas de la casa + papas grandes + 1 bebida de litro (selector de sabor)', stock: 100, status: 'active', image: null },
  // BURGER PREMIUM PAPUDA
  { name: 'Combo 1 Burger Premium Papuda', category: 'Combos de Burger', price: 27000, cost: 10800, description: 'Incluye 1 hamburguesa premium Papuda con carne jugosa, queso fundido, tocineta, papas fritas dentro de la burger, vegetales frescos y salsas de la casa + papas grandes + 2 bebidas de 250ml (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 2 Burger Premium Papuda ⭐', category: 'Combos de Burger', price: 48000, cost: 19200, description: 'Incluye 2 hamburguesas premium Papuda con carne jugosa, queso fundido, tocineta, papas fritas dentro de la burger, vegetales frescos y salsas de la casa + papas grandes + 2 bebidas de 250ml (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 3 Burger Premium Papuda', category: 'Combos de Burger', price: 70000, cost: 28000, description: 'Incluye 3 hamburguesas premium Papuda con carne jugosa, queso fundido, tocineta, papas fritas dentro de la burger, vegetales frescos y salsas de la casa + papas grandes + 1 bebida de litro (selector de sabor)', stock: 100, status: 'active', image: null },
  { name: 'Combo 4 Burger Premium Papuda', category: 'Combos de Burger', price: 91000, cost: 36400, description: 'Incluye 4 hamburguesas premium Papuda con carne jugosa, queso fundido, tocineta, papas fritas dentro de la burger, vegetales frescos y salsas de la casa + papas grandes + 1 bebida de litro (selector de sabor)', stock: 100, status: 'active', image: null },
  
  // Bebidas
  // Postobon
  { name: 'Postobon 250 ml', category: 'Bebidas', price: 3500, cost: 1400, description: 'Refresco Postobon 250ml con selector de sabor. Sabores: Naranja, Piña, Limón, Mora', stock: 100, status: 'active', image: null },
  { name: 'Postobon 400 ml', category: 'Bebidas', price: 4500, cost: 1800, description: 'Refresco Postobon 400ml con selector de sabor. Sabores: Naranja, Piña, Limón, Mora', stock: 100, status: 'active', image: null },
  { name: 'Postobon 1000 ml', category: 'Bebidas', price: 7000, cost: 2800, description: 'Refresco Postobon 1000ml con selector de sabor. Sabores: Naranja, Piña, Limón, Mora', stock: 100, status: 'active', image: null },
  // Coca Cola
  { name: 'Coca Cola 400 ml', category: 'Bebidas', price: 5500, cost: 2200, description: 'Refresco gaseoso Coca Cola 400ml helado', stock: 100, status: 'active', image: null },
  { name: 'Coca Cola 1500 ml', category: 'Bebidas', price: 9000, cost: 3600, description: 'Refresco gaseoso Coca Cola 1500ml helado. Perfecto para compartir', stock: 100, status: 'active', image: null },
  // Hit
  { name: 'Hit 500 ml', category: 'Bebidas', price: 5000, cost: 2000, description: 'Bebida Hit 500ml con selector de sabor. Sabores variados disponibles', stock: 100, status: 'active', image: null },
  { name: 'Hit 1000 ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Bebida Hit 1000ml con selector de sabor. Sabores variados disponibles', stock: 100, status: 'active', image: null },
  // Agua
  { name: 'Agua 300 ml', category: 'Bebidas', price: 2500, cost: 1000, description: 'Agua embotellada purificada 300ml fría', stock: 100, status: 'active', image: null },
  { name: 'Agua 600 ml', category: 'Bebidas', price: 3500, cost: 1400, description: 'Agua embotellada purificada 600ml fría', stock: 100, status: 'active', image: null },
  { name: 'Agua Sabor 400 ml', category: 'Bebidas', price: 5000, cost: 2000, description: 'Agua con sabor 400ml con selector de sabor. Sabores: Limón, Fresa, Naranja', stock: 100, status: 'active', image: null },
  // Otras Bebidas
  { name: 'Malta Polar 355 ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Malta Polar 355ml fría. Bebida energética deliciosa', stock: 100, status: 'active', image: null },
  { name: 'Frescolita 355 ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Frescolita 355ml fría. Bebida refrescante venezolana', stock: 100, status: 'active', image: null },
  
  // Adicionales
  // Carnes
  { name: 'Carne de Burger Pequeña', category: 'Adicionales', price: 6000, cost: 2400, description: 'Carne adicional de burger tamaño pequeño de la mejor calidad', stock: 100, status: 'active', image: null },
  { name: 'Carne de Burger Mediana', category: 'Adicionales', price: 7000, cost: 2800, description: 'Carne adicional de burger tamaño mediano jugosa y fresca', stock: 100, status: 'active', image: null },
  { name: 'Carne de Burger Grande', category: 'Adicionales', price: 8000, cost: 3200, description: 'Carne adicional de burger tamaño grande, corte premium', stock: 100, status: 'active', image: null },
  { name: 'Filete de Pollo Mediano', category: 'Adicionales', price: 7000, cost: 2800, description: 'Filete de pollo mediano tierno y jugoso, perfectamente cocido', stock: 100, status: 'active', image: null },
  // Embutidos
  { name: 'Chorizo de Cerdo (Porción)', category: 'Adicionales', price: 5000, cost: 2000, description: 'Porción de chorizo de cerdo artesanal ahumado', stock: 100, status: 'active', image: null },
  { name: 'Chuleta Ahumada', category: 'Adicionales', price: 9000, cost: 3600, description: 'Chuleta ahumada de cerdo, punto perfecto de cocción', stock: 100, status: 'active', image: null },
  { name: 'Salchicha Americana', category: 'Adicionales', price: 4000, cost: 1600, description: 'Salchicha americana de primera calidad, jugosa y dorada', stock: 100, status: 'active', image: null },
  { name: 'Tocineta Ahumada', category: 'Adicionales', price: 4000, cost: 1600, description: 'Tocineta ahumada crocante, punto perfecto de cocción', stock: 100, status: 'active', image: null },
  // Quesos y Huevos
  { name: 'Queso Tipo Mozarella', category: 'Adicionales', price: 3000, cost: 1200, description: 'Queso tipo mozarella fresco, perfecto para gratinar', stock: 100, status: 'active', image: null },
  { name: 'Huevo de Gallina', category: 'Adicionales', price: 2000, cost: 800, description: 'Huevo de gallina a la plancha o como lo prefieras', stock: 100, status: 'active', image: null },
  { name: 'Huevos de Codorniz (5 und.)', category: 'Adicionales', price: 4000, cost: 1600, description: 'Huevos de codorniz 5 unidades, delicados y nutritivos', stock: 100, status: 'active', image: null },
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
