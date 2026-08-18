import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/test-utils'
import { AppErrorBoundary } from './AppErrorBoundary'

afterEach(() => vi.restoreAllMocks())

describe('AppErrorBoundary', () => {
  it('shows a useful fallback and can retry a failed render', async () => {
    const tester = userEvent.setup()
    let shouldThrow = true
    vi.spyOn(console, 'error').mockImplementation(() => {})

    function FlakyPage() {
      if (shouldThrow) throw new Error('Forced render failure')
      return <h1>Recovered adventure page</h1>
    }

    renderWithProviders(
      <AppErrorBoundary onRetry={() => { shouldThrow = false }}>
        <FlakyPage />
      </AppErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/could not display this page/i)
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/')

    await tester.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByRole('heading', { name: /recovered adventure page/i })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
