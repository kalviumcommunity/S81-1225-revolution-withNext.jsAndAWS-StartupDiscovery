# Quick Reference - Code Quality Commands

## Daily Development Commands

```bash
# Start development server
npm run dev

# Before committing - run these checks
npm run type-check    # Check TypeScript types
npm run lint          # Check for lint errors
npm run format:check  # Check code formatting

# Auto-fix issues
npm run lint:fix      # Fix lint errors automatically
npm run format        # Format all files

# Build for production
npm run build
```

## Git Workflow

```bash
# Normal workflow - hooks run automatically
git add .
git commit -m "your message"
# ↑ Pre-commit hook runs automatically:
#   1. Runs ESLint --fix on staged files
#   2. Runs Prettier --write on staged files
#   3. Commits only if all checks pass

# Emergency bypass (NOT RECOMMENDED)
git commit --no-verify -m "message"
```

## Common Scenarios

### Scenario 1: Unused Variable Warning

```typescript
// ❌ This will warn
const unused = "value";

// ✅ Remove or use it
console.log("value");
```

### Scenario 2: Console Statement

```typescript
// ⚠️ Warning (allowed but discouraged)
console.log("debug");

// ✅ Better - use proper logging
import { logger } from "@/lib/logger";
logger.debug("debug");
```

### Scenario 3: Implicit Any

```typescript
// ❌ Error - implicit any
function process(data) {
  return data.value;
}

// ✅ Add type annotation
function process(data: { value: string }) {
  return data.value;
}
```

### Scenario 4: Formatting Issues

```typescript
// ❌ Wrong quotes and spacing
const obj = { name: "test", value: 123 };

// ✅ Auto-fixed by Prettier
const obj = { name: "test", value: 123 };
```

## File Overview

- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `tsconfig.json` - TypeScript compiler options
- `.husky/pre-commit` - Git hook that runs lint-staged
- `package.json` - Scripts and lint-staged config

## Troubleshooting

### Husky not running?

```bash
npx husky install
```

### ESLint errors on legacy files?

```bash
npm run lint:fix
```

### Prettier conflicts with ESLint?

Already configured! `eslint-config-prettier` disables conflicting rules.

### Need to skip hooks temporarily?

```bash
git commit --no-verify
# Only use in emergencies!
```

## VS Code Integration (Optional)

Install these extensions for real-time feedback:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

**Need help?** Check `CODE_QUALITY.md` for detailed explanations.
