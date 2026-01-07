# Component Architecture Video Demo Script

## Duration: 10-12 minutes

### Demo Checklist

- [ ] Start Storybook server
- [ ] Show component files structure
- [ ] Demo each component in isolation
- [ ] Show component variations
- [ ] Navigate between pages showing shared layout
- [ ] Show accessibility features
- [ ] Explain code snippets
- [ ] Record screen + audio

---

## Scene 1: Introduction (1 minute)

**Narration:**
"In this demo, I'll walk you through the component architecture I've built for the Startup Discovery platform. This architecture ensures design consistency, developer productivity, and accessibility across all pages.

Here's what we'll cover:

1. Component organization and folder structure
2. Layout components (Header, Sidebar, LayoutWrapper)
3. Reusable UI components (Button, Card, Input) with Storybook
4. How components work together across pages
5. Accessibility features built into components
6. Scalability and future expansion"

**Show on screen:**

- VS Code with project open
- Components folder highlighted
- File tree visible

---

## Scene 2: Folder Structure (1 minute)

**Narration:**
"Let's start with how the components are organized. All reusable components live in the `/components` directory, organized by type:

- Layout components are in `/components/layout` - these handle page structure
- UI components are in `/components/ui` - these are the building blocks
- Each component has an accompanying `.stories.tsx` file for Storybook documentation"

**Show on screen:**

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── LayoutWrapper.tsx
├── ui/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   ├── Input.tsx
│   └── Input.stories.tsx
└── index.ts
```

**Code snippet:**
Show `components/index.ts` barrel export:

```typescript
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as LayoutWrapper } from "./layout/LayoutWrapper";
export { default as Button } from "./ui/Button";
export { default as Card } from "./ui/Card";
export { default as Input } from "./ui/Input";
```

---

## Scene 3: Layout Components in Action (2 minutes)

**Narration:**
"Now let's see the layout components in action. Start the development server and navigate to the dashboard. Notice how every page has the same structure:

1. A header at the top with navigation
2. A sidebar on the left with section links
3. The main content area in the middle

This consistent structure is provided by the LayoutWrapper component, which combines Header and Sidebar."

**Show on screen:**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`

**Point out:**

- Header with logo and nav links
- Active link highlighted (blue background)
- Sidebar on left with Dashboard highlighted
- Responsive design - on mobile, sidebar collapses
- Main content area with cards

**Narration:**
"Let me click the hamburger menu on mobile to show how the sidebar is interactive and toggleable."

**Show on screen:**

- Resize browser to mobile width
- Click hamburger button
- Sidebar slides in
- Click overlay to close

**Code snippet:**
Show `components/layout/LayoutWrapper.tsx`:

```typescript
export default function LayoutWrapper({
  children,
  showHeader = true,
  showSidebar = true,
  headerTitle,
}: LayoutWrapperProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {showHeader && <Header title={headerTitle} />}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
        <main id="main-content" role="main">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

---

## Scene 4: Page Navigation (1.5 minutes)

**Narration:**
"Let me navigate through a couple of pages to show how the same layout structure provides consistency across the entire application."

**Show on screen:**

1. From Dashboard, click "Browse Users" in sidebar
2. Show `/users` page with user cards
3. Click on a user to go to `/users/1`
4. Show individual user profile

**Point out:**

- Header stays the same throughout
- Sidebar navigation indicates current page (active state)
- Content changes but layout structure is identical
- URL changes but visual consistency maintained

**Narration:**
"Notice that even though we're on different pages, the header and sidebar remain consistent. This unified structure means users always know where they are in the app, and developers don't have to rebuild the layout for each page."

---

## Scene 5: Button Component in Storybook (2 minutes)

**Narration:**
"Now let's open Storybook to see the components in isolation. This is where designers, developers, and product managers can review and test components without navigating the full application."

**Show on screen:**

```bash
npm run storybook
```

Open `http://localhost:6006`

**Point out:**

- Storybook sidebar with component list
- Click on "UI/Button" to expand
- Shows all Button stories

**Narration:**
"Here are all the different Button variations we've created:

1. Primary - for main actions
2. Secondary - for alternative actions
3. Success - for positive actions
4. Danger - for destructive actions
5. Neutral - for tertiary actions

