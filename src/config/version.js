// Version control for FODEXA system
// Format: f-XXXX (starts at f-1001 and increments with each change)

export const APP_VERSION = 'f-2031';
export const VERSION_NUMBER = '1.11';
export const FULL_VERSION = `f-2031 v1.11`;
export const LAST_UPDATE = new Date('2026-04-03').toLocaleDateString('es-CO');

export const getVersionInfo = () => ({
  version: APP_VERSION,
  versionNumber: VERSION_NUMBER,
  fullVersion: FULL_VERSION,
  lastUpdate: LAST_UPDATE,
  displayText: `${FULL_VERSION} - actualización ${APP_VERSION}`
});
