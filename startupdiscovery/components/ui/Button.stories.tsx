import { Button } from "@/components";

/**
 * Button Component Stories
 * Visual documentation and testing for the Button component
 */
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "neutral"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    isLoading: {
      control: "boolean",
    },
    fullWidth: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

// Primary button
export const Primary = {
  args: {
    label: "Click Me",
    variant: "primary",
  },
};

// Secondary button
export const Secondary = {
  args: {
    label: "Cancel",
    variant: "secondary",
  },
};

// Success button
export const Success = {
  args: {
    label: "Save Changes",
    variant: "success",
  },
};

// Danger button
export const Danger = {
  args: {
    label: "Delete",
    variant: "danger",
  },
};

// Neutral button
export const Neutral = {
  args: {
    label: "Options",
    variant: "neutral",
  },
};

// Small button
export const Small = {
  args: {
    label: "Small Button",
    size: "sm",
  },
};

// Medium button (default)
export const Medium = {
  args: {
    label: "Medium Button",
    size: "md",
  },
};

// Large button
export const Large = {
  args: {
    label: "Large Button",
    size: "lg",
  },
};

// Full width button
export const FullWidth = {
  args: {
    label: "Full Width Button",
    fullWidth: true,
  },
};

// Loading state
export const Loading = {
  args: {
    label: "Saving...",
    isLoading: true,
  },
};

// Disabled button
export const Disabled = {
  args: {
    label: "Disabled Button",
    disabled: true,
  },
};

// Button with icon
export const WithIcon = {
  args: {
    label: "Download",
    icon: "📥",
    variant: "primary",
  },
};

// All variants
export const AllVariants = () => (
  <div className="flex gap-4 flex-wrap">
    <Button label="Primary" variant="primary" />
    <Button label="Secondary" variant="secondary" />
    <Button label="Success" variant="success" />
    <Button label="Danger" variant="danger" />
    <Button label="Neutral" variant="neutral" />
  </div>
);

// All sizes
export const AllSizes = () => (
  <div className="flex gap-4 flex-wrap items-center">
    <Button label="Small" size="sm" />
    <Button label="Medium" size="md" />
    <Button label="Large" size="lg" />
  </div>
);

export default meta;
