---
description: "Use when creating or modifying admin panel components (List, Form, Container). Enforces Split View layout, responsive design, Nodus Studio standards, and Firebase integration patterns."
name: "Admin Component Standards"
applyTo: "src/components/**"
---

# Admin Component Standards

## When Creating Admin Components

Apply these rules to **List**, **Form**, and **Container** components for admin panels:

### 1. Split View Layout (Container Component)

At `lg` breakpoint+, render list and detail side-by-side:

```jsx
<div className="flex flex-col lg:flex-row h-screen lg:gap-4 md:p-4 p-3">
  {/* Left: List (30% width) */}
  <div className="w-full lg:w-2/5 lg:border-r border-gray-200 dark:border-gray-700 lg:overflow-y-auto">
    <YourList onSelect={setSelectedId} />
  </div>

  {/* Right: Detail/Form (70% width) */}
  <div className="w-full lg:w-3/5 lg:overflow-y-auto">
    {selectedId ? (
      <YourForm id={selectedId} onSave={handleSave} />
    ) : (
      <EmptyState />
    )}
  </div>
</div>
```

On mobile (below `lg`): Stack vertically or show modal.

### 2. Responsive Spacing Pattern

**DO NOT** use fixed widths or padding. Always use the mobile-first breakpoint pattern:

```jsx
// ✅ CORRECT
<div className="p-3 sm:p-4 md:p-6">
<div className="gap-2 sm:gap-3 md:gap-4 lg:gap-6">
<div className="text-sm md:text-base lg:text-lg">

// ❌ WRONG
<div className="p-8">
<div className="gap-6">
<div className="text-lg">
```

Common patterns:
- **Padding**: `p-3 sm:p-4 md:p-6`
- **Gaps**: `gap-2 sm:gap-3 md:gap-4 lg:gap-6`
- **Text**: `text-sm md:text-base`, `text-xs md:text-sm`
- **Margins**: `mb-2 sm:mb-4 md:mb-6`

### 3. List Component Structure

```jsx
// src/components/{feature}/{Feature}List.js
export function {Feature}List({ onSelect }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter items
  const filtered = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Items */}
      <div className="space-y-2 sm:space-y-3">
        {filtered.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full text-left px-3 py-2 sm:py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <div className="font-medium text-sm md:text-base">{item.name}</div>
            <div className="text-xs md:text-sm text-gray-500">{item.status}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 4. Form Component Structure

```jsx
// src/components/{feature}/{Feature}Form.js
export function {Feature}Form({ id, onSave }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate, save to Firestore
      // Use Toast for success/error feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Fields */}
      <div>
        <label className="block text-xs md:text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 sm:gap-3">
        <Button type="submit" loading={loading}>Save</Button>
        <Button variant="ghost" type="button">Cancel</Button>
      </div>
    </form>
  );
}
```

### 5. Firebase Integration Rules

**All** Firestore queries must include `userId`:

```jsx
// ✅ CORRECT
const unsubscribe = onSnapshot(
  query(
    collection(db, 'myCollection'),
    where('userId', '==', user.uid)  // REQUIRED
  ),
  (snapshot) => {
    const items = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    setItems(items);
  }
);
return () => unsubscribe();
```

**Never** duplicate Firebase init—import from `src/config/firebase.js`:

```jsx
import { db, auth } from 'src/config/firebase';
```

### 6. Touch Accessibility

Ensure buttons and clickable elements are **≥44px** height:

```jsx
// ✅ CORRECT
<button className="h-10 sm:h-11 min-h-[44px] px-3">Touch-friendly</button>

// ❌ WRONG
<button className="h-6 px-2">Too small</button>
```

### 7. Error & Success Handling

Use Toast component for feedback:

```jsx
import { Toast } from 'src/components/common/Toast';

const [toast, setToast] = useState(null);

const handleSave = async () => {
  try {
    // ... save logic
    setToast({ type: 'success', message: 'Saved!' });
  } catch (error) {
    setToast({ type: 'error', message: error.message });
  }
};

return (
  <>
    {/* Form */}
    {toast && <Toast {...toast} onClose={() => setToast(null)} />}
  </>
);
```

### 8. File Organization

```
src/components/{feature}/
  ├── {Feature}Container.js    (Split View orchestrator)
  ├── {Feature}List.js         (List panel)
  ├── {Feature}Form.js         (Detail/form panel)
  └── index.js                 (Exports)
```

Export from parent index:

```js
// src/components/common/index.js
export { {Feature}Container } from './{feature}/{Feature}Container';
```

### 9. Dark Mode Support

Always use Tailwind's dark mode utilities—they're auto-applied via ThemeProvider:

```jsx
<div className="bg-white dark:bg-gray-900">
<div className="text-gray-900 dark:text-white">
<div className="border-gray-200 dark:border-gray-700">
```

### 10. Testing Checklist

Before committing:

- [ ] Responsive at 320px (mobile), 768px (tablet), 1024px+ (desktop)
- [ ] All buttons ≥44px
- [ ] Firestore queries include `userId`
- [ ] Firebase imports from `src/config/firebase.js`
- [ ] Listeners unsubscribe in useEffect cleanup
- [ ] Toast for errors/success
- [ ] No console errors
- [ ] Dark mode works
- [ ] Split View shows correctly at lg+

