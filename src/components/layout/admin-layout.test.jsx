import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { admin } from '../../test/fixtures'
import { renderWithProviders } from '../../test/test-utils'
import { AdminLayout } from './AdminLayout'

describe('AdminLayout mobile navigation', () => {
  it('moves focus into the drawer and restores it on Escape', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<AdminLayout />, {
      auth: { currentUser: admin },
      initialEntries: ['/admin'],
    })
    const trigger = screen.getByRole('button', { name: /open admin menu/i })

    await tester.click(trigger)

    const drawer = screen.getByRole('dialog', { name: /admin navigation/i })
    expect(drawer).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close admin menu overlay/i })).toHaveFocus()
    expect(document.body).toHaveStyle({ overflow: 'hidden' })

    await tester.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: /admin navigation/i })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' })
  })
})
