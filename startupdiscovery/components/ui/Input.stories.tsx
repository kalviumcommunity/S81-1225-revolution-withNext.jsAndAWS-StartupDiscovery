import { Input } from "@/components";

/**
 * Input Component Stories
 * Visual documentation and testing for the Input component
 */
const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "url", "tel"],
    },
    disabled: {
      control: "boolean",
    },
    required: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
    },
  },
};

// Basic input
export const Basic = {
  args: {
    label: "First Name",
    placeholder: "Enter your first name",
  },
};

// Email input
export const Email = {
  args: {
    label: "Email Address",
    type: "email",
    placeholder: "your@email.com",
    required: true,
  },
};

// Password input
export const Password = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    required: true,
  },
};

// Input with error
export const WithError = {
  args: {
    label: "Username",
    placeholder: "Enter username",
    error: "Username is already taken",
    value: "john_doe",
  },
};

// Input with helper text
export const WithHelperText = {
  args: {
    label: "Website",
    type: "url",
    placeholder: "https://example.com",
    helperText: "Include the protocol (https://)",
  },
};

// Disabled input
export const Disabled = {
  args: {
    label: "Disabled Field",
    placeholder: "Cannot edit this field",
    disabled: true,
    value: "Read-only value",
  },
};

// Loading state
export const Loading = {
  args: {
    label: "Checking availability...",
    isLoading: true,
    placeholder: "Waiting for response",
  },
};

// Input with icon
export const WithIcon = {
  args: {
    label: "Search",
    placeholder: "Search users...",
    icon: "🔍",
  },
};

// Number input
export const Number = {
  args: {
    label: "Age",
    type: "number",
    min: 0,
    max: 120,
    placeholder: "Enter your age",
  },
};

// Required field
export const Required = {
  args: {
    label: "Required Field",
    required: true,
    placeholder: "This field is required",
  },
};

// Form example
export const FormExample = () => (
  <form className="space-y-4 w-96 p-6 bg-white rounded-lg border border-slate-200">
    <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
    <Input label="Full Name" placeholder="John Doe" required />
    <Input
      label="Email"
      type="email"
      placeholder="john@example.com"
      required
      helperText="We'll never share your email"
    />
    <Input
      label="Password"
      type="password"
      placeholder="••••••••"
      required
      helperText="At least 8 characters"
    />
    <Input
      label="Confirm Password"
      type="password"
      placeholder="••••••••"
      required
    />
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
    >
      Create Account
    </button>
  </form>
);

// Validation states
export const ValidationStates = () => (
  <div className="space-y-4 w-96">
    <Input label="Valid" value="john@example.com" type="email" />
    <Input
      label="Invalid"
      value="not-an-email"
      type="email"
      error="Please enter a valid email address"
    />
    <Input label="Loading" placeholder="Checking..." isLoading />
    <Input label="Disabled" disabled value="Disabled field" />
  </div>
);

export default meta;
