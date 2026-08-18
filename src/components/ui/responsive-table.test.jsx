import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/test-utils'
import { ResponsiveTable } from './ResponsiveTable'

describe('ResponsiveTable', () => {
  it('makes wide tables keyboard-scrollable and explains the mobile interaction', () => {
    renderWithProviders(
      <ResponsiveTable label="Bookings">
        <table><tbody><tr><td>BK-100</td></tr></tbody></table>
      </ResponsiveTable>,
    )

    const region = screen.getByRole('region', { name: /bookings table/i })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveAccessibleDescription(/first column stays visible/i)
    expect(region).toContainElement(screen.getByRole('table'))
  })
})
