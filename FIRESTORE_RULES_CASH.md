# 🔐 Reglas de Firestore - Corrección para Caja y Todos los Datos

## ⚠️ EL PROBLEMA
El usuario no puede abrir caja porque las reglas de Firestore deniegan las escrituras en `/users/{uid}/cashSessions`

## ✅ SOLUCIÓN: Actualizar Reglas de Firestore

Ve a **Firebase Console** → Tu proyecto **fodexa-sistema-firebase** → **Firestore Database** → pestaña **Rules**

Reemplaza las reglas con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 🔐 Reglas para colección de usuarios
    match /users/{userId} {
      // Solo el usuario autenticado puede acceder su documento
      allow read, write: if request.auth.uid == userId;
      
      // 📋 SUBCOLECCIONES: Permitir todo (órdenes, caja, gastos, etc.)
      match /{document=**} {
        allow read: if request.auth.uid == userId;
        allow create: if request.auth.uid == userId;
        allow update: if request.auth.uid == userId;
        allow delete: if request.auth.uid == userId;
      }
    }
    
    // 🛡️ TODOS los otros documentos fuera de /users/{uid}: DENEGADO por defecto
    match /{document=**} {
      allow read: false;
      allow write: false;
    }
  }
}
```

## 📖 Pasos para Aplicar

1. **Abre Firebase Console**
   - https://console.firebase.google.com
   - Selecciona tu proyecto "fodexa-sistema-firebase"

2. **Ve a Firestore Rules**
   - Menú izquierdo → Cloud Firestore
   - Pestaña "Rules"

3. **Reemplaza las reglas**
   - Borra todo lo que hay
   - Copia el código de arriba
   - Click en "Publish"

4. **Confirma el deploy**
   - Firebase pedirá confirmación
   - Click en "Publish"
   - Espera el mensaje "Rules deployed successfully"

## ✅ Verificar que Funciona

Después de aplicar:
1. Recarga la app (F5)
2. Intenta abrir caja
3. Abre la consola (F12)
4. Veras logs como:
   ```
   ✅ Caja abierta y guardada en Firestore - ID: ...
   ```

Si ves "Error al abrir caja: Missing or insufficient permissions" → Las reglas aún no se actualizaron, espera 30 segundos y recarga.
