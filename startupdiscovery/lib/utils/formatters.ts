/**
 * Utility function to format a user's display name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param options - Optional formatting options
 * @returns Formatted display name
 */
export function formatUserName(
  firstName: string,
  lastName: string,
  options: { uppercase?: boolean; includeInitial?: boolean } = {}
): string {
  if (!firstName && !lastName) {
    return 'Anonymous'
  }

  if (!firstName) {
    return lastName
  }

  if (!lastName) {
    return firstName
  }

  const { uppercase = false, includeInitial = false } = options

  let displayName = includeInitial
    ? `${firstName} ${lastName.charAt(0)}.`
    : `${firstName} ${lastName}`

  return uppercase ? displayName.toUpperCase() : displayName
}

/**
 * Utility function to validate email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Utility function to calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage rounded to 2 decimal places
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0
  }
  return Math.round((value / total) * 100 * 100) / 100
}
