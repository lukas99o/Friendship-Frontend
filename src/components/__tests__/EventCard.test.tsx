import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EventCard from '../EventCard'
import type { EventDto } from '../../types'

const mockEvent: EventDto = {
  eventId: 1,
  title: 'Test Event',
  description: 'Test beskrivning',
  startTime: '2024-12-25T15:00:00',
  endTime: '2024-12-25T18:00:00',
  location: 'Stockholm',
  img: '/images/test.jpg',
  userId: 'user123',
  ageRangeMin: 18,
  ageRangeMax: 30,
  interests: ['Musik', 'Sport'],
  conversationId: 1,                                                                     
}

describe('EventCard', () => {
  it('renderar event-titel korrekt', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )

    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('visar plats med rätt ikon', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )

    expect(screen.getByText(/📍 Stockholm/)).toBeInTheDocument()
  })

  it('renderar bild med korrekt src', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )

    const img = screen.getByAltText('Test Event') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('/images/test.jpg')
  })

  it('visar inte plats när location är null', () => {
    const eventWithoutLocation = { ...mockEvent, location: undefined }
    
    render(
      <BrowserRouter>
        <EventCard event={eventWithoutLocation} />
      </BrowserRouter>
    )

    expect(screen.queryByText(/📍/)).not.toBeInTheDocument()
  })
})
