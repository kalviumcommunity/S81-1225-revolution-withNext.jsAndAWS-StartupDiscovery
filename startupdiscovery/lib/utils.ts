/**
 * Utility function to validate if an email address has valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Utility function to format a user's display name
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
 * Utility function to calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0
  }
  return Math.round((value / total) * 100 * 100) / 100
}

/**
 * Utility function to truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.substring(0, maxLength)}...`
}
