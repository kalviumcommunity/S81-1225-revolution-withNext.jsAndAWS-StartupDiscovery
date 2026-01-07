# State Management Quick Reference

## 🚀 Quick Start

### Setup (Already Done ✅)

```typescript
// app/layout.tsx - Already wrapped with providers
<AuthProvider>
  <UIProvider>
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  </UIProvider>
</AuthProvider>
```

## 📚 Import Patterns

### Clean Imports (Using Barrel Exports)

```typescript
// ✅ Recommended - Clean and organized
import { AuthProvider, UIProvider } from "@/context";
import { useAuth, useUI } from "@/hooks";
```

### Full Import Paths

```typescript
// ❌ Avoid - Verbose
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
```

## 🔐 Authentication

### Get Auth State

```typescript
const { isAuthenticated, user, email, isLoading, error } = useAuth();

// Derived state - true if user is logged in
const loggedIn = useAuth().isAuthenticated;
```

### Login

```typescript
const { login } = useAuth();

// Validates inputs and simulates async call
login("john_doe", "john@example.com");
```

### Logout

```typescript
const { logout } = useAuth();

logout(); // Clears user and email
```

### Handle Errors

```typescript
const { error, clearError } = useAuth();

if (error) {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

## 🎨 UI State

### Get UI State

```typescript
const { theme, sidebarOpen, showNotifications, modalOpen } = useUI();
```

### Toggle Theme

```typescript
const { toggleTheme } = useUI();

toggleTheme(); // Switches between "light" and "dark"
```

### Set Specific Theme

```typescript
const { setTheme } = useUI();

setTheme("dark");  // Set to dark
setTheme("light"); // Set to light
```

### Sidebar Control

```typescript
const { sidebarOpen, toggleSidebar } = useUI();

toggleSidebar(); // Toggle open/closed
```

### Notifications

```typescript
const { showNotifications, toggleNotifications } = useUI();

toggleNotifications(); // Enable/disable
```

### Modal Control

```typescript
const { modalOpen, toggleModal } = useUI();

toggleModal(true);  // Open modal
toggleModal(false); // Close modal
```

### Reset UI

```typescript
const { resetUI } = useUI();

resetUI(); // Reset all UI state to defaults
```

## 💡 Common Patterns

### Conditional Rendering Based on Auth

```typescript
function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
```

### Theme-Aware Styling

```typescript
function ThemedButton() {
  const { theme } = useUI();

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-black";

  return <button className={`${bgColor} ${textColor}`}>Click me</button>;
}
```

### Login Form with Error Handling

```typescript
function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, email);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={isLoading}>
        {isLoading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

### Sidebar Toggle

```typescript
function SidebarToggle() {
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <button onClick={toggleSidebar}>
      {sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
    </button>
  );
}
```

### User Profile Display

```typescript
function UserProfile() {
  const { isAuthenticated, user, email, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <p>Name: {user}</p>
      <p>Email: {email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🧪 Testing Patterns

### Mock AuthContext

```typescript
import { createContext } from "react";

const MockAuthProvider = ({ children, value }) => (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

// Usage in tests
<MockAuthProvider value={{ user: "TestUser", isAuthenticated: true }}>
  <MyComponent />
</MockAuthProvider>
```

### Test with useAuth

```typescript
import { useAuth } from "@/hooks";

describe("MyComponent", () => {
  it("shows user when authenticated", () => {
    // Mock the hook
    jest.mock("@/hooks", () => ({
      useAuth: () => ({
        isAuthenticated: true,
        user: "TestUser",
      }),
    }));

    // Test component
    render(<MyComponent />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
  });
});
```

## 📊 Console Logging

Both contexts log their actions to the console:

```javascript
// Auth logging
"✅ User logged in: john_doe (john@example.com)"
"🔓 User logged out"
"❌ Error cleared"

// UI logging
"🎨 Theme toggled to: dark"
"📂 Sidebar closed"
"📂 Sidebar opened"
"🔔 Notifications enabled"
"🔔 Notifications disabled"
"📦 Modal opened"
"📦 Modal closed"
"🔄 UI state reset"
```

**How to view**: Open browser dev tools → Console → Look for log messages

## 🔍 Debugging

### Check Current Auth State

```typescript
// In any component
const auth = useAuth();
console.log("Auth state:", auth);
// Output:
// {
//   isAuthenticated: true,
//   user: "john",
//   email: "john@example.com",
//   isLoading: false,
//   error: null,
//   login: f,
//   logout: f,
//   clearError: f
// }
```

### Check Current UI State

```typescript
// In any component
const ui = useUI();
console.log("UI state:", ui);
// Output:
// {
//   theme: "dark",
//   sidebarOpen: true,
//   showNotifications: true,
//   modalOpen: false,
//   toggleTheme: f,
//   toggleSidebar: f,
//   toggleNotifications: f,
//   toggleModal: f,
//   setTheme: f,
//   resetUI: f
// }
```

## ⚠️ Common Mistakes

### ❌ Using Outside Provider

```typescript
// This will error if component is not wrapped by provider
const MyComponent = () => {
  const { user } = useAuth(); // Error: Cannot read property of undefined
};
```

**Fix**: Ensure component is wrapped by providers in app/layout.tsx (already done ✅)

### ❌ Forgetting "use client" Directive

```typescript
// ❌ Wrong - doesn't work in server component
export default function Page() {
  const { user } = useAuth(); // Error
}

// ✅ Correct - add "use client" directive
"use client";

export default function Page() {
  const { user } = useAuth(); // Works!
}
```

### ❌ Mutating State Directly

```typescript
// ❌ Wrong - don't mutate state directly
const { user } = useAuth();
user = "new_user"; // This won't trigger re-renders

// ✅ Correct - use provided functions
const { login } = useAuth();
login("new_user", "email@example.com");
```

## 📖 See Full Documentation

For comprehensive guides and examples:
- [STATE_MANAGEMENT_GUIDE.md](./STATE_MANAGEMENT_GUIDE.md) - 800+ line guide
- [app/state-management/page.tsx](./app/state-management/page.tsx) - Interactive demo

## 🎯 File Locations

| File | Purpose |
|------|---------|
| `context/AuthContext.tsx` | Authentication state |
| `context/UIContext.tsx` | UI state |
| `hooks/useAuth.ts` | Auth hook |
| `hooks/useUI.ts` | UI state hook |
| `app/layout.tsx` | Provider setup |
| `app/state-management/page.tsx` | Demo page |
