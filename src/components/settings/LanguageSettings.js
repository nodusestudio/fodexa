import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const LanguageSettings = () => {
  const { settings, updateSettings } = useSettings();
  const language = settings.language;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          Configuración de Idioma
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma de la aplicación</label>
            <select
              value={language}
              onChange={e => updateSettings('language', null, e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
              <option value="de">Alemán</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
