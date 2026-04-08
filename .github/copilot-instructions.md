---
name: FODEXA Workspace
description: "React+Firebase POS system. Use when: adding features, fixing bugs, mobile optimization, Firebase integration, authentication, order management, reports, cash handling."
---

# FODEXA POS — Workspace Instructions

## Project Overview

**FODEXA** is a full-featured Point of Sale (POS) system for restaurant/food service management:
- **Order management**: Table, delivery, and takeout orders
- **Inventory**: Products, categories, and add-ons with real-time stock tracking
- **Cash management**: Daily cash opening/closing, expenses, bank reconciliation
- **Customer CRM**: Customer profiles, delivery addresses, order history
- **Reporting**: Sales metrics, payment methods, delivery costs, daily ledgers
- **Team features**: Tickets for kitchen, multi-user support with user-scoped Firestore data
- **Mobile-first UI**: Fully responsive design tested on iOS/Android, PWA-ready

**Version**: 44.00 | **Status**: Production-ready locally, deployed to Vercel

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project configured with `.env.local` (see [FIREBASE_SETUP.md](../FIREBASE_SETUP.md))
- Optional: Vercel account for deployment to staging/production

### Run Locally
```bash
npm install                # First time only
npm start                  # Starts on http://localhost:3000 (or 3001 if 3000 in use)
npm build                  # Production build → build/ folder
npm test                   # Run all tests (minimal test suite currently)
```

### Demo Mode
If `.env.local` is missing or Firebase fails:
1. App falls back to **mock data** auto-loaded from `src/data/mockFirebaseData.js`
2. No authentication required — AuthContext returns demo user
3. All features work with local state instead of Firestore
4. Use DataSeeder button (⚙️ bottom-right corner) to seed/clear test data

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`
- Quick setup: Sign up → Click ⚙️ → Load Test Data → Start using

---

## Architecture & Key Patterns

### Context Hierarchy (10 Providers)
Cascading providers in [src/App.js](../src/App.js):
```
AuthProvider (top — Firebase Auth state)
├─ SettingsProvider (app theme, defaults)
├─ CashProvider (daily cash session, expenses)
├─ TicketProvider (kitchen tickets)
├─ ProductProvider (products, categories, addons from Firestore)
├─ CartProvider (session cart with useReducer)
├─ OrderProvider (all orders, real-time listeners)
├─ ReportProvider (aggregated metrics & cache)
├─ CustomerProvider (customers, delivery addresses)
└─ ThemeProvider (dark/light mode)
```

**Key rule**: All data queries filtered by `userId` for multi-tenant isolation.

### State Management
- **Local React state** (`useState`, `useReducer`): Cart items, UI toggles, form inputs
- **Firestore real-time** (`onSnapshot` listeners): Products, Orders, Customers, Cash Sessions
- **Mock fallback**: If Firestore unavailable, auto-load from `mockFirebaseData.js`
- **Unsubscribe cleanup**: All listeners cleaned up in `useEffect` cleanup functions

### Firestore Collections (per user)
```
/products/{docId}          Products with stock, price, cost, image
/categories/{docId}        Category groupings with colors
/addons/{docId}            Optional add-ons (cheese, bacon, sauces)
/orders/{docId}            Orders with items, status, totals, timestamps
/customers/{docId}         Customer profiles (name, phone, addresses, defaults)
/cashSessions/{docId}      Daily cash sessions (open/close, difference, payments)
/expenses/{docId}          Daily expenses (supplies, utilities, maintenance)
/tickets/{docId}           Kitchen tickets for orders
```

All use `userId` field for partitioning.

### Routing with Authentication
- **Public route**: `/login` (sign up / login form)
- **Protected routes**: Everything else wrapped in `ProtectedRoute` HOC
  - Redirects to `/login` if no authenticated user
  - Shows loading spinner while checking auth
  - See [src/components/ProtectedRoute.js](../src/components/ProtectedRoute.js)

### Component Organization
```
src/
  ├─ pages/               Full-page components (POS.js, Dashboard.js, Customers.js, etc.)
  ├─ components/
  │  ├─ common/           Reusable UI (Button, Card, Toast, DataSeeder, etc.)
  │  ├─ articles/         Product/category/addon CRUD forms
  │  ├─ cart/             Cart UI, add-on selector, combo editor
  │  ├─ cash/             Cash opening, closing, expenses
  │  ├─ customers/        Customer list, detail, forms
  │  ├─ dashboard/        Metrics, charts, recent orders
  │  ├─ deliveries/       Delivery tracking & analytics
  │  ├─ layout/           Layout wrapper, sidebar, header
  │  ├─ orders/           Order status, history, details
  │  ├─ payments/         Payment method selection
  │  ├─ products/         Product grid, search, filters
  │  ├─ settings/         App settings, configuration
  │  └─ tickets/          Kitchen tickets display
  ├─ context/             10 context providers
  ├─ config/              Firebase init, app version
  ├─ services/            Firebase seed service
  ├─ hooks/               Custom hooks (useLocalStorage, useSeedData)
  ├─ data/                Mock data, CSV importer
  ├─ utils/               Helpers for formatting, delivery calculations
  └─ App.js               Router & provider hierarchy
