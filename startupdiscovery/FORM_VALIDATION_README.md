# Form Handling & Validation with React Hook Form and Zod

## Overview

This implementation demonstrates a complete form system with robust validation using React Hook Form (RHF) and Zod. The solution provides real-time validation, meaningful error messages, and strong type safety through schema-based validation.

## What Was Implemented

### 1. **Validation Schema (schemas/signupSchema.ts)**

Zod schema defines the structure and validation rules for form data:

```typescript
const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must not exceed 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must not exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
```

**Key Benefits:**
- Single source of truth for validation rules
- Type-safe form data with `z.infer<typeof signupSchema>`
- Clear, user-friendly error messages
- Complex validation rules (regex, min/max, custom checks)

### 2. **Reusable FormInput Component (components/FormInput.tsx)**

A production-ready input component that handles:

```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Features:**
- Integrated with React Hook Form via `register`
- Error state display with styling
- Accessibility attributes (`aria-invalid`, `aria-describedby`)
- Visual feedback for valid/invalid states
- Disabled state support
- Consistent styling across all inputs

### 3. **Signup Form Page (app/signup/page.tsx)**

Complete form implementation demonstrating:

```typescript
const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm<SignupFormData>({
  resolver: zodResolver(signupSchema),
  mode: "onBlur",
});
```

**Key Features:**
- Real-time validation on blur events
- Loading state during submission
- Success/error message display
- Form reset after successful submission
- Mock API call simulation
- Console logging for debugging
- Helpful validation rules reference
- Interactive testing scenarios

## How It Works

### Validation Flow

1. **User Input** → Input field updates state through `register`
2. **On Blur** → React Hook Form triggers validation with Zod resolver
3. **Validation Check** → Zod schema validates against rules
4. **Error Display** → Invalid fields show specific error messages
5. **Submission** → Only valid forms proceed to `onSubmit`

### Component Integration

```typescript
<FormInput
  label="Full Name"
  name="name"
  register={register("name")}
  error={errors.name}
  placeholder="e.g., Alice Johnson"
/>
```

The `register` function connects the input to React Hook Form, automatically handling:
- State management
- Validation triggering
- Error tracking
- Form submission prevention

## Accessibility Features

✅ **Labels with htmlFor** - Properly connected input labels
```typescript
<label htmlFor={name} className="block mb-2 font-medium">
```

✅ **ARIA Attributes** - Screen reader support
```typescript
aria-invalid={!!error}
aria-describedby={error ? `${name}-error` : undefined}
```

✅ **Error Messages** - Clear, actionable feedback
```typescript
{error && (
  <p id={`${name}-error`}>{error.message}</p>
)}
```

✅ **Visual States** - Color-coded feedback for errors
- Red border and background for invalid fields
- Blue focus ring for valid fields
- Disabled state styling

✅ **Keyboard Navigation** - Full form navigation with Tab
✅ **Required Field Indicators** - Red asterisks show required fields

## Validation Rules

The signup form enforces:

| Field | Rules |
|-------|-------|
| **Name** | 3-50 characters required |
| **Email** | Valid email format required |
| **Password** | Min 6 chars, 1 uppercase, 1 number required |

## Testing the Form

Try these scenarios to see validation in action:

1. **Empty Submission** - Leave all fields blank → see required errors
2. **Name Too Short** - Enter "ab" → triggers min length error
3. **Invalid Email** - Enter "invalid" → triggers email format error
4. **Weak Password** - Enter "password123" → triggers uppercase requirement error
5. **Valid Submission** - Fill all fields correctly → success message appears

**Example Valid Submission:**
- Name: `Alice Johnson`
- Email: `alice@example.com`
- Password: `SecurePass123`

## Design Patterns & Best Practices

### 1. **Reusable Components**
The `FormInput` component can be reused across the application:
- Consistent styling
- Consistent error handling
- Reduced code duplication
- Easier to maintain and update

### 2. **Schema-Driven Development**
Zod schemas provide:
- Type safety (`SignupFormData` type is auto-generated)
- Single source of truth for validation
- Easy to extend with new rules
- Shareability between frontend and API

### 3. **Mode-Based Validation**
```typescript
mode: "onBlur"  // Validate on blur (less annoying than onChange)
```
Other modes available:
- `onChange` - Validate on every keystroke
- `onSubmit` - Validate only on submission
- `onTouched` - Validate after field is touched

### 4. **Error Handling**
```typescript
formState: { errors, isSubmitting }
```
- `errors` object tracks all validation errors
- `isSubmitting` prevents double-submission
- Detailed error messages from Zod

## Scalability Benefits

✅ **Easy to Add New Fields**
```typescript
// Add to schema
contact: z.string().regex(/^\d{10}$/, "Valid phone required")

// Add to form (one line!)
<FormInput label="Phone" name="contact" register={register("contact")} error={errors.contact} />
```

✅ **Consistent Validation Across App**
- Reuse the same schema in API routes
- Share validation logic between frontend and backend
- Single point of maintenance

✅ **Type Safety Throughout**
- TypeScript automatically infers form data types
- IDE autocomplete for form fields
- Catch errors at compile time

✅ **Accessible by Default**
- FormInput component handles all a11y requirements
- No need to remember ARIA attributes
- Enforces best practices

## Technical Stack

- **react-hook-form** - Form state management with minimal re-renders
- **zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between RHF and Zod
- **Tailwind CSS** - Responsive, accessible styling
- **TypeScript** - Strong type safety

## Files Created

```
schemas/
  └── signupSchema.ts      (Zod validation schema)
components/
  └── FormInput.tsx        (Reusable input component)
app/
  └── signup/
      └── page.tsx         (Signup form page)
```

## Performance Characteristics

- ✅ Minimal re-renders (React Hook Form optimizes this)
- ✅ Efficient validation (on blur, not every keystroke)
- ✅ No external API calls in demo (1s delay for testing)
- ✅ Small bundle size (RHF + Zod combined ~15KB gzipped)

## Next Steps

This form system can be extended to:
- Profile update forms
- Login forms
- Multi-step forms/wizards
- Dynamic field arrays
- Conditional field validation
- File upload validation
- Custom validation rules specific to business logic

## Reflection

### Impact on Scalability

1. **Component Reuse** - The FormInput pattern eliminates duplicated validation logic across forms, reducing maintenance burden and ensuring consistent UX.

2. **Type Safety** - Zod schemas provide compile-time and runtime type checking, catching errors early and enabling IDE support.

3. **Validation Rules** - Centralizing validation in schemas makes it easy to update rules globally and share logic between frontend and backend.

4. **Accessibility** - Standardized accessible components ensure all forms meet WCAG standards without extra effort.

5. **Developer Experience** - React Hook Form's minimal approach keeps bundle size small while providing powerful features for complex forms.

### Real-World Applications

This pattern is used by companies like:
- Discord (complex form handling)
- Vercel (multi-step deployment forms)
- Stripe (payment form validation)
- GitHub (profile and settings forms)

The combination of React Hook Form + Zod has become the industry standard for modern React applications requiring robust form handling with minimal overhead.
