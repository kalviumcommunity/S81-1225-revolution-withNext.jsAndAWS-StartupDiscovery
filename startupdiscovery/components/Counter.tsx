'use client'

import { useState } from 'react'

interface ButtonProps {
  initialCount?: number
  step?: number
  label?: string
  onCountChange?: (count: number) => void
}

/**
 * Counter component demonstrating state management and user interactions
 * Perfect for testing React components with RTL
 */
export function Counter({
  initialCount = 0,
  step = 1,
  label = 'Count',
  onCountChange,
}: ButtonProps) {
  const [count, setCount] = useState(initialCount)

  const handleIncrement = () => {
    const newCount = count + step
    setCount(newCount)
    onCountChange?.(newCount)
  }

  const handleDecrement = () => {
    const newCount = count - step
    setCount(newCount)
    onCountChange?.(newCount)
  }

  const handleReset = () => {
    setCount(initialCount)
    onCountChange?.(initialCount)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">{label}</h2>
      
      <div
        className="text-5xl font-mono font-bold"
        data-testid="counter-display"
        aria-live="polite"
        aria-atomic="true"
      >
        {count}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDecrement}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          aria-label={`Decrement by ${step}`}
        >
          − {step}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          aria-label="Reset to initial value"
        >
          Reset
        </button>

        <button
          onClick={handleIncrement}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          aria-label={`Increment by ${step}`}
        >
          + {step}
        </button>
      </div>

      <div className="text-sm text-gray-600" data-testid="counter-info">
        Current: {count} | Initial: {initialCount}
      </div>
    </div>
  )
}
