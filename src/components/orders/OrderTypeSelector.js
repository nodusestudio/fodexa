import React from 'react';
import { Table, ShoppingBag, Bike } from 'lucide-react';

const types = [
  {
    key: 'table',
    label: 'Mesa',
    desc: 'Servicio en mesa',
    icon: Table,
    bg: 'bg-blue-500 hover:bg-blue-600',
    ring: 'ring-4 ring-blue-300',
  },
  {
    key: 'takeout',
    label: 'Para Llevar',
    desc: 'Recoge en el local',
    icon: ShoppingBag,
    bg: 'bg-green-500 hover:bg-green-600',
    ring: 'ring-4 ring-green-300',
  },
  {
    key: 'delivery',
    label: 'Domicilio',
    desc: 'Entrega a domicilio',
    icon: Bike,
    bg: 'bg-orange-500 hover:bg-orange-600',
    ring: 'ring-4 ring-orange-300',
  },
];

function OrderTypeSelector({ selectedType, onSelectType }) {
  return (
    <div className="flex gap-4 mb-6">
      {types.map(({ key, label, desc, icon: Icon, bg, ring }) => (
        <button
          key={key}
          type="button"
          className={`flex-1 py-4 px-6 rounded-xl text-white font-semibold flex flex-col items-center gap-2 transition-all text-lg ${bg} ${selectedType === key ? ring : ''}`}
          onClick={() => onSelectType(key)}
        >
          <Icon className="w-8 h-8 mb-1" />
          <span>{label}</span>
          <span className="text-xs font-normal opacity-80">{desc}</span>
        </button>
      ))}
    </div>
  );
}

export default OrderTypeSelector;
