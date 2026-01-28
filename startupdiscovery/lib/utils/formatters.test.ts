import {
  formatUserName,
  isValidEmail,
  calculatePercentage,
} from './formatters'

describe('formatUserName', () => {
  it('should format full name correctly', () => {
    expect(formatUserName('John', 'Doe')).toBe('John Doe')
  })

  it('should return first name only when last name is empty', () => {
    expect(formatUserName('John', '')).toBe('John')
  })

  it('should return last name only when first name is empty', () => {
    expect(formatUserName('', 'Doe')).toBe('Doe')
  })

  it('should return "Anonymous" when both names are empty', () => {
    expect(formatUserName('', '')).toBe('Anonymous')
  })

  it('should uppercase the name when uppercase option is true', () => {
    expect(formatUserName('John', 'Doe', { uppercase: true })).toBe('JOHN DOE')
  })

  it('should include initial when includeInitial option is true', () => {
    expect(formatUserName('John', 'Doe', { includeInitial: true })).toBe(
      'John D.'
    )
  })

  it('should handle both uppercase and includeInitial options', () => {
    expect(
      formatUserName('John', 'Doe', { uppercase: true, includeInitial: true })
    ).toBe('JOHN D.')
  })
})

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true)
    expect(isValidEmail('user_name@example-domain.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid@domain')).toBe(false)
    expect(isValidEmail('invalid @example.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50)
    expect(calculatePercentage(1, 3)).toBe(33.33)
    expect(calculatePercentage(2, 3)).toBe(66.67)
  })

  it('should return 0 when total is 0', () => {
    expect(calculatePercentage(10, 0)).toBe(0)
  })

  it('should handle values greater than total', () => {
    expect(calculatePercentage(150, 100)).toBe(150)
  })

  it('should handle decimal inputs', () => {
    expect(calculatePercentage(0.5, 1)).toBe(50)
    expect(calculatePercentage(1.5, 3)).toBe(50)
  })

  it('should round to 2 decimal places', () => {
    expect(calculatePercentage(1, 6)).toBe(16.67)
    expect(calculatePercentage(5, 7)).toBe(71.43)
  })
})
