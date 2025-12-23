# Branch Protection Rules

Branch protection rules are GitHub settings that enforce quality standards and prevent accidental or unauthorized changes to critical branches like `main`.

## 🛡️ Why Protect Branches?

Branch protection ensures:
- **Code quality** through mandatory reviews
- **Stability** by preventing direct pushes
- **Collaboration** by enforcing PR workflow
- **Safety** against accidental deletions or force pushes

---

## 🔧 How to Set Up Branch Protection

### Step 1: Navigate to Settings

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Select **Branches** from the left sidebar
4. Click **Add rule** under "Branch protection rules"

### Step 2: Configure Protection Rules

Enter `main` as the branch name pattern, then enable the following rules:

---

## 📋 Recommended Protection Rules

### 1. ✅ Require Pull Request Reviews Before Merging

**What it does:**
- Forces all changes to go through a Pull Request
- Requires at least one team member to approve before merging
- Prevents solo developers from merging their own PRs without review

**Why it's important:**
- **Catches bugs early** - Fresh eyes spot issues you might miss
- **Knowledge sharing** - Team members learn from each other's code
- **Maintains standards** - Ensures code follows project conventions
- **Reduces errors** - Two pairs of eyes are better than one

**Settings:**
- ✅ Require approvals: **1** (or more for larger teams)
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from code owners (if using CODEOWNERS file)

---

### 2. ✅ Require Status Checks to Pass Before Merging

**What it does:**
- Runs automated checks (build, lint, tests) before allowing merge
- Ensures code builds successfully
- Verifies linting rules are followed

**Why it's important:**
- **Prevents broken code** from reaching main branch
- **Automates quality checks** - No manual verification needed
- **Catches errors instantly** - Failed builds block merging
- **Enforces standards** - ESLint violations can't be merged

**Settings:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Select status checks: 
  - Build check (from GitHub Actions or CI/CD)
  - Lint check
  - Any other automated tests

---

### 3. ✅ Require Branches to be Up to Date Before Merging

**What it does:**
- Forces branches to include latest changes from `main` before merging
- Prevents merge conflicts and integration issues

**Why it's important:**
- **Avoids conflicts** - Ensures your changes work with latest code
- **Prevents breaking changes** - Tests run against current codebase
- **Smooth integration** - Reduces post-merge issues

**How it works:**
1. Your PR is ready
2. Someone else merges their PR to `main`
3. You must update your branch: `git merge main` or `git rebase main`
4. Status checks run again on updated branch
5. Then you can merge

---

### 4. ✅ Do Not Allow Direct Pushes to Main

**What it does:**
- Blocks `git push origin main` commands
- Forces all changes through Pull Requests

**Why it's important:**
- **Enforces PR workflow** - No bypassing the review process
- **Protects stability** - Main branch always contains reviewed code
- **Creates history** - Every change is documented in a PR
- **Prevents accidents** - Can't accidentally push broken code

---

### 5. ✅ Require Linear History (Optional but Recommended)

**What it does:**
- Enforces squash merging or rebasing
- Prevents merge commits from cluttering history

**Why it's important:**
- **Clean history** - Easy to understand project evolution
- **Easier rollbacks** - Simple to revert specific features
- **Professional standard** - Industry best practice

---

### 6. ✅ Include Administrators

**What it does:**
- Applies protection rules even to repository administrators
- No one can bypass the rules

**Why it's important:**
- **Consistency** - Same rules for everyone
- **Accountability** - Even leads follow the process
- **Safety net** - Protects against admin mistakes

---

## 🎯 Complete Protection Setup Summary

Here's what your branch protection for `main` should look like:

```
Branch name pattern: main

☑️ Require a pull request before merging
   ☑️ Require approvals: 1
   ☑️ Dismiss stale pull request approvals when new commits are pushed
   
☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   Status checks that are required:
     - Build
     - Lint
     
☑️ Require conversation resolution before merging

☑️ Do not allow bypassing the above settings

☑️ Restrict who can push to matching branches
   (Only allow PRs, no direct pushes)
```

---

## 🔄 Workflow with Branch Protection

### Before Protection:
```bash
# ❌ This worked (but is risky):
git checkout main
git add .
git commit -m "quick fix"
git push origin main  # Directly to main - no review!
```

### After Protection:
```bash
# ✅ This is required:
git checkout -b fix/navbar-bug
git add .
git commit -m "Fix navbar bug"
git push origin fix/navbar-bug
# Then create PR on GitHub → Get review → Merge
```

---

## 📊 Benefits in Practice

| Without Protection | With Protection |
|-------------------|-----------------|
| Bugs slip into production | Bugs caught in review |
| Inconsistent code style | ESLint enforced automatically |
| No documentation of changes | Every change documented in PRs |
| Unclear who changed what | Clear authorship and approval |
| Broken builds on main | Main always builds successfully |

---

## 🚨 Common Questions

**Q: What if I need to push urgently?**
**A:** Branch protection doesn't slow you down - create a PR and get a quick review. For true emergencies, you can temporarily disable protection (not recommended).

**Q: Can I merge my own PR?**
**A:** Only after someone else approves it. This ensures code review quality.

**Q: What if status checks fail?**
**A:** Fix the issues in your branch, push again, and checks will re-run. You cannot merge until they pass.

**Q: Do I need this for a solo project?**
**A:** Yes! It builds good habits and prevents mistakes. Plus, it's required for professional portfolios and team projects.

---

## 📸 Evidence to Capture

For your Kalvium submission, screenshot:
1. ✅ Branch protection rules page (Settings → Branches)
2. ✅ A PR showing "Merging is blocked" until checks pass
3. ✅ A PR showing "1 approval required" status
4. ✅ Successfully merged PR with all checks passed

---

By implementing these protection rules, you create a professional development environment that maintains code quality, encourages collaboration, and prevents costly mistakes.
