import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultSettings = {
  company: {
    name: '',
    address: '',
    phone: '',
    logo: ''
  },
  ticket: {
    format: '',
    showLogo: true
  },
  taxes: {
    iva: 0,
    otherTaxes: []
  },
  currency: {
    symbol: '$',
    code: 'MXN',
    format: '1,234.56'
  },
  language: 'es',
  appearance: {
    theme: 'light',
    darkLogo: ''
  },
  general: {
    initialTicketNumber: 1
  },
  delivery: {
    enabled: true,
    baseAmount: 0,
    presets: [30, 40, 50]
  }
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (section, key, value) => {
    setSettings(prev => {
      if (section && key) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        };
      } else if (section && !key) {
        return {
          ...prev,
          [section]: value
        };
      }
      return prev;
    });
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
