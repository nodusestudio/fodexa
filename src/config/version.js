// Version control for FODEXA system
// Format: f-XXXX (starts at f-1001 and increments with each change)

export const APP_VERSION = 'f-9000';
export const VERSION_NUMBER = '9.0.0';
export const FULL_VERSION = `f-9000 v9.0.0`;
export const LAST_UPDATE = new Date('2024-12-19').toLocaleDateString('es-CO');

export const getVersionInfo = () => ({
  version: APP_VERSION,
  versionNumber: VERSION_NUMBER,
  fullVersion: FULL_VERSION,
  lastUpdate: LAST_UPDATE,
  displayText: `${FULL_VERSION} - actualización ${APP_VERSION}`
});
