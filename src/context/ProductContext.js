import { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  // Productos de ejemplo iniciales
  const [products, setProducts] = useState([
    // BURGER PREMIUM (6)
    { id: 1, name: 'Cordillera', category: 'Burger Premium', price: 34000, cost: 13600, description: 'Carne jugosa, queso fundido, maduritos fritos, pepinillos dulces, lechuga fresca, exquisito topping de chuleta ahumada y salsas artesanales', stock: 100, status: 'active', image: null },
    { id: 2, name: 'Ranchera', category: 'Burger Premium', price: 30000, cost: 12000, description: 'Carne jugosa, salchicha dorada, queso fundido, coronada con maíz dulce, platano maduro, ripio de papa, vegetales y salsas de la casa', stock: 100, status: 'active', image: null },
    { id: 3, name: 'Plus', category: 'Burger Premium', price: 30000, cost: 12000, description: 'Carne jugosa, queso, topping de chorizo artesanal, ripio de papa, plátano maduro, huevos de codorniz, vegetales y salsas de la casa', stock: 100, status: 'active', image: null },
    { id: 4, name: 'Triplete', category: 'Burger Premium', price: 29000, cost: 11600, description: 'La combinación perfecta de carne, pollo y chorizo bien dorados, con queso fundido, tocineta crocante, ripio crujiente, vegetales frescos y salsas irresistibles', stock: 100, status: 'active', image: null },
    { id: 5, name: 'Caracas', category: 'Burger Premium', price: 26000, cost: 10400, description: 'Carne artesanal, chorizo jugoso y queso fundido, acompañados de tocineta crocante, huevo a la plancha, aguacate, vegetales y salsas tradicionales', stock: 100, status: 'active', image: null },
    { id: 6, name: 'Papuda', category: 'Burger Premium', price: 20000, cost: 8000, description: 'Carne jugosa con queso fundido y tocineta crocante, cargada de papas a la francesa, plátano maduro dorado, con vegetales frescos y salsas de la casa', stock: 100, status: 'active', image: null },
    
    // BURGER CLÁSICAS (8)
    { id: 7, name: 'Clásica Normal Pequeña (1 Carne)', category: 'Burger Clásicas', price: 14000, cost: 5600, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 8, name: 'Clásica Normal Pequeña (2 Carnes)', category: 'Burger Clásicas', price: 18000, cost: 7200, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 9, name: 'Clásica Normal Mediana (1 Carne)', category: 'Burger Clásicas', price: 17000, cost: 6800, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 10, name: 'Clásica Normal Mediana (2 Carnes)', category: 'Burger Clásicas', price: 22000, cost: 8800, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 11, name: 'Clásica Normal Grande (1 Carne)', category: 'Burger Clásicas', price: 22000, cost: 8800, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 12, name: 'Clásica Normal Grande (2 Carnes)', category: 'Burger Clásicas', price: 30000, cost: 12000, description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 13, name: 'Clásica Super Mediana', category: 'Burger Clásicas', price: 19000, cost: 7600, description: 'Incluye carne de res, queso, tocineta, ripio, huevos de codorniz, vegetales y salsas', stock: 100, status: 'active', image: null },
    { id: 14, name: 'Clásica Super Grande', category: 'Burger Clásicas', price: 25000, cost: 10000, description: 'Incluye carne de res, queso, tocineta, ripio, huevos de codorniz, vegetales y salsas', stock: 100, status: 'active', image: null },
    
    // COMBOS BURGER (12)
    { id: 15, name: 'Combo 1 Burger Clásica Normal', category: 'Combos Burger', price: 21000, cost: 8400, description: 'Incluye hamburguesas clásicas con carne jugosa, queso fundido, tocineta, ripio crujiente, vegetales frescos y salsas de la casa + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 16, name: 'Combo 2 Burger Clásica Normal', category: 'Combos Burger', price: 38000, cost: 15200, description: 'Incluye 2 hamburguesas clásicas + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 17, name: 'Combo 3 Burger Clásica Normal', category: 'Combos Burger', price: 57000, cost: 22800, description: 'Incluye 3 hamburguesas clásicas + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 18, name: 'Combo 4 Burger Clásica Normal', category: 'Combos Burger', price: 73000, cost: 29200, description: 'Incluye 4 hamburguesas clásicas + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 19, name: 'Combo 1 Burger Clásica Super', category: 'Combos Burger', price: 26000, cost: 10400, description: 'Incluye hamburguesas clásicas especiales con carne jugosa, queso fundido, tocineta, huevos de codorniz, ripio crujiente, vegetales frescos y salsas de la casa + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 20, name: 'Combo 2 Burger Clásica Super', category: 'Combos Burger', price: 46000, cost: 18400, description: 'Incluye 2 hamburguesas clásicas super + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 21, name: 'Combo 3 Burger Clásica Super', category: 'Combos Burger', price: 68000, cost: 27200, description: 'Incluye 3 hamburguesas clásicas super + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 22, name: 'Combo 4 Burger Clásica Super', category: 'Combos Burger', price: 87000, cost: 34800, description: 'Incluye 4 hamburguesas clásicas super + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 23, name: 'Combo 1 Burger Premium Papuda', category: 'Combos Burger', price: 27000, cost: 10800, description: 'Incluye hamburguesas premium Papuda con carne jugosa, queso fundido, tocineta, papas fritas dentro de la burger, vegetales frescos y salsas de la casa + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 24, name: 'Combo 2 Burger Premium Papuda', category: 'Combos Burger', price: 48000, cost: 19200, description: 'Incluye 2 hamburguesas premium papuda + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 25, name: 'Combo 3 Burger Premium Papuda', category: 'Combos Burger', price: 70000, cost: 28000, description: 'Incluye 3 hamburguesas premium papuda + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 26, name: 'Combo 4 Burger Premium Papuda', category: 'Combos Burger', price: 91000, cost: 36400, description: 'Incluye 4 hamburguesas premium papuda + papas + bebida', stock: 100, status: 'active', image: null },
    
    // COMBOS PERROS (4)
    { id: 27, name: 'Combo 1 Perro', category: 'Combos Perros', price: 17000, cost: 6800, description: 'Incluye: perro caliente con salchicha tipo ranchera, queso fundido, ripio crujiente y salsas venezolanas, acompañado de papas fritas y bebida', stock: 100, status: 'active', image: null },
    { id: 28, name: 'Combo 2 Perros', category: 'Combos Perros', price: 25000, cost: 10000, description: 'Incluye 2 perros calientes + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 29, name: 'Combo 3 Perros', category: 'Combos Perros', price: 38000, cost: 15200, description: 'Incluye 3 perros calientes + papas + bebida', stock: 100, status: 'active', image: null },
    { id: 30, name: 'Combo 4 Perros', category: 'Combos Perros', price: 49000, cost: 19600, description: 'Incluye 4 perros calientes + papas + bebida', stock: 100, status: 'active', image: null },
    
    // COMBOS EXPRESS (3)
    { id: 31, name: 'Burger Express', category: 'Combos Express', price: 16000, cost: 6400, description: 'Incluye 1 hamburguesa clásica normal pequeña con carne, queso fundido, tocineta, ripio, vegetales y salsas de la casa, acompañada de bebida', stock: 100, status: 'active', image: null },
    { id: 32, name: 'Salchi Express', category: 'Combos Express', price: 15000, cost: 6000, description: 'Incluye salchipapa clásica con papas a la francesa, salchicha, queso fundido y salsas venezolanas aparte, acompañada de bebida', stock: 100, status: 'active', image: null },
    { id: 33, name: 'Perro Express', category: 'Combos Express', price: 14000, cost: 5600, description: 'Incluye 1 perro caliente con salchicha tipo ranchera, queso fundido, ripio crujiente y salsas venezolanas, acompañado de bebida', stock: 100, status: 'active', image: null },
    
    // BEBIDAS (12)
    { id: 34, name: 'Postobón 250ml', category: 'Bebidas', price: 3500, cost: 1400, description: 'Bebida gaseosa Postobón 250ml', stock: 100, status: 'active', image: null },
    { id: 35, name: 'Postobón 400ml', category: 'Bebidas', price: 4500, cost: 1800, description: 'Bebida gaseosa Postobón 400ml', stock: 100, status: 'active', image: null },
    { id: 36, name: 'Postobón 1000ml', category: 'Bebidas', price: 7000, cost: 2800, description: 'Bebida gaseosa Postobón 1000ml', stock: 100, status: 'active', image: null },
    { id: 37, name: 'CocaCola 400ml', category: 'Bebidas', price: 5500, cost: 2200, description: 'Bebida gaseosa CocaCola 400ml', stock: 100, status: 'active', image: null },
    { id: 38, name: 'CocaCola 1500ml', category: 'Bebidas', price: 9000, cost: 3600, description: 'Bebida gaseosa CocaCola 1500ml', stock: 100, status: 'active', image: null },
    { id: 39, name: 'Hit 500ml', category: 'Bebidas', price: 5000, cost: 2000, description: 'Bebida gaseosa Hit 500ml', stock: 100, status: 'active', image: null },
    { id: 40, name: 'Hit 1000ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Bebida gaseosa Hit 1000ml', stock: 100, status: 'active', image: null },
    { id: 41, name: 'Agua 300ml', category: 'Bebidas', price: 2500, cost: 1000, description: 'Agua embotellada 300ml', stock: 100, status: 'active', image: null },
    { id: 42, name: 'Agua 600ml', category: 'Bebidas', price: 3500, cost: 1400, description: 'Agua embotellada 600ml', stock: 100, status: 'active', image: null },
    { id: 43, name: 'Agua Sabor 400ml', category: 'Bebidas', price: 5000, cost: 2000, description: 'Agua sabor 400ml', stock: 100, status: 'active', image: null },
    { id: 44, name: 'Malta Polar 355ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Bebida Malta Polar 355ml', stock: 100, status: 'active', image: null },
    { id: 45, name: 'Frescolita 355ml', category: 'Bebidas', price: 8000, cost: 3200, description: 'Bebida Frescolita 355ml', stock: 100, status: 'active', image: null },
    
    // ADICIONALES (11)
    { id: 46, name: 'Carne de Burger Pequeña', category: 'Adicionales', price: 6000, cost: 2400, description: 'Porción de carne de burger tamaño pequeño', stock: 100, status: 'active', image: null },
    { id: 47, name: 'Carne de Burger Mediana', category: 'Adicionales', price: 7000, cost: 2800, description: 'Porción de carne de burger tamaño mediano', stock: 100, status: 'active', image: null },
    { id: 48, name: 'Carne de Burger Grande', category: 'Adicionales', price: 8000, cost: 3200, description: 'Porción de carne de burger tamaño grande', stock: 100, status: 'active', image: null },
    { id: 49, name: 'Filete de Pollo Mediano', category: 'Adicionales', price: 7000, cost: 2800, description: 'Filete de pollo para hamburguesa', stock: 100, status: 'active', image: null },
    { id: 50, name: 'Chorizo de Cerdo (Porción)', category: 'Adicionales', price: 5000, cost: 2000, description: 'Chorizo de cerdo artesanal', stock: 100, status: 'active', image: null },
    { id: 51, name: 'Chuleta Ahumada', category: 'Adicionales', price: 9000, cost: 3600, description: 'Chuleta ahumada para hamburguesa', stock: 100, status: 'active', image: null },
    { id: 52, name: 'Salchicha Americana', category: 'Adicionales', price: 4000, cost: 1600, description: 'Salchicha americana para perros calientes', stock: 100, status: 'active', image: null },
    { id: 53, name: 'Tocineta Ahumada', category: 'Adicionales', price: 4000, cost: 1600, description: 'Tocineta ahumada crocante', stock: 100, status: 'active', image: null },
    { id: 54, name: 'Queso Tipo Mozarella', category: 'Adicionales', price: 3000, cost: 1200, description: 'Queso mozarella fundido', stock: 100, status: 'active', image: null },
    { id: 55, name: 'Huevo de Gallina', category: 'Adicionales', price: 2000, cost: 800, description: 'Huevo de gallina a la plancha', stock: 100, status: 'active', image: null },
    { id: 56, name: 'Huevos de Codorniz (5 und)', category: 'Adicionales', price: 4000, cost: 1600, description: 'Huevos de codorniz (5 unidades)', stock: 100, status: 'active', image: null },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Burger Premium', description: 'Hamburguesas premium con ingredientes especiales', color: '#EF4444', status: 'active' },
    { id: 2, name: 'Burger Clásicas', description: 'Hamburguesas clásicas en diferentes tamaños', color: '#F59E0B', status: 'active' },
    { id: 3, name: 'Combos Burger', description: 'Combos de hamburguesas con papas y bebida', color: '#10B981', status: 'active' },
    { id: 4, name: 'Combos Perros', description: 'Combos de perros calientes con papas y bebida', color: '#8B5CF6', status: 'active' },
    { id: 5, name: 'Combos Express', description: 'Combos rápidos e individuales', color: '#EC4899', status: 'active' },
    { id: 6, name: 'Bebidas', description: 'Gaseosas, jugos y agua', color: '#3B82F6', status: 'active' },
    { id: 7, name: 'Adicionales', description: 'Ingredientes extra para personalizar', color: '#6366F1', status: 'active' },
  ]);

  const [addons, setAddons] = useState([
    { id: 1, name: 'Queso Extra', price: 1.50, status: 'active' },
    { id: 2, name: 'Tocineta', price: 2.00, status: 'active' },
    { id: 3, name: 'Huevo', price: 1.00, status: 'active' },
  ]);

  // Funciones CRUD Productos
  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id) => products.find(p => p.id === id);

  // Funciones CRUD Categorías
  const addCategory = (category) => {
    const newCategory = { ...category, id: Date.now() };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, data) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Funciones CRUD Adicionales
  const addAddon = (addon) => {
    const newAddon = { ...addon, id: Date.now() };
    setAddons(prev => [...prev, newAddon]);
    return newAddon;
  };

  const updateAddon = (id, data) => {
    setAddons(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAddon = (id) => {
    setAddons(prev => prev.filter(a => a.id !== id));
  };

  // Obtener productos activos
  const getActiveProducts = () => products.filter(p => p.status === 'active');

  // Obtener productos por categoría
  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category && p.status === 'active');
  };

  // Obtener categorías activas
  const getActiveCategories = () => categories.filter(c => c.status === 'active');

  const value = {
    products,
    categories,
    addons,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addCategory,
    updateCategory,
    deleteCategory,
    addAddon,
    updateAddon,
    deleteAddon,
    getActiveProducts,
    getProductsByCategory,
    getActiveCategories,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductProvider');
  }
  return context;
};
