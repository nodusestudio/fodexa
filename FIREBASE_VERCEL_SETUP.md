# 🚀 Guía de Configuración - Firebase + Vercel

## Requisitos Previos
- Cuenta de Firebase (Google Cloud)
- Cuenta de Vercel
- Repositorio de GitHub conectado a Vercel

---

## 1️⃣ Configuración de Firebase

### Pasos:
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a **Project Settings** → **Service Accounts**
4. Obtén tus credenciales:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

5. Guarda estas credenciales en tu archivo `.env.local` localmente:
```bash
REACT_APP_FIREBASE_API_KEY=tu_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id_aqui
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
REACT_APP_FIREBASE_APP_ID=tu_app_id_aqui
```

### Reglas de Firestore (Importante ⚠️):
Configura estas reglas en Firebase Console → Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo al usuario dueño
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 2️⃣ Configuración de Vercel

### Pasos:

1. **Conectar repositorio a Vercel:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Haz clic en "New Project"
   - Importa el repositorio desde GitHub

2. **Configurar Variables de Entorno:**
   - En Vercel, ve al proyecto
   - Haz clic en **Settings** → **Environment Variables**
   - Añade TODAS estas variables:
     ```
     REACT_APP_FIREBASE_API_KEY = [tu_api_key]
     REACT_APP_FIREBASE_AUTH_DOMAIN = [tu_auth_domain]
     REACT_APP_FIREBASE_PROJECT_ID = [tu_project_id]
     REACT_APP_FIREBASE_STORAGE_BUCKET = [tu_storage_bucket]
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID = [tu_messaging_sender_id]
     REACT_APP_FIREBASE_APP_ID = [tu_app_id]
     ```
   - Aplica para: **Production, Preview, Development**

3. **Configurar Deploy Automático:**
   - Ve a **Settings** → **Git**
   - Asegúrate de que "Deploy on Push" esté habilitado
   - Branch a desplegar: `main`

4. **Redeploy:**
   - Haz cualquier cambio y haz push a `main`
   - Vercel automáticamente desplegará la nueva versión
   - Ver estado en **Deployments**

---

## 3️⃣ Sincronización en Vivo

### Verificar que todo funciona:

#### Localmente (Desarrollo):
```bash
npm install
npm start
```
- Visita: http://localhost:3000
- Asegúrate de tener `.env.local` con tus credenciales

#### En Vercel (Producción):
- Después de hacer push, Vercel construye y despliega automáticamente
- Puedes ver logs en: **Deployments** → **Función** → **Logs**

#### Monitorear Firebase:
- Ve a [Firebase Console](https://console.firebase.google.com)
- Abre **Firestore Database**
- Verás todos los datos guardados en tiempo real

---

## 4️⃣ Problemas Comunes

### ❌ "REACT_APP_* variables are undefined"
**Solución:** Las variables de entorno no se pasaron a Vercel
- Agrega las variables en Vercel Dashboard
- Espera a que se redeploy automáticamente

### ❌ "Firebase permission denied"
**Solución:** Las reglas de Firestore están mal configuradas
- Revisa las reglas en Firebase Console
- Asegúrate de que permite al usuario autenticado leer/escribir en `users/{userId}/**`

### ❌ "Build failed on Vercel"
**Solución:** Revisa los logs en Vercel Dashboard
- Click en **Deployments**
- Busca el deployment fallido
- Abre **Logs** para ver el error específico

---

## 5️⃣ Checklist Final ✅

- [ ] Firebase Console accesible con credenciales
- [ ] `.env.local` en local tiene todas las variables (NO commits)
- [ ] Vercel Dashboard tiene todas las variables de entorno
- [ ] `npm start` funciona localmente
- [ ] Puedes crear/editar datos en Firestore desde la app local
- [ ] Cambios pusheados a `main` en GitHub
- [ ] Vercel automáticamente despliega nuevos cambios
- [ ] Aplicación en producción (vercel.app) funciona correctamente
- [ ] Datos se sincronizan en tiempo real con Firebase

---

## 📞 URLs Importantes

- **Firebase Console:** https://console.firebase.google.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub:** https://github.com/nodostuguio/fodexa
- **App en Producción:** https://[tu-proyecto].vercel.app

---

**¡Listo! Tu aplicación está sincronizada y desplegada en la nube ☁️**
