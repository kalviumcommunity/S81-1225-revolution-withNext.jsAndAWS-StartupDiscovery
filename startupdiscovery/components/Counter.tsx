'use client'

import { useState } from 'react'

interface CounterProps {
  initialCount?: number
  step?: number
  label?: string
}

export function Counter({ initialCount = 0, step = 1, label = 'Count' }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  const increment = () => setCount((prev) => prev + step)
  const decrement = () => setCount((prev) => prev - step)
  const reset = () => setCount(initialCount)

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">{label}</h2>
      <div 
        className="text-4xl font-mono" 
        data-testid="counter-value"
        aria-live="polite"
      >
        {count}
      </div>
      <div className="flex gap-2">
        <button
          onClick={decrement}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          aria-label="Decrement counter"
        >
          -
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          aria-label="Reset counter"
        >
          Reset
        </button>
        <button
          onClick={increment}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          aria-label="Increment counter"
        >
          +
        </button>
      </div>
    </div>
  )
}
