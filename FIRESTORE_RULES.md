// 🔐 FIRESTORE SECURITY RULES - FODEXA
// Copiar esto en: Firebase Console → Firestore → Rules
// Reemplazar completamente las reglas existentes

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ================== REGLAS GLOBALES ==================
    
    // Permite que cualquier usuario autenticado acceda a sus propios datos
    match /users/{userId} {
      // El usuario puede leer/escribir su propio documento
      allow read, write: if request.auth.uid == userId;
      
      // ========== SUBCOLLECCIONES DEL USUARIO ==========
      
      // Colección: customers (Clientes)
      match /customers/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: orders (Órdenes)
      match /orders/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: products (Productos)
      match /products/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: tickets (Tickets)
      match /tickets/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: cashMovements (Movimientos de Caja)
      match /cashMovements/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: settings (Configuración)
      match /settings/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: delivery (Entregas)
      match /delivery/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Colección: reports (Reportes)
      match /reports/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // Cualquier otra subcollección futura
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // ========== OTRAS COLECCIONES PÚBLICAS ==========
    
    // Configuración global (opcional, solo lectura)
    match /config/{document=**} {
      allow read: if true;
      allow write: if false; // Solo Firebase Admin puede escribir
    }
  }
}

/* 
  NOTAS:
  
  1. Cada usuario solo puede acceder a sus propios datos bajo /users/{uid}/*
  2. Las reglas se aplican recursivamente con {document=**}
  3. request.auth.uid valida que el usuario está autenticado
  4. Cambiar "allow write: if false" por "allow write: if request.auth.uid == userId" 
     si quieres permitir ediciones
  
  PASOS PARA APLICAR:
  
  1. Ir a Firebase Console: https://console.firebase.google.com
  2. Seleccionar tu proyecto
  3. Ir a Firestore Database → Rules
  4. Copiar estas reglas completas
  5. Click en "Publish"
  6. Esperar confirmación
  
  ✅ Las reglas se aplican automáticamente a toda la base de datos
*/
