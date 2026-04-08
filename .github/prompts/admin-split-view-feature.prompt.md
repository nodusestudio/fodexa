---
description: "Generate professional admin panel features with Split View (list + detail) layout following Nodus Studio standards"
name: "Admin Split View Feature Creator"
argument-hint: "Feature name (e.g., 'Expense Categories', 'Delivery Routes')"
agent: "agent"
---

# Admin Split View Feature Generator

Create a professional admin panel feature for FODEXA with a **Split View layout** (list panel + detail panel side-by-side).

## Context Requirements

**Technology stack:**
- React 18+ with functional components & hooks
- Firebase modular SDK (v9+): Auth, Firestore, Storage
- Tailwind CSS for styling (mobile-first)
- Context API for state management (10 existing providers in App.js)

**Architecture rules:**
1. All Firestore queries must include `where('userId', '==', user.uid)` for multi-tenant isolation
2. Import `auth`, `db`, `storage` from `src/config/firebase.js` — never duplicate Firebase init
3. Use real-time listeners (`onSnapshot`) for data, cleanup in useEffect
4. Responsive design: `p-3 sm:p-4 md:p-6` pattern for padding
5. Split View renders at `md` breakpoint+; mobile shows stacked panels

## Deliverables

### 1. **Context/Provider** (if needed)
- File: `src/context/{FeatureName}Context.js`
- Manage CRUD operations, real-time sync, state logic
- Use `useCallback` for memoization of listener setup

### 2. **List Component**
- File: `src/components/{feature}/{FeatureName}List.js`
- Display items in a table or card grid
- Columns: Name, Status, Last Updated, Actions (Edit/Delete buttons)
- Include search/filter capabilities
- Touch-friendly buttons (min 44px height)

### 3. **Detail/Form Component**
- File: `src/components/{feature}/{FeatureName}Form.js`
- Create/edit forms with validation
- Fields with labels, error states, touch feedback
- Submit/Cancel buttons
- Clear success/error messages

### 4. **Container Component**
- File: `src/components/{feature}/{FeatureName}Container.js`
- Orchestrates Split View layout:
  - Left panel (lg+): List with fixed width
  - Right panel (lg+): Detail form
  - Mobile (below lg): Stacked or modal
- Handles selection state, new item creation

### 5. **Integration**
- Add route to `src/App.js` (protected)
- Add context provider if needed
- Export from component index files

## Design Standards (Nodus Studio)

**Colors & Spacing:**
- Primary: Use Tailwind's `blue-600` / `blue-500`
- Success/Error: `green-600` / `red-600`
- Borders: `border-gray-200` (dark: `border-gray-700`)
- Use Tailwind's default color palette

**Typography:**
- Headers: `font-semibold text-lg md:text-xl`
- Body: `text-sm md:text-base`
- Labels: `text-xs md:text-sm font-medium`

**Spacing Pattern:**
- Container padding: `p-3 sm:p-4 md:p-6`
- Section gaps: `space-y-3 sm:space-y-4 md:space-y-6`
- Grid gaps: `gap-2 sm:gap-3 md:gap-4`

**Components:**
- Use [Button](../src/components/common/Button.js), [Card](../src/components/common/Card.js), [Toast](../src/components/common/Toast.js) from common/
- Inherit dark mode support via ThemeProvider

## Split View Layout Template

```jsx
<div className="flex flex-col lg:flex-row h-screen lg:gap-4 md:p-4 p-3">
  {/* Left Panel: List (30% on desktop) */}
  <div className="w-full lg:w-2/5 lg:border-r border-gray-200 dark:border-gray-700 lg:overflow-y-auto">
    <YourList onSelect={setSelectedItem} />
  </div>

  {/* Right Panel: Detail (70% on desktop) */}
  <div className="w-full lg:w-3/5 lg:overflow-y-auto">
    {selectedItem ? (
      <YourForm item={selectedItem} onSave={handleSave} />
    ) : (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select an item to edit
      </div>
    )}
  </div>
</div>
```

## Checklist Before Submission

- [ ] All Firestore queries include `userId` filter
- [ ] Firebase imports from `src/config/firebase.js`
- [ ] Real-time listeners unsubscribe in useEffect cleanup
- [ ] Responsive: `p-3 sm:p-4 md:p-6` pattern applied everywhere
- [ ] Touch targets: buttons ≥ 44px min-height
- [ ] Split View works at lg breakpoint+
- [ ] Mobile layout stacks vertically (below lg)
- [ ] Error/success handling with Toast notifications
- [ ] File structure matches existing components/
- [ ] No console errors, proper cleanup

## Example Use Cases

- **Expense Categories:** Categorize daily expenses (rent, supplies, utilities)
- **Delivery Routes:** Define delivery zones, costs, time estimates
- **User Roles:** Edit staff permissions and responsibilities
- **Report Templates:** Custom report configurations
