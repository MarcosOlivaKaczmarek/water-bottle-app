import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { WaterIntakeProvider, useWaterIntake } from './WaterIntakeContext'

describe('WaterIntakeContext', () => {
  it('provides initial intake value of 0', () => {
    const { result } = renderHook(() => useWaterIntake(), { wrapper: WaterIntakeProvider })
    expect(result.current.intake).toBe(0)
  })

  it('increments intake correctly', () => {
    const { result } = renderHook(() => useWaterIntake(), { wrapper: WaterIntakeProvider })
    act(() => {
      result.current.incrementIntake()
    })
    expect(result.current.intake).toBe(1)
  })

  it('decrements intake correctly', () => {
    const { result } = renderHook(() => useWaterIntake(), { wrapper: WaterIntakeProvider })
    act(() => {
      result.current.incrementIntake()
    })
    act(() => {
      result.current.decrementIntake()
    })
    expect(result.current.intake).toBe(0)
  })

  it('does not decrement below zero', () => {
    const { result } = renderHook(() => useWaterIntake(), { wrapper: WaterIntakeProvider })
    act(() => {
      result.current.decrementIntake()
    })
    expect(result.current.intake).toBe(0)
  })

  it('provides dailyIntake array', () => {
    const { result } = renderHook(() => useWaterIntake(), { wrapper: WaterIntakeProvider })
    expect(result.current.dailyIntake).toBeInstanceOf(Array)
  })
})
