// Version control for FODEXA system
// Format: f-XXXX (starts at f-1001 and increments with each change)

export const APP_VERSION = 'f-1005';
export const LAST_UPDATE = new Date('2026-03-31').toLocaleDateString('es-CO');

export const getVersionInfo = () => ({
  version: APP_VERSION,
  lastUpdate: LAST_UPDATE,
  displayText: `ℹ️ actualización n ${APP_VERSION}`
});
