# Testing Setup Guide: Jest + React Testing Library

## Overview

This guide covers the complete Jest and React Testing Library setup for unit testing a Next.js application with enforced code coverage thresholds.

---

## Installation

### Install Dependencies

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

**Alternatively, for TypeScript projects:**

```bash
npm install --save-dev \
  jest \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  ts-jest \
  typescript
```

**Package Purpose:**
- `jest` - Test runner and assertion library
- `jest-environment-jsdom` - Simulates browser DOM in tests
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom matchers for DOM assertions
- `@testing-library/user-event` - Realistic user interaction simulation
- `@types/jest` - TypeScript definitions

---

## Configuration Files

### jest.config.js

The main Jest configuration using `next/jest` for Next.js compatibility:

**Location:** [jest.config.js](jest.config.js)

**Key Features:**
- **jsdom environment** - Simulates browser for React components
- **Next.js integration** - Uses `next/jest` to handle Next.js configuration
- **Coverage thresholds** - Enforces 80% minimum across all metrics
- **Path aliases** - Supports `@/` imports matching tsconfig
- **Coverage exclusions** - Excludes test files, configs, and Next.js special files
- **Reporters** - Generates text, LCOV, HTML, and JSON coverage reports

### jest.setup.js

Setup file that runs before each test suite:

**Location:** [jest.setup.js](jest.setup.js)

**Key Features:**
- Imports `@testing-library/jest-dom` matchers
- Mocks `next/navigation` router hooks
- Configures test environment variables
- Sets global test timeout

---

## Test Scripts

Add these scripts to your `package.json`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:ci": "jest --ci --coverage --maxWorkers=2"
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# CI mode (optimized for GitHub Actions)
npm run test:ci
```

---

## Sample Tests

### Utility Function Test

**File:** [lib/utils.test.ts](lib/utils.test.ts)

Example testing pure functions with multiple test cases:

```typescript
describe('Email Validation', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
  })
})
```

**Test Principles:**
- Use `describe()` to group related tests
- Use `it()` for individual test cases
- Test happy path, edge cases, and error cases
- One assertion focus per test (or logically grouped assertions)

### React Component Test

**File:** [components/Counter.test.tsx](components/Counter.test.tsx)

Example testing components with user interactions:

```typescript
describe('Counter Component', () => {
  it('should increment counter when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', {
      name: /increment by 1/i,
    })

    await user.click(incrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('1')
  })
})
```

**Testing Best Practices:**
- Use `userEvent.setup()` for realistic interactions
- Use semantic queries: `getByRole()`, `getByLabelText()`, `getByPlaceholderText()`
- Avoid implementation details like `getByTestId()` when possible
- Test behavior, not internal state

---

## Coverage Reports

### Generating Coverage

```bash
npm run test:coverage
```

Generates reports in `coverage/` directory:
- `lcov-report/index.html` - Interactive HTML report
- `coverage-summary.json` - Machine-readable summary
- `lcov.info` - LCOV format for CI tools

### Viewing HTML Report

```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

---

## Coverage Thresholds

### Why 80% Coverage?

1. **Catches Real Bugs** - Research shows 80% coverage catches ~98% of defects
2. **Prevents Regression** - Protects against breaking changes during refactors
3. **Documents Behavior** - Tests serve as executable documentation
4. **Team Standard** - Enforces consistent code quality across the project
5. **Balance** - 80% is achievable while not being overly burdensome

### Coverage Metrics

| Metric | Measures | Importance |
|--------|----------|-----------|
| **Lines** | Code lines executed | Basic coverage |
| **Statements** | Code statements executed | Functional coverage |
| **Functions** | Functions called | API coverage |
| **Branches** | If/else conditions tested | Logic completeness |

### Viewing Thresholds