We also have different sizes:

- Small - compact buttons
- Medium - default size
- Large - prominent buttons

And we can see loading states and disabled states."

**Show on screen:**

- Click through each story
- Point to the rendering on the right
- Use the Controls panel to modify props in real-time
- Show loading state by clicking "isLoading" toggle
- Show disabled state
- Show "AllVariants" and "AllSizes" composite stories

**Code snippet:**
Show `components/ui/Button.stories.tsx`:

```typescript
export const Primary = {
  args: {
    label: "Click Me",
    variant: "primary",
  },
};

export const Loading = {
  args: {
    label: "Saving...",
    isLoading: true,
  },
};
```

---

## Scene 6: Card Component (1.5 minutes)

**Narration:**
"Let's look at the Card component, which is used for grouping related content. Cards can have titles, descriptions, content, and footers."

**Show on screen:**

- Click on "UI/Card" in Storybook
- Show "Basic" story
- Show "WithFooter" story
- Show "Clickable" story
- Show "Grid" story with multiple cards

**Narration:**
"Cards are incredibly flexible. They can be:

- Simple containers with just content
- Have headers with title and description
- Include footer areas for actions
- Be clickable for navigation
- Arranged in grids for data display

This single component provides the foundation for displaying everything from user profiles to project cards to statistics dashboards."

**Point out:**

- Visual hierarchy with title, description, content
- Footer with action buttons
- Consistent styling across variants
- Responsive grid layout

---

## Scene 7: Input Component (1 minute)

**Narration:**
"The Input component handles all text input needs with built-in accessibility features."

**Show on screen:**

- Click on "UI/Input" in Storybook
- Show "Email" story with required indicator
- Show "WithError" story showing error styling
- Show "WithHelperText" story
- Show "ValidationStates" composite story

**Narration:**
"Notice how the Input component handles:

- Required field indicators
- Error states with red styling and error messages
- Helper text for guidance
- Loading states
- Icons for context
- Keyboard navigation

All of this is accessible out of the box - labels are properly associated, errors are announced to screen readers, and keyboard navigation works seamlessly."

**Code snippet:**
Show accessibility features in Input:

```typescript
<input
  aria-invalid={hasError}
  aria-describedby={error ? `${inputId}-error` : undefined}
  className="focus:outline-none focus:ring-2 focus:ring-offset-2"
/>
{error && (
  <p id={`${inputId}-error`} className="text-sm text-red-600 mt-1">
    {error}
  </p>
)}
```

---

## Scene 8: Component Usage in Pages (1.5 minutes)

**Narration:**
"Now let's look at how these components are used in actual pages. Let me open a page component that uses multiple components together."

**Show on screen:**

- Open `app/dashboard/page.tsx` in VS Code
- Show how it imports components from barrel export
- Highlight Button, Card, Input usage

**Code snippet:**

```typescript
import { Card, Button, Input } from "@/components";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card title="Welcome" description="Dashboard">
        <p>Welcome content here...</p>
      </Card>

      <Card title="Search Users">
        <Input label="Search..." />
        <Button label="Search" variant="primary" />
      </Card>
    </div>
  );
}
```

**Narration:**
"See how clean the page component is? With our component architecture, pages focus on logic and layout, not building UI from scratch. The components handle styling, accessibility, and interaction patterns."

**Navigate in browser:**

- Show the dashboard page
- Point to where the components render

---

## Scene 9: Accessibility Features (1.5 minutes)

**Narration:**
"One of the most important aspects of this architecture is that accessibility is built-in, not bolted-on. Let me show you some of the accessibility features."

**Show on screen:**

- Open DevTools (F12)
- Open Accessibility tree view
- Show Header component structure

**Point out:**

- Semantic elements: `<header>`, `<nav>`, `<aside>`, `<main>`
- Active link has `aria-current="page"`
- Buttons have proper labels
- Links have descriptive text
- Form inputs have associated labels

**Narration:**
"Let me demonstrate keyboard navigation. I'll navigate through the page using only the Tab key."

**Show on screen:**

