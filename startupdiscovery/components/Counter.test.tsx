import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

/**
 * Component Testing with React Testing Library
 * 
 * Key principles:
 * - Test user behavior, not implementation details
 * - Use semantic queries (getByRole, getByLabelText) when possible
 * - Use userEvent for realistic user interactions
 * - Test accessibility attributes
 */

describe('Counter Component', () => {
  it('should render with default initial count of 0', () => {
    render(<Counter />)

    expect(screen.getByRole('heading', { name: /count/i })).toBeInTheDocument()
    expect(screen.getByTestId('counter-display')).toHaveTextContent('0')
  })

  it('should render with custom initial count', () => {
    render(<Counter initialCount={42} />)

    expect(screen.getByTestId('counter-display')).toHaveTextContent('42')
  })

  it('should render with custom label', () => {
    render(<Counter label="Points" />)

    expect(screen.getByRole('heading', { name: /points/i })).toBeInTheDocument()
  })

  it('should increment counter when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', {
      name: /increment by 1/i,
    })

    await user.click(incrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('1')

    await user.click(incrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('2')
  })

  it('should decrement counter when − button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)

    const decrementButton = screen.getByRole('button', {
      name: /decrement by 1/i,
    })

    await user.click(decrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('4')

    await user.click(decrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('3')
  })

  it('should reset counter to initial value', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={10} />)

    const incrementButton = screen.getByRole('button', {
      name: /increment by 1/i,
    })
    const resetButton = screen.getByRole('button', { name: /reset/i })

    // Increment several times
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('13')

    // Reset should return to initial value
    await user.click(resetButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('10')
  })

  it('should respect custom step value', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} step={5} />)

    const incrementButton = screen.getByRole('button', {
      name: /increment by 5/i,
    })
    const decrementButton = screen.getByRole('button', {
      name: /decrement by 5/i,
    })

    await user.click(incrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('5')

    await user.click(incrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('10')

    await user.click(decrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('5')
  })

  it('should support negative counts', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} />)

    const decrementButton = screen.getByRole('button', {
      name: /decrement by 1/i,
    })

    await user.click(decrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('-1')

    await user.click(decrementButton)
    expect(screen.getByTestId('counter-display')).toHaveTextContent('-2')
  })

  it('should call onCountChange callback when count changes', async () => {
    const user = userEvent.setup()
    const handleCountChange = jest.fn()
    render(<Counter initialCount={0} onCountChange={handleCountChange} />)

    const incrementButton = screen.getByRole('button', {
      name: /increment by 1/i,
    })

    await user.click(incrementButton)
    expect(handleCountChange).toHaveBeenCalledWith(1)
    expect(handleCountChange).toHaveBeenCalledTimes(1)

    await user.click(incrementButton)
    expect(handleCountChange).toHaveBeenCalledWith(2)
    expect(handleCountChange).toHaveBeenCalledTimes(2)
  })

  it('should have proper accessibility attributes', () => {
    render(<Counter label="Score" />)

    const displayElement = screen.getByTestId('counter-display')
    expect(displayElement).toHaveAttribute('aria-live', 'polite')
    expect(displayElement).toHaveAttribute('aria-atomic', 'true')

    expect(
      screen.getByRole('button', { name: /increment by 1/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /decrement by 1/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('should handle rapid user interactions', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} />)

    const incrementButton = screen.getByRole('button', {
      name: /increment by 1/i,
    })

    // Simulate rapid clicking
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    expect(screen.getByTestId('counter-display')).toHaveTextContent('3')
  })

  it('should display current and initial values in info section', () => {
    render(<Counter initialCount={5} />)

    const infoElement = screen.getByTestId('counter-info')
    expect(infoElement).toHaveTextContent('Current: 0 | Initial: 5')
  })
})