Configured in [jest.config.js](jest.config.js#L35-L42):

```javascript
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

**Enforcement:** Build fails if any metric drops below 80%

---

## Unit Testing in the Testing Pyramid

```
           ╱╲              E2E Tests (5-10%)
          ╱  ╲             - Slow & Brittle
         ╱────╲            - Real user flows
        ╱      ╲
       ╱        ╲           Integration (15-25%)
      ╱__________╲          - Component interactions
     ╱            ╲
    ╱              ╲        Unit Tests (60-80%) ← We focus here
   ╱________________╲       - Fast & Reliable
```

### Why Unit Tests Are Critical

**Foundation of the Pyramid:**
- ✅ **Fast** - Run in milliseconds
- ✅ **Reliable** - No flaky tests
- ✅ **Isolated** - Test one thing at a time
- ✅ **Maintainable** - Easy to write and update

**Enable Higher Levels:**
- Well-tested units make integration tests reliable
- Solid unit coverage reduces E2E test count needed
- Fast feedback loop accelerates development

---

## GitHub Actions CI Integration

### Workflow File

**Location:** [.github/workflows/test.yml](.github/workflows/test.yml)

Automatically runs tests on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Features

1. **Multi-version testing** - Tests Node.js 18.x and 20.x
2. **Coverage enforcement** - Fails build if thresholds not met
3. **PR comments** - Posts coverage report on pull requests
4. **Codecov integration** - Optional coverage tracking

### Coverage Check Script

```bash
npm run test:ci
```

This command:
- Runs Jest in CI mode
- Generates coverage report
- Enforces 80% threshold for all metrics
- Fails build if thresholds are breached

---

## Best Practices

### DO ✅

```typescript
// Test user behavior
it('should show error when form is submitted with invalid email', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  await user.type(screen.getByLabelText(/email/i), 'invalid')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})
```

### DON'T ❌

```typescript
// Don't test internal state
it('should set error state', () => {
  const wrapper = shallow(<LoginForm />)
  expect(wrapper.state('hasError')).toBe(true)
})

// Don't test implementation
it('should call handleSubmit method', () => {
  const spy = jest.spyOn(LoginForm.prototype, 'handleSubmit')
  // ...
})
```

### Semantic Query Preference

```typescript
// BEST - Accessible
screen.getByRole('button', { name: /submit/i })

// GOOD - Labeled element
screen.getByLabelText(/email/i)

// ACCEPTABLE - Placeholder
screen.getByPlaceholderText(/search/i)

// LAST RESORT - Test ID
screen.getByTestId('submit-button')
```

---

## Troubleshooting

### Tests Fail with Module Import Errors

```bash
# Clear Jest cache
npx jest --clearCache
npm test
```

### Coverage Shows 0% or Files Missing

```bash
# Verify collectCoverageFrom paths in jest.config.js
# Re-run coverage generation
npm run test:coverage
```

### "Cannot find module '@testing-library/jest-dom'"

```bash
# Ensure jest.setup.js imports it
# Check that setupFilesAfterEnv is configured in jest.config.js
npm install --save-dev @testing-library/jest-dom
```

### Next.js Router Errors in Tests

Already handled in [jest.setup.js](jest.setup.js) - mocks `next/navigation` hooks.

---

## CLI Commands Quick Reference

```bash
# Install dependencies (JavaScript)
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install dependencies (TypeScript)
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-jest

# Run tests
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
npm run test:ci            # CI mode

# Clear cache
npx jest --clearCache

# View coverage report
open coverage/lcov-report/index.html
```

---

## File Structure

```
startupdiscovery/
├── jest.config.js                      # Main Jest config
├── jest.setup.js                       # Test setup & mocks
├── lib/
│   ├── utils.ts                        # Utility functions
│   └── utils.test.ts                   # Utility tests
├── components/
│   ├── Counter.tsx                     # React component
│   └── Counter.test.tsx                # Component tests
└── .github/
    └── workflows/
        └── test.yml                    # CI configuration
```

---

## Next Steps

1. **Install dependencies** - Run the npm install command for your project type
2. **Run tests** - Execute `npm test` to verify setup
3. **Write tests** - Create tests for your components and utilities
4. **Monitor coverage** - Run `npm run test:coverage` regularly
5. **Maintain threshold** - Keep coverage at or above 80%
6. **Review PR coverage** - Check GitHub Actions coverage reports on PRs

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status:** ✅ Production Ready | **Coverage Threshold:** 80% | **Pyramid:** Unit Tests Focus
