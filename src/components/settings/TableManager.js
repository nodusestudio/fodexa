import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

const TableManager = () => {
  const { tablesData, updateTableStatus } = useOrder();
  const [tables, setTables] = useState(tablesData || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ number: '', capacity: 2, zone: 'Principal' });

  const zones = ['Principal', 'Barra', 'Terraza', 'VIP', 'Otro'];

  const handleAddTable = () => {
    if (!formData.number.trim()) {
      alert('⚠️ Nombre de mesa requerido');
      return;
    }

    if (editingId) {
      // Editar mesa existente
      setTables(tables.map(t => 
        t.id === editingId 
          ? { ...t, ...formData }
          : t
      ));
      setEditingId(null);
    } else {
      // Crear nueva mesa
      const newTable = {
        id: Math.max(...tables.map(t => t.id), 0) + 1,
        ...formData,
        status: 'available'
      };
      setTables([...tables, newTable]);
    }

    setFormData({ number: '', capacity: 2, zone: 'Principal' });
    setShowForm(false);
  };

  const handleDeleteTable = (id) => {
    if (window.confirm(`¿Eliminar mesa ${tables.find(t => t.id === id)?.number}?`)) {
      setTables(tables.filter(t => t.id !== id));
    }
  };

  const handleEditTable = (table) => {
    setFormData({ number: table.number, capacity: table.capacity, zone: table.zone });
    setEditingId(table.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ number: '', capacity: 2, zone: 'Principal' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">🪑 Gestión de Mesas</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} /> Nueva Mesa
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📝 Nombre/Número
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="M1, M2, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                👥 Capacidad
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📍 Zona
              </label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition flex items-center gap-2"
            >
              <X size={18} /> Cancelar
            </button>
            <button
              onClick={handleAddTable}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              {editingId ? '💾 Actualizar' : '➕ Agregar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {tables.map(table => (
          <div
            key={table.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start justify-between hover:shadow-md transition"
          >
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900 dark:text-white">{table.number}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                👥 Capacidad: {table.capacity}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                📍 {table.zone}
              </div>
              <div className={`text-xs font-semibold mt-2 inline-block px-2 py-1 rounded ${
                table.status === 'available' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {table.status === 'available' ? '✓ Disponible' : '✗ Ocupada'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditTable(table)}
                className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 rounded transition"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteTable(table.id)}
                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded transition"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          📭 No hay mesas. Crea una primera mesa.
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 Total de mesas: <strong>{tables.length}</strong>
        </p>
      </div>
    </div>
  );
};

export default TableManager;
