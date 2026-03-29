import React, { useState } from 'react';

const BebidaSelectorCombo = ({ product, onConfirm, onCancel }) => {
  // Determinar cuántas bebidas llevar según el combo
  const isComboExpress = product.name.includes('Combo Express');
  const isFamiliar = product.name.includes('Familiar');
  const isCasaTemporada = product.name.includes('Combo de la Casa');
  const isEmparejado = product.name.includes('Combo Emparejado');
  const isCombo1or2 = product.name.includes('Combo 1') || product.name.includes('Combo 2');
  
  let numBebidas, tamañoBebida;
  
  if (isCasaTemporada) {
    numBebidas = 1; // Combo de la Casa lleva 1 bebida
    tamañoBebida = '1000ml'; // De 1000ml (litro)
  } else if (isEmparejado) {
    numBebidas = 2; // Combo Emparejado lleva 2 bebidas
    tamañoBebida = '250ml'; // De 250ml c/u
  } else if (isFamiliar) {
    numBebidas = 1; // Combos Familiares llevan 1 bebida
    tamañoBebida = '1000ml'; // De 1000ml (litro)
  } else if (isComboExpress) {
    numBebidas = 1; // Combos Express llevan 1 bebida
    tamañoBebida = '250ml'; // De 250ml
  } else if (isCombo1or2) {
    numBebidas = 2; // Combos 1-2 llevan 2 bebidas
    tamañoBebida = '250ml'; // De 250ml
  } else {
    numBebidas = 1; // Combos 3-4 llevan 1 bebida
    tamañoBebida = '1000ml'; // De 1000ml
  }

  const bebidaSabores = [
    { name: 'Pepsi Original', category: 'bebidas-combo' },
    { name: 'Pepsi 0', category: 'bebidas-combo' },
    { name: 'Naranja', category: 'bebidas-combo' },
    { name: 'Manzana', category: 'bebidas-combo' },
    { name: 'Colombiana', category: 'bebidas-combo' },
    { name: 'Uva', category: 'bebidas-combo' },
    { name: 'Toronja', category: 'bebidas-combo' },
  ];

  const [selectedBebidas, setSelectedBebidas] = useState(
    Array(numBebidas).fill('')
  );

  const handleBebidaSelect = (index, bebida) => {
    const newSelectedBebidas = [...selectedBebidas];
    newSelectedBebidas[index] = bebida;
    setSelectedBebidas(newSelectedBebidas);
  };

  const allBebidasSelected = selectedBebidas.every((b) => b !== '');

  const handleConfirm = () => {
    if (allBebidasSelected) {
      onConfirm({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
        bebidas: selectedBebidas.map((bebida) => ({
          name: bebida,
          tamano: tamañoBebida,
        })),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Selecciona sabor de bebida
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {product.name} incluye {numBebidas} bebida{numBebidas === 2 ? 's' : ''} de {tamañoBebida}
        </p>

        <div className="space-y-4 mb-6">
          {selectedBebidas.map((_, index) => (
            <div key={index}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {numBebidas === 1 ? 'Bebida' : `Bebida ${index + 1}`}
              </label>
              <select
                value={selectedBebidas[index]}
                onChange={(e) => handleBebidaSelect(index, e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Elige un sabor</option>
                {bebidaSabores.map((bebida) => (
                  <option key={bebida.name} value={bebida.name}>
                    {bebida.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allBebidasSelected}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
              allBebidasSelected
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BebidaSelectorCombo;
