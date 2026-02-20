import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import WaterIntakeCounter from './WaterIntakeCounter'
import { WaterIntakeProvider } from '../context/WaterIntakeContext'

describe('WaterIntakeCounter Component', () => {
  it('should increment the water intake count when the increment button is clicked', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const incrementButton = screen.getByRole('button', { name: /increment water intake/i })
    fireEvent.click(incrementButton)
    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement.textContent).toBe('1')
  })

  it('should decrement the water intake count when the decrement button is clicked', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const incrementButton = screen.getByRole('button', { name: /increment water intake/i })
    fireEvent.click(incrementButton)

    const decrementButton = screen.getByRole('button', { name: /decrement water intake/i })
    fireEvent.click(decrementButton)

    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement.textContent).toBe('0')
  })

  it('should not decrement below zero', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const decrementButton = screen.getByRole('button', { name: /decrement water intake/i })
    fireEvent.click(decrementButton)
    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement.textContent).toBe('0')
  })
})