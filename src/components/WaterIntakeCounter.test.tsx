import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import WaterIntakeCounter from './WaterIntakeCounter'
import { WaterIntakeProvider } from '../context/WaterIntakeContext'

describe('WaterIntakeCounter', () => {
  it('increments water intake count when increment button is clicked', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const incrementButton = screen.getByRole('button', { name: 'Increment water intake' })
    fireEvent.click(incrementButton)
    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement).toHaveTextContent('1')
  })

  it('decrements water intake count when decrement button is clicked', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const decrementButton = screen.getByRole('button', { name: 'Decrement water intake' })
    const incrementButton = screen.getByRole('button', { name: 'Increment water intake' })
    fireEvent.click(incrementButton)
    fireEvent.click(decrementButton)
    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement).toHaveTextContent('0')
  })

  it('does not decrement below zero', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const decrementButton = screen.getByRole('button', { name: 'Decrement water intake' })
    fireEvent.click(decrementButton)
    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement).toHaveTextContent('0')
  })

  it('displays the correct initial water intake count', () => {
    render(
      <WaterIntakeProvider>
        <WaterIntakeCounter />
      </WaterIntakeProvider>,
    )
    const countElement = screen.getByTestId('water-intake-count')
    expect(countElement).toHaveTextContent('0')
  })
})
