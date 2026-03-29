# GUÍA RÁPIDA: Configurar Firebase en Vercel

## 🚀 Pasos para habilitar Firebase en Vercel

### 1. Ve a Vercel Dashboard
```
https://vercel.com/dashboard
→ Selecciona tu proyecto "fodexa"
→ Settings (o Configuración) 
→ Environment Variables
```

### 2. Agrega las 6 variables de Firebase
Copia cada valor exactamente desde Firebase y pégalo en Vercel:

```
REACT_APP_FIREBASE_API_KEY          = AIzaSyDHb4L7vlj_NcYWqyskj55TCY4Ov982Ts0
REACT_APP_FIREBASE_AUTH_DOMAIN      = fodexa-sistema.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID       = fodexa-sistema
REACT_APP_FIREBASE_STORAGE_BUCKET   = fodexa-sistema.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 536417878313
REACT_APP_FIREBASE_APP_ID           = 1:536417878313:web:ee06eeb026d6a9cb4cf738
```

### 3. Establece el ámbito
Para cada variable, marca:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Guarda y Redeploimmediately

Vercel automáticamente redesplegará tu app con las nuevas variables.

---

## 🔒 Firestore Rules
Verifica que tus reglas en Firebase Console sean:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## ✅ Verificar que funciona

Después de agregar las variables:
1. Abre tu URL de Vercel (ej: https://fodexa.vercel.app)
2. Ve a la Consola (F12 → Console)
3. Deberías ver: `✅ Firebase inicializado correctamente`
4. Si hay error: `❌ Error inicializando Firebase` → Revisa que los valores sean exactos

---

## 🆘 Solución de Problemas

### Error: "Cannot read properties of undefined (reading 'toDate')"
→ Firebase no está inicializado → Revisa que las variables estén en Vercel

### Error: "Permission denied" en Firestore
→ Las Firestore Rules están demasiado restrictivas → Verifica las reglas arriba

### Error: "CORS blocked"
→ Tu API Key no está autorizada → Ve a Firebase Console:
  - Google Cloud → APIs & Services → Credentials
  - Verifica que el API Key está restringido a dominio de Vercel (ej: *.vercel.app)

---

## 📝 Localización vs Producción

- **Local (localhost):** Usa `.env` (regalo incluido)
- **Vercel (producción):** Usa variables en Vercel Dashboard
- **Vista previa en GitHub:** También usa Vercel Dashboard

¡Listo! Tu app está configurada para Firebase en Vercel.