- Click on page
- Press Tab repeatedly
- Show focus moving through:
  - Header logo
  - Navigation links
  - Skip to main content link
  - Sidebar links
  - Main content buttons

**Point out:**

- Focus ring is clearly visible
- Focus order is logical
- Skip link available for keyboard users
- All elements are keyboard accessible

**Narration:**
"I can also navigate using the keyboard to open the mobile sidebar:"

**Show on screen:**

- Resize to mobile
- Press Tab to focus hamburger button
- Press Enter to activate
- Sidebar opens

**Narration:**
"This ensures that users with keyboard-only input, screen readers, or voice control can navigate and use the application just as easily as mouse users."

---

## Scene 10: Props Contracts & Type Safety (1 minute)

**Narration:**
"One last thing I want to show is how TypeScript helps us build better components. Let's look at the Button component's prop interface."

**Show on screen:**
Open `components/ui/Button.tsx`:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button text or content */
  label?: React.ReactNode;

  /** Visual style variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Show loading state */
  isLoading?: boolean;

  /** Icon displayed before text */
  icon?: React.ReactNode;

  /** Full width button */
  fullWidth?: boolean;
}
```

**Narration:**
"Every prop is documented with JSDoc comments. This provides:

1. IDE autocomplete - as you type, you see suggestions
2. Type checking - if you try to use `variant="invalid"`, TypeScript catches it
3. Self-documenting code - the interface explains everything
4. Better refactoring - renaming a prop updates all usages

This means developers can build with confidence, knowing they're using components correctly."

**Show on screen:**

- In VS Code, type `<Button variant="` and show autocomplete suggestions
- TypeScript only suggests valid variants: primary, secondary, success, danger, neutral

---

## Scene 11: Reflection & Key Takeaways (1 minute)

**Narration:**
"Let me share some key insights about this component architecture:

**Productivity Impact:**
Creating a component once and reusing it 20 times across the app saves hundreds of hours. Instead of rebuilding buttons and forms on every page, developers focus on business logic.

**Design Consistency:**
Every button looks the same, every form input works the same way, every card has the same proportions. Users get a cohesive experience, and the app feels professional and polished.

**Scalability:**
This architecture scales from 10 pages to 1000+ pages without changing the structure. As the team grows, everyone follows the same patterns.

**Accessibility:**
By building accessibility into components, every page in the app becomes accessible. It's not something we add later - it's fundamental to the design.

**Maintenance:**
When we find a bug in a component, we fix it once and the fix applies everywhere. When we want to update the design, we change the component and the entire app updates instantly.

**Question to consider:** How does defining reusable layout components early in a project improve developer productivity and ensure long-term design consistency?

The answer is that you're not just building components - you're establishing the foundations of your entire system. Every decision you make in the first button component echoes across hundreds of uses. Getting it right from the start means less refactoring later, faster feature development, and a better user experience.

This is why investing in component architecture is one of the best decisions a team can make."

---

## Closing (30 seconds)

**Narration:**
"That's our component architecture in action! We have:

✅ Layout components for consistent page structure
✅ Reusable UI components with multiple variants
✅ Accessibility built in at the component level
✅ TypeScript for type safety
✅ Storybook for component documentation and testing
✅ A solid foundation for scaling the application

The components folder is where the magic happens - it's the shared language that the entire team speaks."

**Show on screen:**

- Quick montage of different pages
- Storybook homepage
- Component folder structure

---

## Additional Notes for Recording

**Audio:**

- Speak clearly and at moderate pace
- Pause between sections
- Use enthusiasm when explaining key concepts

**Visuals:**

- Zoom in VS Code for readability
- Use browser zoom if needed
- Highlight important code with comments
- Show cursor movements clearly

**Timing:**

- Total: 10-12 minutes
- Each scene: see duration above
- Allow 1-2 min buffer for transitions

**Software Needed:**

- VS Code or IDE
- Web browser (Chrome/Firefox)
- Node.js and npm
- Screen recording software (OBS, Loom, etc.)
- Audio recording (built-in or external mic)

**Pro Tips:**

- Do a dry run before recording
- Minimize distractions
- Close unnecessary browser tabs
- Disable notifications
- Use dark theme for better visuals
- Take breaks between scenes
