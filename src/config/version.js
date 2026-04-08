// Version control for FODEXA system
// Format: f-XXXX (starts at f-1001 and increments with each change)

export const APP_VERSION = 'f-5006';
export const VERSION_NUMBER = '7.3';
export const FULL_VERSION = `f-5006 v7.3`;
export const LAST_UPDATE = new Date().toLocaleDateString('es-CO');

export const getVersionInfo = () => ({
  version: APP_VERSION,
  versionNumber: VERSION_NUMBER,
  fullVersion: FULL_VERSION,
  lastUpdate: LAST_UPDATE,
  displayText: `${FULL_VERSION} - actualización ${APP_VERSION}`
});
