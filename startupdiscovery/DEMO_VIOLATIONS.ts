// This file demonstrates lint and format violations
// Run: npm run lint
// Run: npm run format
// Try to commit this file to see pre-commit hooks in action

export function exampleFunction() {
  console.log('This will trigger a warning')
  const unusedVariable = 'This will trigger an error'
  return 'test'
}

// Uncomment to test implicit any error:
// export function badFunction(data) {
//   return data.value
// }
