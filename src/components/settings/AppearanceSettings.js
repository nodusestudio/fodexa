import React, { useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Moon, Sun, Upload, X } from 'lucide-react';

const AppearanceSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { appearance } = settings;
  const fileInput = useRef();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings('appearance', 'darkLogo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateSettings('appearance', 'darkLogo', null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          Apariencia
        </h2>
        <div className="space-y-4">
          {/* Modo oscuro/claro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</label>
            <div className="flex gap-4">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${appearance.theme === 'light' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-gray-300 dark:border-gray-600'}`}
                onClick={() => updateSettings('appearance', 'theme', 'light')}
              >
                <Sun size={18} /> Claro
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${appearance.theme === 'dark' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-gray-300 dark:border-gray-600'}`}
                onClick={() => updateSettings('appearance', 'theme', 'dark')}
              >
                <Moon size={18} /> Oscuro
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${appearance.theme === 'auto' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-gray-300 dark:border-gray-600'}`}
                onClick={() => updateSettings('appearance', 'theme', 'auto')}
              >
                Auto
              </button>
            </div>
          </div>
          {/* Colores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color primario</label>
              <input
                type="color"
                value={appearance.primaryColor}
                onChange={e => updateSettings('appearance', 'primaryColor', e.target.value)}
                className="w-16 h-10 p-0 border-0 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color secundario</label>
              <input
                type="color"
                value={appearance.secondaryColor}
                onChange={e => updateSettings('appearance', 'secondaryColor', e.target.value)}
                className="w-16 h-10 p-0 border-0 bg-transparent"
              />
            </div>
          </div>
          {/* Logo modo oscuro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo para modo oscuro</label>
            <div className="flex items-center gap-4">
              {appearance.darkLogo ? (
                <div className="relative">
                  <img
                    src={appearance.darkLogo}
                    alt="Logo modo oscuro"
                    className="w-32 h-32 object-contain border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Subir Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    ref={fileInput}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
