import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../Navbar'
import * as authContext from '../../context/authContext'

vi.mock('../../context/authContext', () => ({
  useAuth: vi.fn(),
}))

describe('Navbar', () => {
  it('renderar navbar-komponent', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
      username: undefined,
      userId: undefined,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('visar inloggningslänk när användaren inte är inloggad', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
      username: undefined,
      userId: undefined,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Logga in')).toBeInTheDocument()
  })

  it('visar användarmenyn när användaren är inloggad', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isLoggedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
      username: 'TestUser',
      userId: 'string123',
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Logga ut')).toBeInTheDocument()
  })

  it('visar logo', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
      username: undefined,
      userId: undefined,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    const logo = screen.getByAltText('Vänskap')
    expect(logo).toBeInTheDocument()
  })
})
