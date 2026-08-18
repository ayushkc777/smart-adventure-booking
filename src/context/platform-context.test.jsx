import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activities, operators, reviews } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { PlatformProvider } from './PlatformContext.jsx'
import { usePlatform } from './usePlatform'

const api = vi.hoisted(() => ({
  getActivities: vi.fn(),
  getOperators: vi.fn(),
  getReviews: vi.fn(),
}))

vi.mock('../api/activityApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getActivities: api.getActivities,
}))
vi.mock('../api/operatorApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getOperators: api.getOperators,
}))
vi.mock('../api/reviewApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getReviews: api.getReviews,
}))

function deferred() {
  let resolve
  const promise = new Promise((next) => { resolve = next })
  return { promise, resolve }
}

function CatalogHarness() {
  const { activities: catalogActivities, catalogLoading, refreshCatalog } = usePlatform()
  return (
    <div>
      <output>{catalogActivities[0]?.name ?? 'Empty'}</output>
      <output>{catalogLoading ? 'Loading' : 'Ready'}</output>
      <button onClick={refreshCatalog} type="button">Refresh</button>
    </div>
  )
}

describe('PlatformProvider catalogue refreshes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getOperators.mockResolvedValue(operators)
    api.getReviews.mockResolvedValue(reviews)
  })

  it('ignores an older response that resolves after a newer refresh', async () => {
    const older = deferred()
    const newer = deferred()
    api.getActivities
      .mockResolvedValueOnce([activities[0]])
      .mockImplementationOnce(() => older.promise)
      .mockImplementationOnce(() => newer.promise)

    renderWithProviders(
      <PlatformProvider><CatalogHarness /></PlatformProvider>,
    )
    expect(await screen.findByText(activities[0].name)).toBeInTheDocument()

    await act(async () => {
      screen.getByRole('button', { name: /refresh/i }).click()
      screen.getByRole('button', { name: /refresh/i }).click()
    })

    await act(async () => {
      newer.resolve([{ ...activities[1], name: 'Newest catalogue' }])
      await newer.promise
    })
    expect(await screen.findByText('Newest catalogue')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()

    await act(async () => {
      older.resolve([{ ...activities[0], name: 'Stale catalogue' }])
      await older.promise
    })
    expect(screen.getByText('Newest catalogue')).toBeInTheDocument()
    expect(screen.queryByText('Stale catalogue')).not.toBeInTheDocument()
  })
})
