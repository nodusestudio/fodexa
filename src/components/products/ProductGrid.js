import React from 'react';
import ProductCard from './ProductCard';


const ProductGrid = ({ products, onAddToCart, searchQuery, category }) => {
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {filteredProducts.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
