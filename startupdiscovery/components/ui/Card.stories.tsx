import { Card, Button } from "@/components";

/**
 * Card Component Stories
 * Visual documentation and testing for the Card component
 */
const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "elevated", "outlined"],
    },
  },
};

// Basic card
export const Basic = {
  args: {
    title: "Card Title",
    description: "Optional subtitle or description",
    children: <p>This is the main card content area.</p>,
  },
};

// Card with footer
export const WithFooter = {
  args: {
    title: "User Profile",
    description: "Jane Doe",
    children: (
      <div>
        <p className="text-sm text-slate-600 mb-2">
          Software Engineer at Tech Corp
        </p>
        <p className="text-sm text-slate-600">San Francisco, CA</p>
      </div>
    ),
    footer: (
      <>
        <Button label="Cancel" variant="secondary" size="sm" />
        <Button label="Edit" variant="primary" size="sm" />
      </>
    ),
  },
};

// Elevated variant
export const Elevated = {
  args: {
    title: "Featured Card",
    children: <p>This card has an elevated shadow effect.</p>,
    variant: "elevated",
  },
};

// Outlined variant
export const Outlined = {
  args: {
    title: "Important Card",
    children: <p>This card has a colored border outline.</p>,
    variant: "outlined",
  },
};

// Clickable card
export const Clickable = {
  args: {
    title: "Clickable Card",
    children: <p>Click me to perform an action</p>,
    onClick: () => alert("Card clicked!"),
    role: "button",
  },
};

// Card without title
export const NoTitle = {
  args: {
    children: (
      <div>
        <p>
          This is a card without a title. Perfect for flexible content layouts.
        </p>
      </div>
    ),
  },
};

// Multiple cards
export const Grid = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
    {["User 1", "User 2", "User 3"].map((user) => (
      <Card key={user} title={user} description="Active user">
        <p className="text-sm text-slate-600">200 followers • 5 projects</p>
      </Card>
    ))}
  </div>
);

// Rich content card
export const RichContent = {
  args: {
    title: "Project Overview",
    description: "Latest project statistics",
    children: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Completion:</span>
          <span className="text-sm text-blue-600">75%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: "75%" }}
          />
        </div>
        <p className="text-xs text-slate-500">Due: 2026-02-15</p>
      </div>
    ),
    footer: <Button label="View Details" size="sm" variant="primary" />,
  },
};

export default meta;
