import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { activities } from '../../test/fixtures'
import { renderWithProviders } from '../../test/test-utils'
import { PriceComparisonTable } from './PriceComparisonTable'

describe('PriceComparisonTable', () => {
  it('provides an accessible caption and mobile labels for every operator field', () => {
    renderWithProviders(<PriceComparisonTable activity={activities[0]} showOperatorLinks />)

    expect(
      screen.getByRole('table', { name: new RegExp(`operator prices.*${activities[0].name}`, 'i') }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Cancellation').length).toBeGreaterThan(1)
    expect(screen.getAllByRole('link', { name: /select/i })).toHaveLength(
      activities[0].operators.filter((operator) => (operator.status ?? 'active') === 'active').length,
    )
  })
})
