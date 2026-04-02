// Version control for FODEXA system
// Format: f-XXXX (starts at f-1001 and increments with each change)

export const APP_VERSION = 'f-1057';
export const LAST_UPDATE = new Date('2026-04-02').toLocaleDateString('es-CO');

export const getVersionInfo = () => ({
  version: APP_VERSION,
  lastUpdate: LAST_UPDATE,
  displayText: `ℹ️ actualización n ${APP_VERSION}`
});
