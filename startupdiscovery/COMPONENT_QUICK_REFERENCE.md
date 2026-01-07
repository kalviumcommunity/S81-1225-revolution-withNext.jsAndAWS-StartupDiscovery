# Component Quick Reference

## Usage Guide - Copy & Paste Ready

### Layout Components

#### 1. LayoutWrapper (Main Layout)

Wraps pages with Header, Sidebar, and consistent styling.

```tsx
import { LayoutWrapper } from "@/components";

export default function DashboardPage() {
  return (
    <LayoutWrapper showHeader showSidebar headerTitle="Dashboard">
      <div className="p-6">{/* Your page content */}</div>
    </LayoutWrapper>
  );
}
```

#### 2. Header (Top Navigation)

Sticky navigation with active link detection.

```tsx
import { Header } from "@/components";

<Header title="My App" showNav />;
```

#### 3. Sidebar (Secondary Navigation)

Collapsible navigation for desktop/mobile.

```tsx
import { Sidebar } from "@/components";

<Sidebar
  collapsible
  defaultOpen
  links={[
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ]}
/>;
```

---

## UI Components

### 1. Button

5 variants, 3 sizes, multiple states.

```tsx
import { Button } from "@/components";

// Basic
<Button label="Click me" />

// Primary action
<Button label="Submit" variant="primary" size="lg" />

// Loading state
<Button label="Processing..." isLoading disabled />

// Danger action
<Button label="Delete" variant="danger" />

// With icon
<Button label="Download" icon={<DownloadIcon />} />

// Full width
<Button label="Sign In" fullWidth />
```

**Variants**: `primary | secondary | success | danger | neutral`
**Sizes**: `sm | md | lg`
**Props**: `label, variant, size, isLoading, icon, fullWidth, disabled`

---

### 2. Card

Container with optional sections.

```tsx
import { Card, Button } from "@/components";

// Basic
<Card title="User Info" description="View user details">
  <p>Name: John Doe</p>
  <p>Email: john@example.com</p>
</Card>

// With footer
<Card
  title="Product"
  description="Premium Plan"
  footer={<Button label="Upgrade" variant="primary" />}
>
  <p>Price: $99/month</p>
  <p>Features: API access, Priority support</p>
</Card>

// Clickable
<Card
  title="Navigate"
  onClick={() => router.push("/users")}
>
  Click to view all users
</Card>

// Elevated style
<Card variant="elevated" title="Notification">
  Your account was updated successfully
</Card>
```

**Variants**: `default | elevated | outlined`
**Props**: `title, description, footer, variant, onClick, children`

---

### 3. Input

Form input with labels, errors, helper text.

```tsx
import { Input } from "@/components";

// Basic
<Input
  label="Username"
  placeholder="Enter your username"
  required
/>

// Email
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password is required"
/>

// With helper text
<Input
  label="Website"
  type="url"
  helperText="Include the full URL (e.g., https://example.com)"
/>

// Loading state
<Input
  label="Checking availability..."
  isLoading
  disabled
/>

// With icon
<Input
  label="Search"
  icon={<SearchIcon />}
  placeholder="Search users..."
/>
```

**Input Types**: `text | email | password | number | url | tel`
**Props**: `label, type, error, helperText, isLoading, icon, required`

---

## Complete Example Page

```tsx
"use client";

import { LayoutWrapper, Button, Card, Input } from "@/components";
import { useState } from "react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    // Handle submission
    setLoading(false);
  };

  return (
    <LayoutWrapper showHeader showSidebar headerTitle="Profile">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header card */}
        <Card
          title="Update Profile"
          description="Edit your account information"
          variant="elevated"
        >
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={error}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Button
              label="Update Profile"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              onClick={handleSubmit}
              fullWidth
            />
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card title="Account Status" description="Your account information">
            <p className="text-sm text-gray-600">Active since January 2024</p>
          </Card>

          <Card
            title="Security"
            description="Password and 2FA settings"
            footer={<Button label="Configure" variant="secondary" size="sm" />}
          >
            <p className="text-sm text-gray-600">2FA is currently disabled</p>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}
```

---

## Styling Customization

All components accept `className` prop for custom styling:

```tsx
<Button
  label="Custom Style"
  className="rounded-full bg-purple-600 hover:bg-purple-700"
/>

<Card
  title="Custom Card"
  className="rounded-xl shadow-2xl"
>
  Content here
</Card>

<Input
  label="Custom Input"
  className="border-2 border-indigo-500 focus:border-indigo-700"
/>
```

---

## TypeScript Props Reference

### Button Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "neutral";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

### Card Props

```typescript
interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  onClick?: () => void;
  role?: string;
  aria-label?: string;
  className?: string;
}
```

### Input Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  required?: boolean;
}
```

### LayoutWrapper Props

```typescript
interface LayoutWrapperProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  headerTitle?: string;
}
```

---

## Accessibility Features Built-In

✅ **All Components Include**:

- Semantic HTML tags
- ARIA attributes
- Keyboard navigation (Tab, Enter, Space)
- Focus management
- Color contrast compliance
- Screen reader support
- Error state indicators

---

## Storybook Preview

View interactive component previews:

```bash
npm run storybook
# Opens http://localhost:6006
```

Explore all variants, sizes, and states in the Storybook UI.

---

## Common Patterns

### Form Section

```tsx
<Card title="Contact Information" variant="outlined">
  <div className="space-y-4">
    <Input label="Full Name" placeholder="John Doe" required />
    <Input label="Email" type="email" required />
    <Input label="Phone" type="tel" helperText="Optional" />
    <div className="pt-4 flex gap-2">
      <Button label="Save" variant="primary" />
      <Button label="Cancel" variant="secondary" />
    </div>
  </div>
</Card>
```

### Feature Grid

```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card
    title="Feature 1"
    description="Description here"
    onClick={() => navigate("/feature1")}
  >
    {/* Icon or content */}
  </Card>
  <Card title="Feature 2" description="Description here">
    {/* Icon or content */}
  </Card>
  <Card title="Feature 3" description="Description here">
    {/* Icon or content */}
  </Card>
</div>
```

### Action Section

```tsx
<Card variant="elevated" title="Actions">
  <div className="flex gap-2 flex-wrap">
    <Button label="Download" icon={<DownloadIcon />} />
    <Button label="Share" variant="secondary" />
    <Button label="Delete" variant="danger" size="sm" />
  </div>
</Card>
```

---

## Import Statement

```typescript
// Import specific components
import {
  Header,
  Sidebar,
  LayoutWrapper,
  Button,
  Card,
  Input,
} from "@/components";

// Or use barrel export
import * as Components from "@/components";
```

---

## Additional Resources

📖 **Detailed Documentation**: See [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)
🎥 **Video Demo Script**: See [VIDEO_DEMO_SCRIPT.md](./VIDEO_DEMO_SCRIPT.md)
📚 **Storybook Stories**: Components with interactive examples

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: ✅ Production Ready
