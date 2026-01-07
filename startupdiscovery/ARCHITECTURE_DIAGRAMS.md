# State Management Architecture Diagram & Analysis

## 🏗️ Overall Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Entry                         │
│                  app/layout.tsx                              │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────────┐      ┌──────────▼──────────────┐
│   AuthProvider       │      │   UIProvider           │
│  ┌────────────────┐  │      │  ┌──────────────────┐  │
│  │  State:        │  │      │  │  State:          │  │
│  │  - user        │  │      │  │  - theme         │  │
│  │  - email       │  │      │  │  - sidebarOpen   │  │
│  │  - isLoading   │  │      │  │  - notifications │  │
│  │  - error       │  │      │  │  - modalOpen     │  │
│  ├────────────────┤  │      │  ├──────────────────┤  │
│  │  Actions:      │  │      │  │  Actions:        │  │
│  │  - login()     │  │      │  │  - toggleTheme() │  │
│  │  - logout()    │  │      │  │  - setTheme()    │  │
│  │  - clearError()│  │      │  │  - toggles...()  │  │
│  └────────────────┘  │      │  │  - resetUI()     │  │
└───────┬──────────────┘      │  └──────────────────┘  │
        │                      └──────────┬─────────────┘
        │                                 │
        └─────────────┬───────────────────┘
                      │
        ┌─────────────▼────────────────┐
        │   LayoutWrapper              │
        │  ┌──────────────────────────┐│
        │  │  Header Component        ││
        │  └──────────────────────────┘│
        │  ┌──────────────────────────┐│
        │  │  Sidebar Component       ││
        │  └──────────────────────────┘│
        │  ┌──────────────────────────┐│
        │  │  Main Content (pages)    ││
        │  └──────────────────────────┘│
        └─────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
User Interaction
      │
      ▼
  ┌─────────────┐
  │  Component  │  (e.g., LoginForm, ThemeToggle)
  └──────┬──────┘
         │
         │ Calls:
         │ - login(username, email)
         │ - toggleTheme()
         │ - toggleSidebar()
         │
         ▼
  ┌──────────────────────────────────────┐
  │  useAuth() or useUI() Hook           │
  │  (Custom Hook)                       │
  └──────┬───────────────────────────────┘
         │
         │ Accesses:
         │ - useAuthContext()
         │ - useUIContext()
         │
         ▼
  ┌──────────────────────────────────────┐
  │  AuthContext or UIContext            │
  │  ┌──────────────────────────────────┐│
  │  │ State Update (useState)          ││
  │  │ - user = "john"                  ││
  │  │ - theme = "dark"                 ││
  │  └──────────────────────────────────┘│
  │  ┌──────────────────────────────────┐│
  │  │ Memoized Value (useMemo)         ││
  │  │ Re-created only if deps change  ││
  │  └──────────────────────────────────┘│
  └──────┬───────────────────────────────┘
         │
         │ Context consumers
         │ re-render if value changed
         │
         ▼
  ┌──────────────────────────────────────┐
  │  All Consumer Components             │
  │  Re-render with new state            │
  │  (Only if they subscribe to context) │
  └──────────────────────────────────────┘
```

---

## 🎯 Component Dependency Tree

```
app/layout.tsx
├── AuthProvider
│   └── AuthContext
│       └── State: {user, email, isLoading, error}
│       └── Actions: {login, logout, clearError}
│
├── UIProvider
│   └── UIContext
│       └── State: {theme, sidebarOpen, showNotifications, modalOpen}
│       └── Actions: {toggleTheme, setTheme, toggleSidebar, ...}
│
└── LayoutWrapper
    ├── Header
    │   ├── uses: useUI() → toggleTheme, theme
    │   └── uses: useAuth() → user, isAuthenticated
    │
    ├── Sidebar
    │   ├── uses: useUI() → sidebarOpen, toggleSidebar
    │   └── uses: useAuth() → user, logout
    │
    └── Pages (children)
        ├── app/page.tsx
        │   └── uses: useAuth(), useUI()
        │
        ├── app/dashboard/page.tsx
        │   └── uses: useAuth(), useUI()
        │
        └── app/state-management/page.tsx (Demo)
            ├── uses: useAuth() → All features
            └── uses: useUI() → All features
