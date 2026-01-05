# Installation Commands Summary

## If Setting Up From Scratch

Run these commands in order:

```bash
# 1. Install ESLint and Prettier
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier

# 2. Install Husky and lint-staged
npm install --save-dev husky lint-staged

# 3. Initialize Husky
npx husky init

# 4. All done! Verify installation
npm run lint
npm run format
npm run type-check
```

## What Gets Installed

### ESLint & Prettier

- `prettier@^3.7.4` - Code formatter
- `eslint-plugin-prettier@^5.5.4` - Runs Prettier as ESLint rule
- `eslint-config-prettier@^10.1.8` - Disables conflicting ESLint rules

### Pre-commit Hooks

- `husky@^9.1.7` - Git hooks manager
- `lint-staged@^16.2.7` - Run linters on staged files

## Files Created/Modified

### Created

- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore in formatting
- `.husky/pre-commit` - Pre-commit hook script
- `CODE_QUALITY.md` - Full documentation
- `SETUP_SUMMARY.md` - Setup verification
- `QUICK_REFERENCE.md` - Daily command reference
- `DEMO_VIOLATIONS.ts` - Testing file

### Modified

- `tsconfig.json` - Added strict TypeScript options
- `package.json` - Added scripts and lint-staged config

## Verification

```bash
# Check all installations
npm list eslint prettier husky lint-staged

# Test the setup
npm run lint
npm run format
npm run type-check

# Test pre-commit hook
git add .
git commit -m "test setup"
```

## Total Install Size

Approximately **30-40 MB** of dev dependencies added.

## No Breaking Changes

All changes are backward compatible with existing Next.js setup.

---

**Setup complete!** Read `CODE_QUALITY.md` for usage guide.