```

---

## Mobile Responsiveness Standards

**All new UI must be mobile-first and use Tailwind breakpoints:**

### Breakpoints
- **Default**: Mobile (320-640px) — applies to all devices by default
- **sm** (640px+): Small tablets
- **md** (768px+): Tablets & small laptops
- **lg** (1024px+): Desktop

### Responsive Spacing Pattern
```jsx
// DON'T: Fixed width
<div className="w-96 p-8">

// DO: Responsive
<div className="w-full md:w-96 p-3 sm:p-4 md:p-8">
```

### Common Responsive Classes
- **Padding**: `p-3 sm:p-4 md:p-6`
- **Text size**: `text-sm sm:text-base md:text-lg`
- **Margin**: `mb-2 sm:mb-4 md:mb-6`
- **Grid cols**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`
- **Flex direction**: `flex-col md:flex-row`
- **Width**: `w-full md:w-96`
- **Hide on small**: `hidden sm:block` or `md:hidden` (show only on mobile)

### Mobile-First Components
- **Header**: Compact text, small icons, hamburger menu on mobile
- **Sidebar**: Hidden on mobile (`md:hidden`, overlay on small screens)
- **Cards**: `p-3 sm:p-4`, stacked content
- **Buttons**: Touch targets ≥44px, responsive font size
- **Forms**: Full-width inputs, `space-y-2 sm:space-y-4` between fields
- **Tables**: Horizontal scroll or reorganize as cards on mobile

See [/memories/repo/responsive-updates.md](/memories/repo/responsive-updates.md) for detailed mobile optimization history.

---

## Firebase & Environment Setup

### Environment Variables (.env.local)
```env
REACT_APP_FIREBASE_API_KEY=<key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<domain>
REACT_APP_FIREBASE_PROJECT_ID=fodexa-sistema
REACT_APP_FIREBASE_STORAGE_BUCKET=<bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<id>
REACT_APP_FIREBASE_APP_ID=<app-id>
```

Loaded by [src/config/firebase.js](../src/config/firebase.js) using `initializeApp(firebaseConfig)`.

### Common Firebase Tasks

**Real-time listener pattern** (e.g., in ProductContext):
```javascript
useEffect(() => {
  if (!user?.uid) return;
  const unsubscribe = onSnapshot(
    query(collection(db, 'products'), where('userId', '==', user.uid)),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    },
    (error) => console.error('Firestore listener error:', error)
  );
  return () => unsubscribe(); // Cleanup
}, [user?.uid, db]);
```

**Async CRUD pattern** (e.g., in OrderContext):
```javascript
const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error('Create order failed:', error);
    throw error;
  }
};
```

---

## Common Development Workflows

### Adding a New Order Type or Feature
1. **Feature spec**: Update relevant context (`OrderContext`, `ProductContext`, etc.)
2. **Firestore collection**: Add fields to order docs if needed
3. **UI component**: 
   - Create in `src/components/<feature>/`
   - Make responsive (`p-3 sm:p-4 md:p-6` pattern)
   - Test on mobile (DevTools → Toggle Device Toolbar)
4. **Integration**: Wire up in page component (e.g., `src/pages/POS.js`)
5. **Mock data**: Add to `src/data/mockFirebaseData.js` for demo mode
6. **Testing**: Use DataSeeder (⚙️) to load test data and verify

