# Evidence & Documentation Guide

This guide explains what screenshots, logs, and documentation you need to capture for your Kalvium assignment submission to demonstrate your GitHub workflow implementation.

## 📸 Required Evidence

### 1. Branch Protection Settings

**What to capture:**
Screenshot of your branch protection rules configuration

**How to get it:**
1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Show the protection rules for `main` branch
4. Capture the full rule configuration

**What should be visible:**
- ✅ "Require a pull request before merging" enabled
- ✅ "Require approvals: 1" configured
- ✅ "Require status checks to pass" enabled
- ✅ Selected status checks (build, lint)
- ✅ "Require branches to be up to date" checked

**File name:** `evidence/branch-protection-rules.png`

---

### 2. Pull Request with Checks Running/Passed

**What to capture:**
Screenshot of a Pull Request showing automated status checks

**How to get it:**
1. Create a feature branch and make changes
2. Push to GitHub and create a PR
3. Wait for status checks to run
4. Take screenshot showing checks status

**What should be visible:**
- PR title and description (from template)
- Status checks section showing:
  - "Some checks haven't completed yet" (running), or
  - "All checks have passed" (completed)
- Individual check results (build ✅, lint ✅)
- Branch name following naming convention
- "Merging is blocked" message (if checks haven't passed yet)

**File names:** 
- `evidence/pr-checks-running.png`
- `evidence/pr-checks-passed.png`

---

### 3. Code Review Approval

**What to capture:**
Screenshot showing PR approval from a reviewer

**How to get it:**
1. Have a teammate review your PR (or self-review for solo projects)
2. Reviewer clicks "Review changes" → "Approve"
3. Capture the PR page with approval

**What should be visible:**
- Reviewer's approval comment
- "✅ Approved" badge
- Reviewer's username and timestamp
- PR conversation/review tab active
- Review comments (if any)

**File name:** `evidence/pr-approval.png`

---

### 4. Successful Merge

**What to capture:**
Screenshot of successfully merged PR

**How to get it:**
1. After approval and passing checks, click "Merge pull request"
2. Confirm merge
3. Capture the merged PR page

**What should be visible:**
- Purple "Merged" badge
- "Pull request successfully merged and closed"
- Who merged it and when
- Delete branch prompt/confirmation
- Commit message

**File name:** `evidence/pr-merged.png`

---

### 5. Pull Request Template in Use

**What to capture:**
Screenshot showing PR template automatically loaded

**How to get it:**
1. Create a new PR
2. Before filling anything, capture the PR creation screen
3. Show the template sections pre-filled

**What should be visible:**
- PR description field with template structure
- Summary, Changes Made, Checklist sections
- Template markdown visible
- "Write" vs "Preview" tabs

**File name:** `evidence/pr-template-loaded.png`

---

### 6. Branch Naming Convention Examples

**What to capture:**
Screenshot of your repository's branch list showing consistent naming

**How to get it:**
1. Go to repository main page
2. Click branch dropdown
3. Show multiple branches following conventions

**What should be visible:**
- Multiple branches with clear prefixes:
  - `feature/startup-listing`
  - `fix/navbar-bug`
  - `chore/update-deps`
  - `docs/readme-update`
- Consistent naming pattern
- Active branch indicator

**File name:** `evidence/branch-naming.png`

---

### 7. Terminal/Git Commands

**What to capture:**
Screenshot of git commands in terminal showing workflow

**How to get it:**
```bash
# Run these commands and capture terminal output
git branch -a
git log --oneline --graph --all -10
```

**What should be visible:**
- Clean git history
- Branch structure
- Commit messages following conventions
- Merge commits from PRs

**File name:** `evidence/git-workflow.png`

---

### 8. ESLint/Build Success

**What to capture:**
Terminal output showing successful lint and build

**How to get it:**
```bash
npm run lint
npm run build
```

**What should be visible:**
- `npm run lint` with no errors
- `npm run build` completing successfully
- Build output summary
- No warnings or errors

**File names:**
- `evidence/lint-success.png`
- `evidence/build-success.png`

---

## 📁 Folder Structure for Evidence

Create this structure in your repository:

```
evidence/
├── branch-protection-rules.png
├── pr-checks-running.png
├── pr-checks-passed.png
├── pr-approval.png
├── pr-merged.png
├── pr-template-loaded.png
├── branch-naming.png
├── git-workflow.png
├── lint-success.png
└── build-success.png
```

---

## 📝 Additional Documentation

### README Section
Include in your main README.md:
- Brief overview of your GitHub workflow
- Links to `.github/` documentation files
- Reflection on how this improves your development process

### Submission Document
Create a document (PDF or Markdown) that includes:
1. **Introduction:** Purpose of the assignment
2. **Workflow Overview:** Brief explanation of your setup
3. **Screenshots:** All evidence images with captions
4. **Reflection:** What you learned and how it helps
5. **Conclusion:** Summary of benefits

---

## ✅ Checklist Before Submission

- [ ] All 8 required screenshots captured
- [ ] Screenshots are clear and readable
- [ ] Evidence folder created in repository
- [ ] README.md includes workflow documentation section
- [ ] All `.github/` files committed and pushed
- [ ] Branch protection rules are active
- [ ] At least 2-3 PRs created, reviewed, and merged
- [ ] Repository is public (for Kalvium to review)
- [ ] No sensitive information in screenshots

---

## 💡 Tips for Quality Evidence

1. **Use high resolution** - Screenshots should be clear and readable
2. **Highlight important parts** - Use arrows or boxes to draw attention
3. **Show timestamps** - Proves you did the work
4. **Include context** - Capture enough of the screen to show what's happening
5. **Be authentic** - Show real work, not staged screenshots
6. **Add captions** - Explain what each screenshot demonstrates

---

## 🎯 What Evaluators Look For

Your evidence should demonstrate:
- ✅ **Consistency** - Following conventions throughout
- ✅ **Completeness** - All workflow steps documented
- ✅ **Functionality** - Everything actually works
- ✅ **Professionalism** - Clean, organized, production-ready
- ✅ **Understanding** - Reflection shows you know why it matters

---

## 🚀 Going Beyond

Impress evaluators by also showing:
- GitHub Actions workflow file (CI/CD automation)
- Multiple team members collaborating
- Meaningful code review conversations
- Issue tracking linked to PRs
- Consistent commit message conventions

---

Good documentation and evidence aren't just for assignments - they're professional skills that showcase your work and help you build a strong portfolio!
