import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter Component', () => {
  it('should render with default initial count of 0', () => {
    render(<Counter />)
    
    expect(screen.getByTestId('counter-value')).toHaveTextContent('0')
    expect(screen.getByRole('heading', { name: /count/i })).toBeInTheDocument()
  })

  it('should render with custom initial count', () => {
    render(<Counter initialCount={10} />)
    
    expect(screen.getByTestId('counter-value')).toHaveTextContent('10')
  })

  it('should render with custom label', () => {
    render(<Counter label="Custom Label" />)
    
    expect(screen.getByRole('heading', { name: /custom label/i })).toBeInTheDocument()
  })

  it('should increment counter when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const incrementButton = screen.getByRole('button', { name: /increment counter/i })
    
    await user.click(incrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('1')
    
    await user.click(incrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('2')
  })

  it('should decrement counter when - button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)
    
    const decrementButton = screen.getByRole('button', { name: /decrement counter/i })
    
    await user.click(decrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('4')
    
    await user.click(decrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('3')
  })

  it('should reset counter to initial value when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={10} />)
    
    const incrementButton = screen.getByRole('button', { name: /increment counter/i })
    const resetButton = screen.getByRole('button', { name: /reset counter/i })
    
    // Increment a few times
    await user.click(incrementButton)
    await user.click(incrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('12')
    
    // Reset should go back to initial count
    await user.click(resetButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('10')
  })

  it('should use custom step value for increment/decrement', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} step={5} />)
    
    const incrementButton = screen.getByRole('button', { name: /increment counter/i })
    const decrementButton = screen.getByRole('button', { name: /decrement counter/i })
    
    await user.click(incrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('5')
    
    await user.click(incrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('10')
    
    await user.click(decrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('5')
  })

  it('should handle negative counts', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} />)
    
    const decrementButton = screen.getByRole('button', { name: /decrement counter/i })
    
    await user.click(decrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('-1')
    
    await user.click(decrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('-2')
  })

  it('should have proper accessibility attributes', () => {
    render(<Counter />)
    
    expect(screen.getByTestId('counter-value')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: /increment counter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decrement counter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset counter/i })).toBeInTheDocument()
  })

  it('should support rapid clicking', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const incrementButton = screen.getByRole('button', { name: /increment counter/i })
    
    // Rapid clicks
    await user.tripleClick(incrementButton)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('3')
  })
})
