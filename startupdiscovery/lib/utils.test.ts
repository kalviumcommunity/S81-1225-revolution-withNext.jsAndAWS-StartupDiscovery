import {
  isValidEmail,
  formatUserName,
  calculatePercentage,
  truncateText,
} from './utils'

describe('Email Validation', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('john.doe+tag@company.co.uk')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

describe('Format User Name', () => {
  it('should format full name correctly', () => {
    expect(formatUserName('John', 'Doe')).toBe('John Doe')
  })

  it('should handle missing first name', () => {
    expect(formatUserName('', 'Doe')).toBe('Doe')
  })

  it('should handle missing last name', () => {
    expect(formatUserName('John', '')).toBe('John')
  })

  it('should return "Anonymous" when both names are empty', () => {
    expect(formatUserName('', '')).toBe('Anonymous')
  })

  it('should support uppercase option', () => {
    expect(formatUserName('John', 'Doe', { uppercase: true })).toBe('JOHN DOE')
  })

  it('should support initial option', () => {
    expect(formatUserName('John', 'Doe', { includeInitial: true })).toBe('John D.')
  })

  it('should combine uppercase and initial options', () => {
    expect(
      formatUserName('John', 'Doe', { uppercase: true, includeInitial: true })
    ).toBe('JOHN D.')
  })
})

describe('Calculate Percentage', () => {
  it('should calculate percentages correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50)
    expect(calculatePercentage(1, 3)).toBe(33.33)
    expect(calculatePercentage(2, 3)).toBe(66.67)
  })

  it('should handle zero total', () => {
    expect(calculatePercentage(10, 0)).toBe(0)
  })

  it('should handle values greater than total', () => {
    expect(calculatePercentage(150, 100)).toBe(150)
  })

  it('should round to 2 decimal places', () => {
    expect(calculatePercentage(1, 6)).toBe(16.67)
    expect(calculatePercentage(5, 7)).toBe(71.43)
  })
})

describe('Truncate Text', () => {
  it('should return full text if shorter than max length', () => {
    expect(truncateText('Hi', 10)).toBe('Hi')
  })

  it('should truncate text and add ellipsis', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...')
  })

  it('should truncate exactly at max length', () => {
    expect(truncateText('Hello World', 11)).toBe('Hello World')
  })

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })

  it('should handle text exactly matching max length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello')
  })
})
