import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/test-utils'
import { RouteFocus } from './RouteFocus'

function RouteContent() {
  const { pathname } = useLocation()
  const onGuide = pathname === '/guide'
  return (
    <>
      <h1>{onGuide ? 'Travel guide' : 'Home page'}</h1>
      <Link to={onGuide ? '/' : '/guide'}>{onGuide ? 'Home' : 'Guide'}</Link>
    </>
  )
}

describe('RouteFocus', () => {
  it('focuses main content and announces its heading after navigation', async () => {
    const tester = userEvent.setup()
    renderWithProviders(
      <RouteFocus><RouteContent /></RouteFocus>,
    )

    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Home page')

    await tester.click(screen.getByRole('link', { name: /guide/i }))

    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Travel guide')
  })
})
