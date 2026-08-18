import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { user } from '../../test/fixtures'
import { renderWithProviders } from '../../test/test-utils'
import { Header } from './Header'

describe('Header navigation', () => {
  it('opens and closes the visitor mobile navigation', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<Header />)
    const toggle = screen.getByRole('button', { name: /toggle navigation/i })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await tester.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: /mobile/i })).toBeInTheDocument()

    await tester.click(screen.getByRole('navigation', { name: /mobile/i }).querySelector('a[href="/activities"]'))
    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('moves focus through the account menu with the keyboard', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<Header />, { auth: { currentUser: user } })
    const accountButton = screen.getByRole('button', { name: /open account menu/i })

    await tester.click(accountButton)
    const menuItems = screen.getAllByRole('menuitem')
    await waitFor(() => expect(menuItems[0]).toHaveFocus())

    await tester.keyboard('{ArrowDown}')
    expect(menuItems[1]).toHaveFocus()
    await tester.keyboard('{End}')
    expect(menuItems.at(-1)).toHaveFocus()
    await tester.keyboard('{Home}')
    expect(menuItems[0]).toHaveFocus()
  })

  it('closes the account menu with Escape and restores trigger focus', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<Header />, { auth: { currentUser: user } })
    const accountButton = screen.getByRole('button', { name: /open account menu/i })

    await tester.click(accountButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await tester.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(accountButton).toHaveFocus()
    expect(accountButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows traveler destinations in the authenticated mobile menu', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<Header />, { auth: { currentUser: user } })

    await tester.click(screen.getByRole('button', { name: /toggle navigation/i }))
    const mobileNav = screen.getByRole('navigation', { name: /mobile/i })
    expect(mobileNav).toHaveTextContent(user.email)
    expect(mobileNav.querySelector('a[href="/user/dashboard"]')).toHaveTextContent('Dashboard')
    expect(mobileNav.querySelector('a[href="/user/profile"]')).toHaveTextContent('Profile')
  })
})
