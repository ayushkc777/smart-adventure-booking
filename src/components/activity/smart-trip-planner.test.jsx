import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { activities } from '../../test/fixtures'
import { renderWithProviders } from '../../test/test-utils'
import { SmartTripPlanner } from './SmartTripPlanner'

const plannerProps = {
  activities,
  activityTypes: ['Helicopter Tour', 'Mountain Biking', 'Paragliding'],
  locations: ['Nagarkot', 'Pokhara'],
}

describe('SmartTripPlanner', () => {
  it('renders no recommendation cards for an empty catalogue', () => {
    renderWithProviders(
      <SmartTripPlanner {...plannerProps} activities={[]} />,
    )

    expect(screen.getByRole('heading', { name: /find the right nepal adventure faster/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /compare/i })).not.toBeInTheDocument()
  })

  it('exposes positive numeric boundaries for trip inputs', () => {
    renderWithProviders(<SmartTripPlanner {...plannerProps} />)

    expect(screen.getByLabelText(/travel duration/i)).toHaveAttribute('min', '1')
    expect(screen.getByLabelText(/group size/i)).toHaveAttribute('min', '1')
    expect(screen.getByLabelText(/travel duration/i)).toHaveValue(3)
    expect(screen.getByLabelText(/group size/i)).toHaveValue(2)
  })

  it('reranks recommendations when preferences change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SmartTripPlanner {...plannerProps} />)

    await user.selectOptions(screen.getByLabelText(/activity preference/i), 'Mountain Biking')
    await user.selectOptions(screen.getByLabelText(/preferred location/i), 'Nagarkot')

    expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent(
      'Nagarkot Mountain Biking',
    )
  })

  it('links to booking and details and delegates comparison', async () => {
    const user = userEvent.setup()
    const toggleCompare = vi.fn()
    renderWithProviders(<SmartTripPlanner {...plannerProps} />, {
      experience: { toggleCompare },
    })

    expect(screen.getAllByRole('link', { name: /book now/i })[0]).toHaveAttribute(
      'href',
      `/booking/${activities[0].id}`,
    )
    expect(screen.getAllByRole('link', { name: /details/i })[0]).toHaveAttribute(
      'href',
      `/activities/${activities[0].id}`,
    )
    await user.click(screen.getAllByRole('button', { name: /compare/i })[0])
    expect(toggleCompare).toHaveBeenCalledWith(activities[0].id)
  })
})
