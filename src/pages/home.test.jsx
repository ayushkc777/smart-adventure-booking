import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test/test-utils'
import { Home } from './Home'

describe('home catalogue recovery states', () => {
  it('does not announce an empty catalogue while loading is in progress', () => {
    renderWithProviders(<Home />, {
      platform: { activities: [], catalogLoading: true },
    })

    expect(screen.queryByRole('heading', { name: /no activities available/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('explains a successfully loaded empty catalogue', () => {
    renderWithProviders(<Home />, {
      platform: { activities: [], catalogError: '', catalogLoading: false },
    })

    expect(screen.getByRole('heading', { name: /no activities available/i })).toBeInTheDocument()
    expect(screen.getByText(/booking api returned an empty catalogue/i)).toBeInTheDocument()
  })

  it('shows API errors and retries catalogue loading', async () => {
    const user = userEvent.setup()
    const refreshCatalog = vi.fn(async () => ({ ok: true }))
    renderWithProviders(<Home />, {
      platform: {
        activities: [],
        catalogError: 'The live catalogue could not be reached.',
        catalogLoading: false,
        refreshCatalog,
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('The live catalogue could not be reached.')
    expect(screen.queryByRole('heading', { name: /no activities available/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refreshCatalog).toHaveBeenCalledOnce()
  })
})
