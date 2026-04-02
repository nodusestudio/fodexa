import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, Building2, Receipt, Percent, DollarSign, Languages, Palette, Sliders, Trash2 } from 'lucide-react';
import CompanySettings from '../components/settings/CompanySettings';
import TicketSettings from '../components/settings/TicketSettings';
import TaxSettings from '../components/settings/TaxSettings';
import CurrencySettings from '../components/settings/CurrencySettings';
import LanguageSettings from '../components/settings/LanguageSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import GeneralSettings from '../components/settings/GeneralSettings';
import DeliverySettings from '../components/settings/DeliverySettings';
import ResetDataSettings from '../components/settings/ResetDataSettings';

const Settings = () => {
  const { settings, resetSettings, exportSettings, importSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'ticket', label: 'Tickets', icon: Receipt },
    { id: 'taxes', label: 'Impuestos', icon: Percent },
    { id: 'currency', label: 'Moneda', icon: DollarSign },
    { id: 'delivery', label: 'Domicilios', icon: Sliders },
    { id: 'language', label: 'Idioma', icon: Languages },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'reset', label: 'Limpiar Datos', icon: Trash2 },
  ];

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importSettings(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <SettingsIcon size={24} className="sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
              Configuración
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personaliza tu sistema POS
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <label className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer font-medium">
              📥 Importar
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            <button
              onClick={exportSettings}
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              📤 Exportar
            </button>
            <button
              onClick={resetSettings}
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Restaurar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 overflow-x-auto">
        <div className="flex gap-1 sm:gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'company' && <CompanySettings />}
        {activeTab === 'ticket' && <TicketSettings />}
        {activeTab === 'taxes' && <TaxSettings />}
        {activeTab === 'currency' && <CurrencySettings />}
        {activeTab === 'delivery' && <DeliverySettings />}
        {activeTab === 'language' && <LanguageSettings />}
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'reset' && <ResetDataSettings />}
      </div>
    </div>
  );
};

export default Settings;