```

---

## 📊 Context Value Structure

### AuthContext Value (Memoized)

```typescript
{
  // State
  user: string | null,              // "john" or null
  email: string | null,             // "john@example.com" or null
  isLoading: boolean,               // true while async operation
  error: string | null,             // "Username required" or null

  // Actions (memoized with useCallback)
  login: (username: string, email: string) => void,
  logout: () => void,
  clearError: () => void
}
```

**Memoization**: Value is cached and only updated when any of the values/functions change

```typescript
const value = useMemo(
  () => ({
    user,
    email,
    isLoading,
    error,
    login,
    logout,
    clearError,
  }),
  [user, email, isLoading, error, login, logout, clearError]
);
```

### UIContext Value (Memoized)

```typescript
{
  // State
  theme: "light" | "dark",
  sidebarOpen: boolean,             // true = open, false = closed
  showNotifications: boolean,       // true = enabled, false = disabled
  modalOpen: boolean,               // true = open, false = closed

  // Actions (memoized with useCallback)
  toggleTheme: () => void,
  setTheme: (theme: "light" | "dark") => void,
  toggleSidebar: () => void,
  toggleNotifications: () => void,
  toggleModal: (open: boolean) => void,
  resetUI: () => void
}
```

---

## 🔗 Hook Composition

### useAuth Hook

```
useAuth()
├── Calls: useAuthContext()
├── Returns: {
│   ├── isAuthenticated (derived from user !== null)
│   ├── user
│   ├── email
│   ├── isLoading
│   ├── error
│   ├── login
│   ├── logout
│   └── clearError
│ }
└── Encapsulates: Implementation details
    └── Component doesn't know about
        - useState internals
        - useCallback implementation
        - useMemo logic
        - Context structure
```

### useUI Hook

```
useUI()
├── Calls: useUIContext()
├── Returns: {
│   ├── theme
│   ├── sidebarOpen
│   ├── showNotifications
│   ├── modalOpen
│   ├── toggleTheme
│   ├── setTheme
│   ├── toggleSidebar
│   ├── toggleNotifications
│   ├── toggleModal
│   └── resetUI
│ }
└── Encapsulates: Implementation details
```

---

## 🚀 Performance Optimization Layers

```
Layer 1: Context Splitting
├── AuthProvider (manages auth state)
└── UIProvider (manages UI state)
    └── Benefit: Components using only UI state won't
                 re-render on auth state changes


Layer 2: useMemo (Value Memoization)
├── Context value cached
├── Only updated if dependencies change
└── Benefit: Prevents unnecessary re-renders when
             state values change


Layer 3: useCallback (Function Memoization)
├── login, logout, clearError (in AuthContext)
├── toggleTheme, setTheme, etc. (in UIContext)
└── Benefit: Stable function references across renders


Layer 4: Custom Hooks
├── useAuth encapsulates AuthContext logic
├── useUI encapsulates UIContext logic
└── Benefit: Clean API, easy to test, can optimize later
```

---

## 📈 State Transition Diagram

### Authentication State Machine

```
┌─────────────┐
│   NO USER   │  Initial State
│ (logged out)│
└──────┬──────┘
       │
       │ login(username, email)
       │
       ▼
┌──────────────────────┐
│   LOADING = TRUE     │
│                      │
│ Validate inputs:     │
│ - Check username     │
│ - Check email        │
│ - Show error if bad  │
└──────┬───────────────┘
       │
       │ Success ✓
       │ (500ms async)
       │
       ▼
┌──────────────────────┐
│  USER = "john"       │
│  EMAIL = "john@..."  │
│  LOADING = FALSE     │
│  ERROR = NULL        │
│                      │
│  Logged in ✅        │
└──────┬───────────────┘
       │
       │ logout()
       │
       ▼
┌─────────────┐
│   NO USER   │
│ (logged out)│
└─────────────┘
```

### Theme State Machine

```
┌────────────┐
│   LIGHT    │  Default State
└──────┬─────┘
       │
       │ toggleTheme()
       │ or setTheme("dark")
       │
       ▼
┌────────────┐
│   DARK     │
└──────┬─────┘
       │
       │ toggleTheme()
       │ or setTheme("light")
       │
       ▼
┌────────────┐
│   LIGHT    │
└────────────┘
```

---

## 🔍 Re-render Analysis

### Scenario 1: Login

```
User submits login form
        │
        ▼
login() function called
        │
        ▼
isLoading = true
        │
        ├─► useAuth() subscribers re-render ✓
        └─► useUI() subscribers (NO) ✗
                    (Different context, not affected)
        │
        ├─ 500ms delay
        │
        ▼
State updates: user, email, isLoading, error
        │
        ├─► useAuth() subscribers re-render ✓
        └─► useUI() subscribers (NO) ✗
                    (Different context, not affected)
```

### Scenario 2: Toggle Theme

```
User clicks theme button
        │
        ▼
toggleTheme() function called
        │
        ▼
theme = "dark"
        │
        ├─► useUI() subscribers re-render ✓
        └─► useAuth() subscribers (NO) ✗
                    (Different context, not affected)
```

### Scenario 3: Both

```
User logs in + clicks theme button
        │
        ├─ login() ──► useAuth() subscribers re-render ✓
        │
        └─ toggleTheme() ──► useUI() subscribers re-render ✓
                               useAuth() subscribers (NO) ✗

