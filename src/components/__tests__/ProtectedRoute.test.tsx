import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import * as authContext from '../../context/authContext'

vi.mock('../../context/authContext', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute', () => {
  it('renderar children när användaren är inloggad', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isLoggedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
      username: 'TestUser',
      userId: 'string123',
    })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Skyddat innehåll</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('Skyddat innehåll')).toBeInTheDocument()
  })

  it('redirectar till startsidan när användaren inte är inloggad', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
      username: undefined,
      userId: undefined,
    })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Skyddat innehåll</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.queryByText('Skyddat innehåll')).not.toBeInTheDocument()
  })
})
