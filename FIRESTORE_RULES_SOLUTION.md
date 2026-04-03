# 🔐 Reglas de Firestore - Solución para Órdenes No Guardándose

## ⚠️ EL PROBLEMA

Tus órdenes se crean con **IDs locales** (local_XXXX) en lugar de IDs reales de Firestore. Esto significa que `addDoc()` está fallando.

**Causa más probable: Las reglas de seguridad de Firestore están rechazando las escrituras.**

---

## ✅ SOLUCIÓN: Actualizar Reglas de Firestore

Ve a **Firebase Console** → Tu proyecto → **Firestore Database** → pestaña **Rules**

Reemplaza las reglas con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 🔐 Reglas para colección de usuarios
    match /users/{userId} {
      // Solo el usuario autenticado puede leer/escribir su documento
      allow read, write: if request.auth.uid == userId;
      
      // 📋 Reglas para subcolección de órdenes
      match /orders/{orderId} {
        // ✅ LEER: El dueño puede leer sus órdenes
        allow read: if request.auth.uid == userId;
        
        // ✅ CREAR: El dueño puede crear nuevas órdenes
        allow create: if request.auth.uid == userId
          && request.resource.data.userId == userId
          && request.resource.data.status in ['pending', 'waiting', 'completed']
          && request.resource.data.type in ['table', 'takeout', 'delivery'];
        
        // ✅ ACTUALIZAR: El dueño puede actualizar sus órdenes
        allow update: if request.auth.uid == userId
          && request.resource.data.userId == userId;
        
        // ✅ ELIMINAR: El dueño puede eliminar sus órdenes
        allow delete: if request.auth.uid == userId;
      }
    }
    
    // 🛡️ TODOS los otros documentos: DENEGADO por defecto
    match /{document=**} {
      allow read, write: false;
    }
  }
}
```

---

## 📖 Pasos Detallados

### 1️⃣ Ir a Firebase Console
- Abre [console.firebase.google.com](https://console.firebase.google.com)
- Selecciona tu proyecto (fodexa-sistema-firebase)

### 2️⃣ Ir a Firestore Rules
- En el menú izquierdo → **Cloud Firestore**
- Haz click en la pestaña **Rules**

### 3️⃣ Copiar y Pegar las Reglas
- Borra todo lo que hay ahora
- Copia el código de arriba
- Haz click en **Publish**

### 4️⃣ Confirmar
- Firebase te pedirá confirmación
- Haz click en **Publish**
- Espera a que diga "Rules deployed successfully"

---

## 🔍 Verifica que Funciona

Ahora vuelve a tu app y:
1. **Crea una nueva orden**
2. **Abre la consola (F12)**
3. Busca logs con `[CREAR]`

**Deberías ver:**
```
🔥 [CREAR] Guardando en Firestore...
✅ [CREAR] Orden en Firestore: [ID_REAL_FIREBASE]
```

**En lugar de:**
```
❌ [CREAR] Firestore falló: permission-denied
```

---

## ❌ Errores Comunes y Soluciones

### Error: `permission-denied`
**Causa**: Las reglas de Firestore no permiten escribir
**Solución**: Asegúrate de usar las reglas arriba

### Error: `invalid-argument`
**Causa**: El documento tiene un campo que no cumple las validaciones
**Solución**: Verifica que `status` y `type` sean válidos

### Error: `unauthenticated`
**Causa**: El usuario no está autenticado
**Solución**: Asegúrate de que el usuario está logueado con Firebase Auth

---

## 🧪 Test de Permisos (Opcional)

Firebase Console tiene un "Rules Simulator" para probar las reglas sin tocar la app.

Pasos:
1. En Firebase Console → Cloud Firestore → Rules
2. Click en botón **Rules Simulator** (si no lo ves, usa el ícono de reglas)
3. Selecciona:
   - **Operation**: `create`
   - **Document path**: `users/{TU_UID}/orders/test-order-123`
   - **Authentication state**: Autenticado con tu UID
   - Click **Run**

Debería decir "Simulated success"

---

## 📋 Campos Requeridos para `create`

Cuando creas una orden, DEBE tener estos campos:

```javascript
{
  userId: "uid_del_usuario",        // ✅ REQUERIDO
  status: "pending",                // ✅ REQUERIDO (pending|waiting|completed)
  type: "table",                    // ✅ REQUERIDO (table|takeout|delivery)
  items: [...],
  total: 1500,
  timestamp: Date.now(),
  // ... otros campos opcionales
}
```

---

## 🔒 Explicación de las Reglas

| Regla | Significa |
|-------|-----------|
| `allow read` | Los usuarios pueden ver sus propias órdenes |
| `allow create` | Los usuarios pueden crear nuevas órdenes |
| `allow update` | Los usuarios pueden actualizar sus órdenes |
| `allow delete` | Los usuarios pueden borrar sus órdenes |
| `request.auth.uid == userId` | Solo si el UID del usuario coincide |
| `match /users/{userId}/orders/{orderId}` | Aplica a todas las órdenes de cada usuario |

---

## ✨ Después de Actualizar las Reglas

Una vez que publiques las nuevas reglas:

1. **Las órdenes se crearán con IDs reales de Firestore** (no locales)
2. **Se sincronizarán automáticamente** en tiempo real
3. **El panel de debug mostrará 0 órdenes locales**
4. **Al recargar, las órdenes se mantendrán**

---

## 🚨 Si Aún No Funciona

Después de actualizar las reglas:
1. **Limpia el cache del navegador** (Ctrl+Shift+Del)
2. **Recarga la app** (Ctrl+F5)
3. **Abre la consola** (F12)
4. **Crea una nueva orden**
5. Copia el error exacto que ves y describe el código de error de Firebase

---