Result: Only affected subscribers re-render!
```

---

## 🛠️ Implementation Pattern

### Full Stack Example: Login Feature

```
1. USER INTERFACE
   ┌─────────────────────┐
   │  LoginForm.tsx      │
   │  "use client"       │
   │                     │
   │  - Input: username  │
   │  - Input: email     │
   │  - Button: Login    │
   └────────┬────────────┘
            │
            │ onClick={handleLogin}
            │
2. HOOK LAYER
            ▼
   ┌─────────────────────┐
   │  useAuth()          │
   │                     │
   │  - Destructure:     │
   │    { login, error } │
   │  - Call: login()    │
   └────────┬────────────┘
            │
            │ login(username, email)
            │
3. CONTEXT LAYER
            ▼
   ┌──────────────────────────┐
   │  useAuthContext() hook    │
   │                           │
   │  - Get context reference  │
   │  - Call: dispatch action  │
   └────────┬─────────────────┘
            │
            │ setUser, setEmail, setError, setIsLoading
            │
4. STATE LAYER
            ▼
   ┌───────────────────────────┐
   │  useState() calls          │
   │                            │
   │  - const [user, setUser]   │
   │  - const [email, setEmail] │
   │  - const [error, setError] │
   │  - const [isLoading, ...]  │
   │                            │
   │  State updated ✓           │
   └────────┬──────────────────┘
            │
5. MEMOIZATION LAYER
            ▼
   ┌───────────────────────────┐
   │  useMemo() recalculates    │
   │                            │
   │  - New value object        │
   │  - Includes new state      │
   └────────┬──────────────────┘
            │
6. SUBSCRIBER LAYER
            ▼
   ┌───────────────────────────┐
   │  useAuth() components      │
   │  re-render                 │
   │                            │
   │  - Show logged-in UI       │
   │  - Update display          │
   └───────────────────────────┘
```

---

## 📋 Checklist: Using State Management

When you need to use authentication state:

- ✅ Create "use client" component
- ✅ Import: `import { useAuth } from "@/hooks"`
- ✅ Destructure: `const { user, login, logout } = useAuth()`
- ✅ Use in JSX: `{user && <p>Welcome {user}</p>}`

When you need to use UI state:

- ✅ Create "use client" component
- ✅ Import: `import { useUI } from "@/hooks"`
- ✅ Destructure: `const { theme, toggleTheme } = useUI()`
- ✅ Use in JSX: `onClick={toggleTheme}`

When you need both:

- ✅ Create "use client" component
- ✅ Import both: `import { useAuth, useUI } from "@/hooks"`
- ✅ Use together in same component

---

## 🎓 Key Concepts

### Context API Flow

```
1. Create Context
   └─ const AuthContext = createContext()

2. Create Provider
   └─ export function AuthProvider() { ... }

3. Wrap Components
   └─ <AuthProvider><App /></AuthProvider>

4. Consume Values
   └─ const value = useContext(AuthContext)

5. Create Custom Hook
   └─ export function useAuth() { ... }

6. Use Hook in Components
   └─ const { user } = useAuth()
```

### Performance Benefits

```
Without Optimization:
- Every state change → all consumers re-render
- Inefficient re-renders
- Possible performance issues

With Optimization:
- useMemo → value cached, only new if deps change
- useCallback → functions stable, prevent re-renders
- Context splitting → only affected consumers re-render
- Custom hooks → easy to optimize later

Result: ⚡ Smooth, responsive app
```

---

## 📚 Testing Pyramid

```
                    E2E Tests
                  (Real app flow)
                      ▲
                     ╱ ╲
                    ╱   ╱ Integration Tests
                   ╱   ╱   (Context + Component)
                  ╱   ╱       ▲
                 ╱   ╱        ╱ ╲
                ╱   ╱        ╱   ╱ Unit Tests
               ╱   ╱        ╱   ╱  (Hook, Context)
              ╱───╱        ╱   ╱
             │ Foundation │  ╱
             └───────────┘─╱

Test Examples:
- Unit: useAuth returns correct state
- Integration: LoginForm + useAuth together
- E2E: User flows through entire login
```

---

## 🎯 This Architecture Enables

| Capability               | How                                          |
| ------------------------ | -------------------------------------------- |
| **No Prop Drilling**     | Components directly access context via hooks |
| **Centralized State**    | Single source of truth for auth and UI       |
| **Easy Testing**         | Mock providers, test hooks independently     |
| **Performance**          | Memoization + context splitting              |
| **Scalability**          | Easy to add more contexts as app grows       |
| **Type Safety**          | TypeScript interfaces for all state          |
| **Code Organization**    | Clear separation of concerns                 |
| **Developer Experience** | Clean API via custom hooks                   |

---

**Architecture Diagram Complete** ✅
