import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Stub do contexto de autenticação — controla o perfil do usuário logado.
const authState = { value: null }
vi.mock('../admin/lib/AuthContext.jsx', () => ({
  useAuth: () => authState.value,
}))

import AdminLayout from '../admin/AdminLayout.jsx'

function renderLayout(role) {
  authState.value = {
    user: { nome: 'Fulano', email: 'f@x.dev', role },
    isMaster: role === 'Master',
    logout: () => {},
  }
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <AdminLayout />
    </MemoryRouter>,
  )
}

describe('AdminLayout — menu por perfil', () => {
  it('Master vê o item "Usuários"', () => {
    renderLayout('Master')
    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
  })

  it('Admin NÃO vê o item "Usuários"', () => {
    renderLayout('Admin')
    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument()
    // ...mas continua vendo o conteúdo administrativo.
    expect(screen.getByRole('link', { name: 'Depoimentos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument()
  })
})
