# Branch Naming Conventions

This guide defines the branch naming strategy for the StartupDiscovery project. Following these conventions ensures clarity, organization, and smooth collaboration.

## 📋 Branch Naming Format

All branches should follow this pattern:

```
<type>/<descriptive-name>
```

- Use lowercase letters
- Separate words with hyphens (kebab-case)
- Keep names concise but descriptive
- Avoid special characters

---

## 🏷️ Branch Types

### 1. `feature/` - New Features

**Purpose:** Developing new functionality or enhancements

**Examples:**
```
feature/startup-listing-page
feature/search-filter
feature/user-authentication
feature/dark-mode
feature/ai-recommendation-engine
```

**When to use:**
- Adding new pages or components
- Implementing new user-facing features
- Building new API endpoints or services

---

### 2. `fix/` - Bug Fixes

**Purpose:** Fixing bugs, errors, or unexpected behavior

**Examples:**
```
fix/search-crash-on-empty-query
fix/navbar-mobile-overflow
fix/api-timeout-error
fix/image-loading-issue
fix/typescript-type-error
```

**When to use:**
- Resolving reported bugs
- Fixing console errors or warnings
- Correcting logic errors
- Addressing security vulnerabilities

---

### 3. `chore/` - Maintenance Tasks

**Purpose:** Routine tasks, refactoring, dependency updates, tooling

**Examples:**
```
chore/update-dependencies
chore/refactor-api-calls
chore/setup-eslint
chore/cleanup-unused-components
chore/optimize-build-config
```

**When to use:**
- Updating packages or dependencies
- Refactoring code without changing functionality
- Improving code organization
- Setting up development tools
- Performance optimizations

---

### 4. `docs/` - Documentation

**Purpose:** Documentation updates, comments, guides

**Examples:**
```
docs/update-readme
docs/add-api-documentation
docs/setup-instructions
docs/code-review-process
docs/deployment-guide
```

**When to use:**
- Updating README files
- Adding code comments
- Creating guides or documentation
- Updating contribution guidelines

---

## 🎯 Best Practices

### ✅ Good Branch Names

```
feature/investor-dashboard
fix/navbar-dropdown-mobile
chore/migrate-to-app-router
docs/add-contributing-guide
```

**Why they're good:**
- Clear purpose indicated by type
- Descriptive and specific
- Easy to understand at a glance

### ❌ Bad Branch Names

```
new-stuff
fix-bug
update
tony-branch
test123
```

**Why they're bad:**
- No type prefix
- Too vague or generic
- Not descriptive
- Personal names (not about the work)

---

## 🔄 Workflow Example

1. **Create a new branch from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/startup-details-page
   ```

2. **Work on your changes and commit:**
   ```bash
   git add .
   git commit -m "Add startup details page with overview section"
   ```

3. **Push your branch:**
   ```bash
   git push origin feature/startup-details-page
   ```

4. **Create a Pull Request** on GitHub to merge into `main`

5. **After PR is merged, delete the branch:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/startup-details-page
   ```

---

## 🚀 Quick Reference

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New functionality | `feature/email-notifications` |
| `fix/` | Bug fixes | `fix/broken-link-homepage` |
| `chore/` | Maintenance | `chore/update-next-version` |
| `docs/` | Documentation | `docs/setup-guide` |

---

## 💡 Tips

- **Be specific:** `feature/add-search` is better than `feature/search`
- **Use issue numbers:** `fix/navbar-issue-42` links to GitHub issue #42
- **Keep it short:** Aim for 2-4 words after the type prefix
- **Think of others:** Your branch name should make sense to your teammates

---

By following these conventions, we maintain a clean, organized repository that's easy to navigate and understand.
