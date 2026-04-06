# 🔐 SOLUCIONAR ERROR DE PERMISOS EN FIRESTORE

## ❌ El Problema

```
Error al guardar cliente: Missing or insufficient permissions
```

Esto significa que **las reglas de Firestore NO permiten que los usuarios escriban en sus datos**.

---

## ✅ La Solución

### **PASO 1: Ir a Firebase Console**

1. Abre: https://console.firebase.google.com
2. Selecciona tu proyecto **fodexa**
3. Click en **Firestore Database** (lado izquierdo)

---

### **PASO 2: Acceder a Rules**

```
Firestore Database → Tab "Rules" (arriba)
```

Verás algo como esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  ← ESTO BLOQUEA TODO
    }
  }
}
```

---

### **PASO 3: Copiar las Reglas Correctas**

**Copia TODO esto y reemplaza lo que dice en Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Cada usuario accede solo a sus datos
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Todas las subcollecciones del usuario
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Colecciones públicas (solo lectura)
    match /config/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

### **PASO 4: Publicar**

```
Click en "Publish" (botón azul arriba a la derecha)
```

Espera a que diga ✅ **Rules have been updated**

---

## 🧪 Verificar que Funcionó

Después de publicar:

1. Recarga el navegador (F5)
2. Ve a **Clientes** o **Configuración**
3. Intenta **crear un cliente**
4. Debería funcionar sin errores

---

## 📋 Explicación de las Reglas

```javascript
match /users/{userId} {
  // ✅ Allow: El usuario accede sus propios datos
  // ❌ Block: Otro usuario intenta acceder (blocked)
  allow read, write: if request.auth.uid == userId;
}

match /{document=**} {
  // Esto permite CUALQUIER subcollección bajo /users/{uid}/*
  // Ejemplo: /users/abc123/customers/* ✅
  //          /users/abc123/orders/*     ✅
  //          /users/xyz789/customers/*  ❌ (uid diferente)
  allow read, write: if request.auth.uid == userId;
}
```

---

## 🚀 Después de Arreglado

El flujo completo funcionará:

```
Usuario crea cliente en interfaz
         ↓
CustomerContext.addCustomer() se ejecuta
         ↓
Firebase verifica: ¿request.auth.uid == userId? ✅
         ↓
Cliente se guarda en Firestore
         ↓
UI se actualiza en tiempo real
```

---

## ⚠️ Si Aún No Funciona

Si después de publicar las reglas sigue el error:

### **Opción 1: Verificar autenticación**
```
Abre DevTools (F12)
Ve a Console
Busca si hay errores sobre "auth" o "user"
```

### **Opción 2: Usar las Reglas de Desarrollo (TEMPORAL)**
```javascript
// ⚠️ SOLO PARA DESARROLLO - MUY INSEGURO
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if request.auth != null;
  }
}
```

✅ Esto permite que **cualquier usuario autenticado** escriba en cualquier lugar (temporal)

Después de verificar que funciona, cambiar a las reglas seguras.

---

## 📝 Checklist Final

- [ ] Fui a Firebase Console
- [ ] Copié las reglas correctas
- [ ] Hice click en "Publish"
- [ ] Recargué el navegador
- [ ] Intenté crear un cliente
- [ ] ✅ Funcionó sin errores

---

## 🆘 Soporte

Si necesitas ayuda:

1. **Verifica el UID del usuario:**
   ```
   DevTools → Console
   Busca: "user.uid"
   ```

2. **Checa los logs de Firestore:**
   ```
   Firebase Console → Firestore → Logs
   ```

3. **Compía el error completo y comparte**

---
