import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
    Link: actual.Link,
  }
})

vi.mock('../../context/authContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

describe('Login integration', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })

  it('loggar in och navigerar vid lyckad inloggning', async () => {
    const user = userEvent.setup()

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ token: 'jwt-token', username: 'TestUser', userId: 'user-1' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Lösenord'), 'Secret123!')
    await user.click(screen.getByRole('button', { name: 'Logga in' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jwt-token', 'TestUser', 'user-1')
      expect(mockNavigate).toHaveBeenCalledWith('/events')
    })
  })

  it('visar felmeddelande vid ogiltiga uppgifter', async () => {
    const user = userEvent.setup()

    fetchMock
    .mockResolvedValueOnce(new Response(null, { status: 200 }))
    .mockResolvedValueOnce(new Response('Felaktig e-post eller lösenord.', { status: 401 }))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'fel@test.com')
    await user.type(screen.getByLabelText('Lösenord'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Logga in' }))

    expect(await screen.findByText('Felaktig e-post eller lösenord.')).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('visar bekräftelsekrav när API svarar med texten', async () => {
    const user = userEvent.setup()

    fetchMock
    .mockResolvedValueOnce(new Response(null, { status: 200 }))
    .mockResolvedValueOnce(new Response('Du måste bekräfta din e-post först.', { status: 400 }))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Lösenord'), 'Secret123!')
    await user.click(screen.getByRole('button', { name: 'Logga in' }))

    expect(
      await screen.findByText('Du måste bekräfta din e-post först.')
    ).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })
})
