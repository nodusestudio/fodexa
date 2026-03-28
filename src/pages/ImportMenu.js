import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { menuData, calculateCost } from '../data/MenuImporter';
import { Package, CheckCircle, AlertCircle, Download, BookOpen } from 'lucide-react';

const ImportMenu = () => {
  const { addCategory, addProduct, categories, products } = useProducts();
  const [importStatus, setImportStatus] = useState('idle');
  const [importLog, setImportLog] = useState([]);
  const [importStats, setImportStats] = useState({
    categoriesCreated: 0,
    productsCreated: 0,
    categoriesSkipped: 0,
    productsSkipped: 0,
  });

  const handleImport = async () => {
    setImportStatus('importing');
    setImportLog([]);
    setImportStats({
      categoriesCreated: 0,
      productsCreated: 0,
      categoriesSkipped: 0,
      productsSkipped: 0,
    });

    const log = [];
    let stats = {
      categoriesCreated: 0,
      productsCreated: 0,
      categoriesSkipped: 0,
      productsSkipped: 0,
    };

    // Simular pequeño retraso para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Crear categorías
    for (const cat of menuData.categories) {
      const exists = categories.find((c) => c.name === cat.name);
      if (!exists) {
        addCategory(cat);
        log.push({
          type: 'success',
          message: `✅ Categoría creada: ${cat.name}`,
        });
        stats.categoriesCreated++;
      } else {
        log.push({
          type: 'info',
          message: `⚠️ Categoría ya existe: ${cat.name}`,
        });
        stats.categoriesSkipped++;
      }
      // Pequeño retraso para animación
      setImportLog([...log]);
      setImportStats({ ...stats });
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Crear productos
    for (const prod of menuData.products) {
      const exists = products.find((p) => p.name === prod.name);
      if (!exists) {
        addProduct({
          ...prod,
          cost: calculateCost(prod.price),
        });
        log.push({
          type: 'success',
          message: `✅ Producto creado: ${prod.name} - $${prod.price.toLocaleString('es-CO')}`,
        });
        stats.productsCreated++;
      } else {
        log.push({
          type: 'info',
          message: `⚠️ Producto ya existe: ${prod.name}`,
        });
        stats.productsSkipped++;
      }
      // Pequeño retraso para animación
      setImportLog([...log]);
      setImportStats({ ...stats });
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    setImportStatus('completed');
  };

  // Calcular estadísticas para el resumen
  const existingCategories = categories.filter((c) =>
    menuData.categories.some((mc) => mc.name === c.name)
  ).length;

  const existingProducts = products.filter((p) =>
    menuData.products.some((mp) => mp.name === p.name)
  ).length;

  const pendingCategories = menuData.categories.length - existingCategories;
  const pendingProducts = menuData.products.length - existingProducts;

  // Calcular ingresos potenciales
  const totalRevenue = menuData.products.reduce((sum, p) => sum + p.price, 0);
  const totalCost = menuData.products.reduce((sum, p) => sum + calculateCost(p.price), 0);
  const potentialProfit = totalRevenue - totalCost;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Package size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            Importar Menú Completo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Carga automáticamente todos los productos y categorías del menú del restaurante
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Resumen de Inventario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categorías */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Categorías
                </h3>
                <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {menuData.categories.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {existingCategories} existentes
                  </p>
                </div>
                {pendingCategories > 0 && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
                    +{pendingCategories}
                  </span>
                )}
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Productos
                </h3>
                <Package size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {menuData.products.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {existingProducts} existentes
                  </p>
                </div>
                {pendingProducts > 0 && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
                    +{pendingProducts}
                  </span>
                )}
              </div>
            </div>

            {/* Ingresos Potenciales */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Ingresos Totales
                </h3>
                <Download size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${totalRevenue.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Potencial de ventas
              </p>
            </div>

            {/* Ganancia Estimada */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Ganancia Est.
                </h3>
                <div className="text-green-600 dark:text-green-400">💰</div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${potentialProfit.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Margen: 60%
              </p>
            </div>
          </div>

          {/* Sección Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Botón de Importar */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  🚀 Comenzar Importación
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Este proceso creará automáticamente todas las categorías y productos del menú.
                  Los productos que ya existan no serán duplicados. Puedes ejecutar esta importación
                  múltiples veces sin problema.
                </p>

                {importStatus === 'idle' && (
                  <button
                    onClick={handleImport}
                    disabled={pendingCategories === 0 && pendingProducts === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Package size={24} />
                    {pendingCategories === 0 && pendingProducts === 0
                      ? 'Todo está up to date ✓'
                      : 'Iniciar Importación Ahora'}
                  </button>
                )}

                {importStatus === 'importing' && (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                      Importando productos...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Creadas: {importStats.categoriesCreated} categorías, {importStats.productsCreated}{' '}
                      productos
                    </p>
                  </div>
                )}

                {importStatus === 'completed' && (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-6">
                      <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full p-6">
                        <CheckCircle size={80} className="text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">
                      ¡Importación Completada!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Se han importado{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {importStats.categoriesCreated} categorías
                      </span>{' '}
                      y{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {importStats.productsCreated} productos
                      </span>
                    </p>
                    <button
                      onClick={() => window.location.href = '/articles/products'}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                    >
                      <Package size={20} />
                      Ver Todos los Productos
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Información */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                📋 Resumen de Menú
              </h3>

              <div className="space-y-4">
                {menuData.categories.map((cat, idx) => {
                  const count = menuData.products.filter((p) => p.category === cat.name).length;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Total de {menuData.categories.length} categorías
                  <br />
                  {menuData.products.length} productos
                </p>
              </div>
            </div>
          </div>

          {/* Log de Importación */}
          {importLog.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  📋 Registro de Importación
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto p-6 space-y-2">
                {importLog.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                      log.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
                        : 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20'
                    }`}
                  >
                    {log.type === 'success' ? (
                      <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-yellow-800 dark:text-yellow-200'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportMenu;
