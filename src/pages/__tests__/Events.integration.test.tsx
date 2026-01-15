import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Events from '../Events'
import type { EventDto } from '../../types'

const mockGetEvents = vi.fn()
const mockJoinEvent = vi.fn()
const mockLeaveEvent = vi.fn()
const mockGetStatus = vi.fn()
const mockGetFriendEvents = vi.fn()

vi.mock('../../api/events/events.ts', () => ({
  getEvents: (...args: unknown[]) => mockGetEvents(...args),
}))

vi.mock('../../api/events/joinEvent.ts', () => ({
  JoinEvent: (...args: unknown[]) => mockJoinEvent(...args),
}))

vi.mock('../../api/events/leaveEvent.ts', () => ({
  LeaveEvent: (...args: unknown[]) => mockLeaveEvent(...args),
}))

vi.mock('../../api/events/participantStatus.ts', () => ({
  GetEventParticipantStatus: () => mockGetStatus(),
}))

vi.mock('../../api/events/friendEvents.ts', () => ({
  GetFriendEvents: () => mockGetFriendEvents(),
}))

vi.mock('../../components/Dropdown', () => ({
  default: ({ selectedInterests }: { selectedInterests: string[] }) => (
    <div data-testid="dropdown">Dropdown ({selectedInterests.length})</div>
  ),
}))

const baseEvents: EventDto[] = [
  {
    eventId: 1,
    userId: 'u1',
    title: 'Event A',
    startTime: '2025-01-01T10:00:00',
    endTime: '2025-01-01T12:00:00',
    location: 'Stockholm',
    ageRangeMin: 18,
    ageRangeMax: 30,
    interests: ['Musik'],
    img: '/images/a.jpg',
    conversationId: 1,
  },
  {
    eventId: 2,
    userId: 'u2',
    title: 'Event B',
    startTime: '2025-02-01T10:00:00',
    endTime: '2025-02-01T12:00:00',
    location: 'Göteborg',
    ageRangeMin: 20,
    ageRangeMax: 35,
    interests: ['Sport'],
    img: '/images/b.jpg',
    conversationId: 2,
  },
]

describe('Events integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetStatus.mockResolvedValue([])
    mockGetEvents.mockResolvedValue(baseEvents)
    mockJoinEvent.mockResolvedValue(undefined)
    mockLeaveEvent.mockResolvedValue(undefined)
    mockGetFriendEvents.mockResolvedValue([])
  })

  it('renders events and filters out already joined events', async () => {
    mockGetStatus.mockResolvedValue([1])

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Event B')).toBeInTheDocument()
    expect(screen.queryByText('Event A')).not.toBeInTheDocument()
    expect(mockGetStatus).toHaveBeenCalledTimes(1)
    expect(mockGetEvents).toHaveBeenCalledWith({ ageMin: null, ageMax: null, interests: null, page: 1, pageSize: 10, sort: 'alphabetical' })
  })

  it('can join an event and updates the button', async () => {
    mockGetStatus.mockResolvedValue([])
    mockGetEvents.mockResolvedValue([baseEvents[0]])

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    )

    const joinButton = await screen.findByRole('button', { name: 'Join' })
    const user = userEvent.setup()
    await user.click(joinButton)

    expect(mockJoinEvent).toHaveBeenCalledWith(1)
    expect(await screen.findByRole('button', { name: 'Leave' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Leave' }))
    expect(mockLeaveEvent).toHaveBeenCalledWith(1)
    expect(await screen.findByRole('button', { name: 'Join' })).toBeInTheDocument()
  })
})