### Debugging Mobile Issues
1. **Device Toolbar**: Chrome DevTools → Ctrl+Shift+M → select device
2. **Responsive**: Test at 320px (mobile), 640px (tablet), 1024px (desktop)
3. **Touch**: DevTools → More Tools → Sensors → Touch enabled
4. **Safe area**: For notch devices, test with viewport-fit=cover (already in [public/index.html](../public/index.html))

### Firestore Rules & Permissions
See [FIRESTORE_RULES.md](../FIRESTORE_RULES.md) for current rules. Key principle:
- Users can only read/write their own (`userId == request.auth.uid`) data
- Multi-tenant isolation enforced at database level

### Deployment
- **Dev/Testing**: `npm start` locally
- **Staging**: Push to `main` branch → Vercel auto-deploys
- **Production**: Merge PR to `main`, Vercel deploys to live domain
- **Build**: `npm build` creates optimized bundle in `build/` folder

---

## Debugging & Diagnostic Tools

### Built-in Tools
- **DataSeeder** (⚙️ button, bottom-right): Load/clear mock data programmatically
- **Debug Order Status**: In components/common/ for order lifecycle debugging
- **Console emoji markers**: 🔍 (search), ✅ (success), ❌ (error), 🔄 (update)
- **Firestore Console**: firebase.google.com → project → data → inspect collections

### Common Issues
- **"Orders keep reappearing"**: Check DIAGNOSTICO_v1.12.md for listener-related issues
- **Mobile layout broken**: Check Tailwind breakpoints (always use `p-3 sm:p-4 md:p-6` pattern)
- **Firestore fails**: App automatically falls back to mock data; check `.env.local`
- **Auth stuck**: Clear cookies → DevTools → Application → Cookies → delete fodexa domain

### Log Levels
Contexts use `console.log` liberally with emoji markers for debugging. Disable in production via custom logger if needed.

---

## Developer Conventions

### Code Style
- **Naming**: camelCase for functions/variables, PascalCase for components
- **async/await**: Preferred over `.then()` chains
- **Error handling**: Try-catch wrapper for Firestore operations
- **Comments**: Use emoji markers (🔍, ✅, ❌, 🧹) for clarity
- **Components**: Functional components with hooks only (no class components)

### File Organization
- One component per file (exceptions: small related components)
- Index files for exports (e.g., `src/components/common/index.js`)
- Contexts in own files, not bundled

### Testing
- Minimal test suite currently (create when adding new critical features)
- Manual testing on browser + mobile DevTools
- DataSeeder for manual data seeding before tests

---

## Version & Changelog

**Current**: v44.00

**Recent milestones**:
- ✅ Firebase Auth & Firestore integration (all contexts migrated)
- ✅ 100% mobile responsiveness (all pages updated with sm/md/lg breakpoints)
- ✅ DataSeeder + mock data fallback
- ✅ Customer search in order type editor
- ✅ Auto-redirect after order save
- ✅ PWA-ready with service worker

See [/memories/repo/responsive-updates.md](/memories/repo/responsive-updates.md) for detailed session-by-session progress.

---

## Next Agent: Tips for Staying Productive

When working on this codebase:
1. **Always check mobile responsiveness** — Use DevTools device toolbar for any UI changes
2. **Understand the context cascade** — Know which providers depend on auth, which on user data
3. **Firestore patterns matter** — All queries must include `where('userId', '==', user.uid)`
4. **Mock data is your friend** — Test features without Firebase by deleting `.env.local`
5. **Memory file is history** — Check `/memories/repo/responsive-updates.md` for what's been tried before
6. **Responsive pattern is standard** — New classes must follow `p-3 sm:p-4 md:p-6` pattern
7. **Cleanup listeners** — Every `onSnapshot` needs unsubscribe in useEffect cleanup
8. **Test with DataSeeder** — Use ⚙️ button to load/clear test data quickly

---

## Related Documentation
- [FIREBASE_SETUP.md](../FIREBASE_SETUP.md) — Firebase project initialization
- [FIRESTORE_RULES.md](../FIRESTORE_RULES.md) — Security rules & permissions
- [DIAGNOSTICO_v1.12.md](../DIAGNOSTICO_v1.12.md) — Debugging guide for order issues
- [/memories/repo/responsive-updates.md](/memories/repo/responsive-updates.md) — Mobile responsiveness history

---

**Last updated**: April 2026 | **Maintained by**: NODUS ESTUDIO
