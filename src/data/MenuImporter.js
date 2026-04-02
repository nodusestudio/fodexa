/**
 * MenuImporter.js
 * Sistema de importación masiva de menú para el POS
 * Contiene todas las categorías y productos del restaurante
 */

export const menuData = {
  categories: [
    {
      name: 'Burger Premium',
      description: 'Hamburguesas premium con ingredientes especiales',
      color: '#EF4444',
      status: 'active',
    },
    {
      name: 'Burger Clásicas',
      description: 'Hamburguesas clásicas en diferentes tamaños',
      color: '#F59E0B',
      status: 'active',
    },
    {
      name: 'Combos Burger',
      description: 'Combos de hamburguesas con papas y bebida',
      color: '#10B981',
      status: 'active',
    },
    {
      name: 'Combos Perros',
      description: 'Combos de perros calientes con papas y bebida',
      color: '#8B5CF6',
      status: 'active',
    },
    {
      name: 'Combos Express',
      description: 'Combos rápidos e individuales',
      color: '#EC4899',
      status: 'active',
    },
    {
      name: 'Bebidas',
      description: 'Gaseosas, jugos y agua',
      color: '#3B82F6',
      status: 'active',
    },
    {
      name: 'Adicionales',
      description: 'Ingredientes extra para personalizar',
      color: '#6366F1',
      status: 'active',
    },
    {
      name: 'Cuponera',
      description: 'Cupones y opciones de combos por paquete',
      color: '#F97316',
      status: 'active',
    },
  ],

  products: [
    // BURGER PREMIUM (6 productos)
    {
      name: 'Cordillera',
      category: 'Burger Premium',
      price: 34000,
      description:
        'Carne jugosa, queso fundido, maduritos fritos, pepinillos dulces, lechuga fresca, exquisito topping de chuleta ahumada y salsas artesanales',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Ranchera',
      category: 'Burger Premium',
      price: 30000,
      description:
        'Carne jugosa, salchicha dorada, queso fundido, coronada con maíz dulce, platano maduro, ripio de papa, vegetales y salsas de la casa',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Plus',
      category: 'Burger Premium',
      price: 30000,
      description:
        'Carne jugosa, queso, topping de chorizo artesanal, ripio de papa, plátano maduro, huevos de codorniz, vegetales y salsas de la casa',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Triplete',
      category: 'Burger Premium',
      price: 29000,
      description:
        'La combinación perfecta de carne, pollo y chorizo bien dorados, con queso fundido, tocineta crocante, ripio crujiente, vegetales frescos y salsas irresistibles',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Caracas',
      category: 'Burger Premium',
      price: 26000,
      description:
        'Carne artesanal, chorizo jugoso y queso fundido, acompañados de tocineta crocante, huevo a la plancha, aguacate, vegetales y salsas tradicionales',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Papuda',
      category: 'Burger Premium',
      price: 20000,
      description:
        'Carne jugosa con queso fundido y tocineta crocante, cargada de papas a la francesa, plátano maduro dorado, con vegetales frescos y salsas de la casa',
      stock: 100,
      status: 'active',
    },

    // BURGER CLÁSICAS (8 productos)
    {
      name: 'Clásica Normal Pequeña (1 Carne)',
      category: 'Burger Clásicas',
      price: 14000,
      description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Normal Pequeña (2 Carnes)',
      category: 'Burger Clásicas',
      price: 18000,
      description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Normal Mediana (1 Carne)',
      category: 'Burger Clásicas',
      price: 17000,
      description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Normal Mediana (2 Carnes)',
      category: 'Burger Clásicas',
      price: 22000,
      description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Normal Grande (1 Carne)',
      category: 'Burger Clásicas',
      price: 22000,
      description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Normal Grande (2 Carnes)',
      category: 'Burger Clásicas',
      price: 30000,
      description: 'Incluye carne de res, queso, tocineta, ripio, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Super Mediana',
      category: 'Burger Clásicas',
      price: 19000,
      description:
        'Incluye carne de res, queso, tocineta, ripio, huevos de codorniz, vegetales y salsas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Clásica Super Grande',
      category: 'Burger Clásicas',
      price: 25000,
      description:
        'Incluye carne de res, queso, tocineta, ripio, huevos de codorniz, vegetales y salsas',
      stock: 100,
      status: 'active',
    },

    // COMBOS BURGER (12 productos)
    {
      name: 'Combo 1 Burger Clásica Normal',
      category: 'Combos Burger',
      price: 21000,
      description:
        'Incluye hamburguesas clásicas con carne jugosa, queso fundido, tocineta, ripio crujiente, vegetales frescos y salsas de la casa + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 2 Burger Clásica Normal',
      category: 'Combos Burger',
      price: 38000,
      description: 'Incluye 2 hamburguesas clásicas + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 3 Burger Clásica Normal',
      category: 'Combos Burger',
      price: 57000,
      description: 'Incluye 3 hamburguesas clásicas + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 4 Burger Clásica Normal',
      category: 'Combos Burger',
      price: 73000,
      description: 'Incluye 4 hamburguesas clásicas + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 1 Burger Clásica Super',
      category: 'Combos Burger',
      price: 26000,
      description:
        'Incluye hamburguesas clásicas especiales con carne jugosa, queso fundido, tocineta, huevos de codorniz, ripio crujiente, vegetales frescos y salsas de la casa + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 2 Burger Clásica Super',
      category: 'Combos Burger',
      price: 46000,
      description: 'Incluye 2 hamburguesas clásicas super + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 3 Burger Clásica Super',
      category: 'Combos Burger',
      price: 68000,
      description: 'Incluye 3 hamburguesas clásicas super + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 4 Burger Clásica Super',
      category: 'Combos Burger',
      price: 87000,
      description: 'Incluye 4 hamburguesas clásicas super + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 1 Burger Premium Papuda',
      category: 'Combos Burger',
      price: 27000,
      description:
        'Incluye hamburguesas premium Papuda con carne jugosa, queso fundido, tocineta, papas fritas dentro de la burger, vegetales frescos y salsas de la casa + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 2 Burger Premium Papuda',
      category: 'Combos Burger',
      price: 48000,
      description: 'Incluye 2 hamburguesas premium papuda + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 3 Burger Premium Papuda',
      category: 'Combos Burger',
      price: 70000,
      description: 'Incluye 3 hamburguesas premium papuda + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 4 Burger Premium Papuda',
      category: 'Combos Burger',
      price: 91000,
      description: 'Incluye 4 hamburguesas premium papuda + papas + bebida',
      stock: 100,
      status: 'active',
    },

    // COMBOS PERROS (4 productos)
    {
      name: 'Combo 1 Perro',
      category: 'Combos Perros',
      price: 17000,
      description:
        'Incluye: perro caliente con salchicha tipo ranchera, queso fundido, ripio crujiente y salsas venezolanas, acompañado de papas fritas y bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 2 Perros',
      category: 'Combos Perros',
      price: 25000,
      description: 'Incluye 2 perros calientes + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 3 Perros',
      category: 'Combos Perros',
      price: 38000,
      description: 'Incluye 3 perros calientes + papas + bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Combo 4 Perros',
      category: 'Combos Perros',
      price: 49000,
      description: 'Incluye 4 perros calientes + papas + bebida',
      stock: 100,
      status: 'active',
    },

    // COMBOS EXPRESS (3 productos)
    {
      name: 'Burger Express',
      category: 'Combos Express',
      price: 16000,
      description:
        'Incluye 1 hamburguesa clásica normal pequeña con carne, queso fundido, tocineta, ripio, vegetales y salsas de la casa, acompañada de bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Salchi Express',
      category: 'Combos Express',
      price: 15000,
      description:
        'Incluye salchipapa clásica con papas a la francesa, salchicha, queso fundido y salsas venezolanas aparte, acompañada de bebida',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Perro Express',
      category: 'Combos Express',
      price: 14000,
      description:
        'Incluye 1 perro caliente con salchicha tipo ranchera, queso fundido, ripio crujiente y salsas venezolanas, acompañado de bebida',
      stock: 100,
      status: 'active',
    },

    // BEBIDAS (12 productos)
    {
      name: 'Postobón 250ml',
      category: 'Bebidas',
      price: 3500,
      description: 'Bebida gaseosa Postobón 250ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Postobón 400ml',
      category: 'Bebidas',
      price: 4500,
      description: 'Bebida gaseosa Postobón 400ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Postobón 1000ml',
      category: 'Bebidas',
      price: 7000,
      description: 'Bebida gaseosa Postobón 1000ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CocaCola 400ml',
      category: 'Bebidas',
      price: 5500,
      description: 'Bebida gaseosa CocaCola 400ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CocaCola 1500ml',
      category: 'Bebidas',
      price: 9000,
      description: 'Bebida gaseosa CocaCola 1500ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Hit 500ml',
      category: 'Bebidas',
      price: 5000,
      description: 'Bebida gaseosa Hit 500ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Hit 1000ml',
      category: 'Bebidas',
      price: 8000,
      description: 'Bebida gaseosa Hit 1000ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Agua 300ml',
      category: 'Bebidas',
      price: 2500,
      description: 'Agua embotellada 300ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Agua 600ml',
      category: 'Bebidas',
      price: 3500,
      description: 'Agua embotellada 600ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Agua Sabor 400ml',
      category: 'Bebidas',
      price: 5000,
      description: 'Agua sabor 400ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Malta Polar 355ml',
      category: 'Bebidas',
      price: 8000,
      description: 'Bebida Malta Polar 355ml',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Frescolita 355ml',
      category: 'Bebidas',
      price: 8000,
      description: 'Bebida Frescolita 355ml',
      stock: 100,
      status: 'active',
    },

    // ADICIONALES (11 productos)
    {
      name: 'Carne de Burger Pequeña',
      category: 'Adicionales',
      price: 6000,
      description: 'Porción de carne de burger tamaño pequeño',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Carne de Burger Mediana',
      category: 'Adicionales',
      price: 7000,
      description: 'Porción de carne de burger tamaño mediano',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Carne de Burger Grande',
      category: 'Adicionales',
      price: 8000,
      description: 'Porción de carne de burger tamaño grande',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Filete de Pollo Mediano',
      category: 'Adicionales',
      price: 7000,
      description: 'Filete de pollo para hamburguesa',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Chorizo de Cerdo (Porción)',
      category: 'Adicionales',
      price: 5000,
      description: 'Chorizo de cerdo artesanal',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Chuleta Ahumada',
      category: 'Adicionales',
      price: 9000,
      description: 'Chuleta ahumada para hamburguesa',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Salchicha Americana',
      category: 'Adicionales',
      price: 4000,
      description: 'Salchicha americana para perros calientes',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Tocineta Ahumada',
      category: 'Adicionales',
      price: 4000,
      description: 'Tocineta ahumada crocante',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Queso Tipo Mozarella',
      category: 'Adicionales',
      price: 3000,
      description: 'Queso mozarella fundido',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Huevo de Gallina',
      category: 'Adicionales',
      price: 2000,
      description: 'Huevo de gallina a la plancha',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Huevos de Codorniz (5 und)',
      category: 'Adicionales',
      price: 4000,
      description: 'Huevos de codorniz (5 unidades)',
      stock: 100,
      status: 'active',
    },

    // CUPONERA (11 productos)
    {
      name: 'CUPON A - CARACAS',
      category: 'Cuponera',
      price: 33000,
      description: 'Cupón A - Caracas',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON A - CORDILLERA',
      category: 'Cuponera',
      price: 41000,
      description: 'Cupón A - Cordillera',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON A - PAPUDA',
      category: 'Cuponera',
      price: 27000,
      description: 'Cupón A - Papuda',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON A - PLUS',
      category: 'Cuponera',
      price: 37000,
      description: 'Cupón A - Plus',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON A - RANCHERA',
      category: 'Cuponera',
      price: 37000,
      description: 'Cupón A - Ranchera',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON A - TRUPLETE',
      category: 'Cuponera',
      price: 36000,
      description: 'Cupón A - Truplete',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON B - MIX',
      category: 'Cuponera',
      price: 36000,
      description: 'Cupón B - Mix',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON B - PLUS',
      category: 'Cuponera',
      price: 43000,
      description: 'Cupón B - Plus',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON B - RANCHERO',
      category: 'Cuponera',
      price: 41000,
      description: 'Cupón B - Ranchero',
      stock: 100,
      status: 'active',
    },
    {
      name: 'CUPON B - URBANO',
      category: 'Cuponera',
      price: 37000,
      description: 'Cupón B - Urbano',
      stock: 100,
      status: 'active',
    },
    {
      name: 'Cupon de bienvenida',
      category: 'Cuponera',
      price: 4500,
      description: 'Cupón de bienvenida',
      stock: 100,
      status: 'active',
    },
  ],
};

/**
 * Función para calcular el costo estimado basado en el precio
 * Utiliza un margen del 60% (costo = 40% del precio)
 */
export const calculateCost = (price) => {
  return Math.round(price * 0.4);
};

/**
 * Función helper para importar el menú
 */
export const importFullMenu = (onProgress) => {
  const summary = {
    categoriesCreated: 0,
    productsCreated: 0,
    startTime: Date.now(),
  };

  return {
    menuData,
    calculateCost,
    summary,
  };
};
