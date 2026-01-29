# Unit Testing Guide

## Overview

This project uses **Jest** and **React Testing Library (RTL)** for comprehensive unit testing. Our testing strategy follows industry best practices with enforced code coverage thresholds to maintain high code quality.

---

## Why Unit Testing Matters

Unit testing is a critical foundation of software quality for several reasons:

### 1. **Early Bug Detection**
Tests catch bugs during development, before they reach production. This is dramatically cheaper than fixing bugs found by users.

### 2. **Code Confidence**
A robust test suite gives developers confidence to refactor and add features without breaking existing functionality.

### 3. **Living Documentation**
Well-written tests serve as executable documentation, showing how code is intended to be used.

### 4. **Faster Development**
While writing tests takes time upfront, it speeds up development by reducing debugging time and preventing regressions.

### 5. **Better Architecture**
Code that's easy to test is usually well-designed. Writing tests encourages modular, loosely-coupled code.

---

## Testing Pyramid

Our testing strategy follows the **Testing Pyramid** pattern:

\`\`\`
           /\\
          /  \\         E2E Tests (Few)
         /____\\        - Slow, expensive, brittle
        /      \\       - Test critical user flows
       /        \\      - ~10% of tests
      /__________\\
     /            \\    Integration Tests (Some)
    /              \\   - Test component interactions
   /________________\\  - ~30% of tests
  /                  \\ 
 /____________________\\ Unit Tests (Many)
                        - Fast, isolated, reliable
                        - Test individual functions/components
                        - ~60% of tests
\`\`\`

**This setup focuses on the pyramid's base: Unit Tests**

- **Fast execution** - Run in milliseconds
- **Isolated** - Test one thing at a time
- **Reliable** - No flaky tests
- **High coverage** - 80%+ threshold enforced

---

## Installation

Install all required testing dependencies:

\`\`\`bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
\`\`\`

**What each package does:**
- \`jest\` - Test runner and assertion library
- \`jest-environment-jsdom\` - Browser-like environment for React tests
- \`@testing-library/react\` - React component testing utilities
- \`@testing-library/jest-dom\` - Custom Jest matchers for DOM assertions
- \`@testing-library/user-event\` - Simulate user interactions

---

## Running Tests

### Development Mode

\`\`\`bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (optimized for CI/CD)
npm run test:ci
\`\`\`

### Watch Mode Shortcuts

When running \`npm run test:watch\`:
- Press \`a\` to run all tests
- Press \`f\` to run only failed tests
- Press \`p\` to filter by filename pattern
- Press \`t\` to filter by test name pattern
- Press \`q\` to quit

---

## Coverage Thresholds

### Why Coverage Thresholds Matter

Coverage thresholds act as a **quality gate** that protects your codebase:

1. **Prevent Regression** - New code without tests is blocked
2. **Enforce Standards** - Team maintains consistent quality bar
3. **Identify Gaps** - Highlights untested code paths
4. **Build Confidence** - High coverage correlates with fewer bugs

### Our Thresholds

All metrics must maintain **≥80% coverage**:

| Metric | Threshold | What It Measures |
|--------|-----------|------------------|
| **Lines** | 80% | Percentage of code lines executed |
| **Statements** | 80% | Percentage of statements executed |
| **Functions** | 80% | Percentage of functions called |
| **Branches** | 80% | Percentage of conditional branches tested |

**Note:** 80% is a production-ready standard. Teams can adjust based on project criticality.

### Checking Coverage

\`\`\`bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
\`\`\`

The report shows:
- ✅ Green files - Above threshold
- 🟡 Yellow files - Close to threshold
- ❌ Red files - Below threshold (build will fail)

---

## Configuration Files

### \`jest.config.js\`
Main Jest configuration using \`next/jest\` for Next.js compatibility:
- **Environment:** jsdom (simulates browser)
- **Coverage paths:** Includes app/, components/, lib/, etc.
- **Exclusions:** Test files, config files, Next.js special files
- **Thresholds:** 80% for all metrics

### \`jest.setup.js\`
Setup file that runs before all tests:
- Imports RTL custom matchers (\`@testing-library/jest-dom\`)
- Mocks Next.js router
- Configures test environment

---

## Example Tests

### Utility Function Test
See [lib/utils/formatters.test.ts](lib/utils/formatters.test.ts)

**Key patterns:**
- \`describe()\` groups related tests
- \`it()\` defines individual test cases
- \`expect()\` makes assertions
- Test edge cases (empty inputs, boundary values)

### React Component Test
See [components/Counter.test.tsx](components/Counter.test.tsx)

**Key patterns:**
- Use \`render()\` to mount components
- Use \`screen.getByRole()\` for accessible queries
- Use \`userEvent\` for realistic interactions
- Test user flows, not implementation details

---

## Writing Good Tests

### ✅ DO

\`\`\`tsx
// Test behavior, not implementation
it('should show error when email is invalid', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  await user.type(screen.getByLabelText(/email/i), 'invalid')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})
\`\`\`

### ❌ DON'T

\`\`\`tsx
// Don't test implementation details
it('should set error state to true', () => {
  const wrapper = shallow(<LoginForm />)
  wrapper.setState({ email: 'invalid' })
  
  expect(wrapper.state('hasError')).toBe(true) // Testing internal state
})
\`\`\`

### Best Practices

1. **Use semantic queries:** Prefer \`getByRole\`, \`getByLabelText\` over \`getByTestId\`
2. **Test user interactions:** Use \`@testing-library/user-event\`, not \`fireEvent\`
3. **Avoid implementation details:** Don't test state, props, or class names
4. **One assertion per test:** Keep tests focused and simple
5. **Descriptive test names:** Use "should [expected behavior] when [condition]"

---

## CI/CD Integration

### GitHub Actions

The [.github/workflows/test.yml](.github/workflows/test.yml) workflow:

1. **Runs on:** Push to main/develop, all pull requests
2. **Matrix testing:** Node.js 18.x and 20.x
3. **Steps:**
   - Lint code
   - Type check
   - Run tests with coverage
   - Enforce 80% threshold
   - Upload coverage to Codecov
   - Comment PR with coverage report

### Failing Builds

**Builds fail when:**
- Any test fails
- Coverage drops below 80% for any metric
- Linting errors exist
- Type errors exist

This ensures only high-quality code reaches production.

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "Cannot find module"
\`\`\`bash
# Clear Jest cache
npx jest --clearCache
npm test
\`\`\`

**Issue:** Coverage shows 0% or missing files
\`\`\`bash
# Ensure jest.config.js has correct collectCoverageFrom paths
# Re-run with --coverage flag
npm run test:coverage
\`\`\`

**Issue:** Next.js router errors in tests
\`\`\`bash
# Ensure jest.setup.js mocks next/navigation
# Already configured in this project
\`\`\`

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)
- [Kent C. Dodds - Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Quick Command Reference

\`\`\`bash
# Install dependencies
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run tests
npm test                  # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:ci           # CI mode

# View coverage
open coverage/lcov-report/index.html

# Clear cache
npx jest --clearCache
\`\`\`

---

## Summary

✅ **Jest + RTL configured for Next.js**  
✅ **80% coverage thresholds enforced**  
✅ **Sample tests provided**  
✅ **CI/CD pipeline integrated**  
✅ **Best practices documented**

**Next steps:**
1. Install dependencies
2. Run \`npm test\` to verify setup
3. Write tests for your components
4. Maintain 80%+ coverage
