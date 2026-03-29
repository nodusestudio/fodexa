import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validar que las variables de entorno estén configuradas
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missingVars.length > 0) {
  console.warn(
    '⚠️ FIREBASE CONFIG ERROR: Las siguientes variables de entorno no están configuradas:',
    missingVars,
    '\nVerifica que estén en .env (desarrollo) o en Vercel Dashboard (producción)'
  );
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

let app, auth, db, storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication
  auth = getAuth(app);

  // Initialize Cloud Firestore
  db = getFirestore(app);

  // Initialize Cloud Storage
  storage = getStorage(app);

  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
  console.error('Verifica que todas las variables de entorno estén configuradas correctamente');
}

export { auth, db, storage };
export default app;

