# Code Review Checklist

Use this checklist when reviewing pull requests to ensure consistent code quality and standards.

## 🔍 Code Quality & Structure

- [ ] **Code is readable and well-organized**
  - Clear variable and function names
  - Logical file and folder structure
  - Follows Next.js conventions (app router structure)

- [ ] **No code duplication**
  - Repeated logic is extracted into reusable functions/components
  - DRY (Don't Repeat Yourself) principle followed

- [ ] **Proper component structure**
  - Components are appropriately sized (not too large)
  - Single responsibility principle followed
  - Props are properly typed with TypeScript

- [ ] **TypeScript usage**
  - No `any` types (unless absolutely necessary and documented)
  - Interfaces/types are well-defined
  - Type safety maintained throughout

## ✅ Functionality Verification

- [ ] **Changes work as intended**
  - Feature works according to requirements
  - Bug fix resolves the issue without side effects
  - No new bugs introduced

- [ ] **Edge cases handled**
  - Error states considered
  - Loading states implemented (if applicable)
  - Empty states handled gracefully

- [ ] **User experience**
  - UI is responsive and accessible
  - Interactions are intuitive
  - No performance degradation

## 🧹 Code Standards

- [ ] **ESLint checks pass**
  - Run `npm run lint` with no errors
  - No ESLint disable comments without good reason

- [ ] **Prettier formatting applied**
  - Code is consistently formatted
  - No unnecessary formatting changes

- [ ] **Build succeeds**
  - Run `npm run build` successfully
  - No build warnings or errors

- [ ] **No console warnings/errors**
  - Browser console is clean
  - No unhandled promise rejections
  - No React warnings (keys, hooks rules, etc.)

## 🔒 Security & Best Practices

- [ ] **No exposed secrets**
  - API keys, tokens, passwords not in code
  - Environment variables used correctly
  - `.env` files not committed

- [ ] **Secure coding practices**
  - User inputs are validated/sanitized
  - No potential XSS vulnerabilities
  - Dependencies are up-to-date and safe

## 📝 Documentation & Comments

- [ ] **Code is self-documenting**
  - Complex logic has explanatory comments
  - Function purposes are clear
  - Magic numbers/strings are explained

- [ ] **PR description is complete**
  - Summary explains what and why
  - Screenshots/evidence provided
  - Testing approach documented

- [ ] **README updated (if needed)**
  - New features documented
  - Setup instructions current
  - Dependencies listed

## 🔗 Process Compliance

- [ ] **Branch naming follows convention**
  - `feature/`, `fix/`, `chore/`, or `docs/` prefix
  - Descriptive branch name

- [ ] **Commits are meaningful**
  - Clear commit messages
  - Logical commit organization
  - No unnecessary commits

- [ ] **Related issue linked**
  - Issue number referenced in PR
  - Issue will be closed when PR merges

---

## Review Decision

After completing this checklist:

- ✅ **Approve** - All items checked, code is production-ready
- 💬 **Comment** - Minor suggestions, but generally good
- 🔄 **Request Changes** - Issues must be addressed before merging

## Tips for Effective Reviews

1. **Be constructive** - Suggest improvements, don't just criticize
2. **Explain why** - Help the author learn
3. **Test locally** - Don't just read code, run it
4. **Ask questions** - If something is unclear, ask
5. **Acknowledge good work** - Positive feedback matters
