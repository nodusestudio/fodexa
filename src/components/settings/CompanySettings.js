import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Upload, X, Building2 } from 'lucide-react';

const CompanySettings = () => {
  const { settings, updateSettings } = useSettings();
  const company = settings.company;
  const logoPreview = company.logo;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings('company', 'logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateSettings('company', 'logo', null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
          Información de la Empresa
        </h2>

        <div className="space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo del Negocio
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo"
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
                  />
                </label>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              value={company.name || ''}
              onChange={e => updateSettings('company', 'name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Mi Restaurante"
            />
          </div>

          {/* NIT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NIT / RUT
            </label>
            <input
              type="text"
              value={company.nit || ''}
              onChange={e => updateSettings('company', 'nit', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 900.123.456-7"
            />
          </div>

          {/* Dirección y Teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={company.address || ''}
                onChange={e => updateSettings('company', 'address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Calle 123 #45-67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={company.phone || ''}
                onChange={e => updateSettings('company', 'phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="(601) 123-4567"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={company.email || ''}
              onChange={e => updateSettings('company', 'email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="info@mirestaurante.com"
            />
          </div>

          {/* Pie de página */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje de Agradecimiento
            </label>
            <textarea
              rows="2"
              value={company.footer || ''}
              onChange={e => updateSettings('company', 'footer', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="¡Gracias por tu compra!"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
