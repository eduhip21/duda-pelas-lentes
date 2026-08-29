import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { Field, TextInput, Spinner, EmptyState } from '../components/ui.jsx'

const VAZIO = { nome: '', email: '', senha: '' }

function formatarData(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Usuarios() {
  const toast = useToast()
  const { user } = useAuth()
  const [itens, setItens] = useState(null)
  const [editando, setEditando] = useState(null) // 'novo' | usuario | null
  const [redefinindo, setRedefinindo] = useState(null) // usuario | null

  const carregar = () =>
    adminFetch('/api/admin/usuarios').then(setItens).catch((e) => toast.erro(e.message))

  useEffect(() => {
    carregar() /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  const criar = async (dados) => {
    try {
      await adminFetch('/api/admin/usuarios', { method: 'POST', body: dados })
      toast.sucesso('Usuário Admin criado.')
      setEditando(null)
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  const editar = async (id, dados) => {
    try {
      await adminFetch(`/api/admin/usuarios/${id}`, { method: 'PUT', body: dados })
      toast.sucesso('Usuário atualizado.')
      setEditando(null)
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  const alterarStatus = async (u) => {
    try {
      await adminFetch(`/api/admin/usuarios/${u.id}/status`, {
        method: 'PATCH',
        body: { ativo: !u.ativo },
      })
      toast.sucesso(u.ativo ? 'Usuário desativado.' : 'Usuário ativado.')
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  const redefinirSenha = async (id, novaSenha) => {
    try {
      await adminFetch(`/api/admin/usuarios/${id}/redefinir-senha`, {
        method: 'POST',
        body: { novaSenha },
      })
      toast.sucesso('Senha redefinida.')
      setRedefinindo(null)
    } catch (e) {
      toast.erro(e.message)
    }
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Usuários</h1>
        <button className="adm-btn adm-btn--primary" onClick={() => setEditando('novo')}>
          Novo Admin
        </button>
      </div>

      {itens.length === 0 ? (
        <EmptyState>Nenhum usuário cadastrado.</EmptyState>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Último login</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {itens.map((u) => {
                const isSelf = u.id === user?.id
                const gerenciavel = u.role === 'Admin'
                return (
                  <tr key={u.id}>
                    <td>{u.nome}{isSelf && <span className="adm-badge adm-badge--respondido"> você</span>}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`adm-badge ${u.role === 'Master' ? 'adm-badge--novo' : 'adm-badge--arquivado'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.ativo ? 'Ativo' : 'Inativo'}</td>
                    <td>{formatarData(u.ultimoLoginEm)}</td>
                    <td className="adm-table__actions">
                      {gerenciavel ? (
                        <>
                          <button className="adm-btn adm-btn--sm" onClick={() => setEditando(u)}>
                            Editar
                          </button>
                          <button className="adm-btn adm-btn--sm" onClick={() => alterarStatus(u)}>
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="adm-btn adm-btn--sm" onClick={() => setRedefinindo(u)}>
                            Redefinir senha
                          </button>
                        </>
                      ) : (
                        <span className="adm-field__hint">Conta Master — gerida pela própria pessoa</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <div className="adm-modal" role="dialog" aria-modal="true">
          <UsuarioForm
            inicial={editando === 'novo' ? VAZIO : editando}
            novo={editando === 'novo'}
            onCancel={() => setEditando(null)}
            onSave={(dados) =>
              editando === 'novo'
                ? criar(dados)
                : editar(editando.id, { nome: dados.nome, email: dados.email })
            }
          />
        </div>
      )}

      {redefinindo && (
        <div className="adm-modal" role="dialog" aria-modal="true">
          <RedefinirSenhaForm
            usuario={redefinindo}
            onCancel={() => setRedefinindo(null)}
            onSave={(senha) => redefinirSenha(redefinindo.id, senha)}
          />
        </div>
      )}
    </div>
  )
}

function UsuarioForm({ inicial, novo, onCancel, onSave }) {
  const [f, setF] = useState({ nome: inicial.nome, email: inicial.email, senha: '' })
  const set = (p) => setF((prev) => ({ ...prev, ...p }))

  return (
    <form
      className="adm-modal__card"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ nome: f.nome.trim(), email: f.email.trim(), senha: f.senha })
      }}
    >
      <h2>{novo ? 'Novo usuário Admin' : 'Editar usuário'}</h2>
      <Field label="Nome">
        <TextInput value={f.nome} onChange={(v) => set({ nome: v })} required maxLength={120} />
      </Field>
      <Field label="E-mail">
        <TextInput type="email" value={f.email} onChange={(v) => set({ email: v })} required maxLength={200} />
      </Field>
      {novo && (
        <Field label="Senha inicial" hint="Mínimo de 8 caracteres.">
          <TextInput type="password" value={f.senha} onChange={(v) => set({ senha: v })} required minLength={8} />
        </Field>
      )}
      <div className="adm-modal__foot">
        <button type="button" className="adm-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="adm-btn adm-btn--primary">Salvar</button>
      </div>
    </form>
  )
}

function RedefinirSenhaForm({ usuario, onCancel, onSave }) {
  const [senha, setSenha] = useState('')

  return (
    <form
      className="adm-modal__card"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(senha)
      }}
    >
      <h2>Redefinir senha</h2>
      <p className="adm-field__hint">{usuario.nome} — {usuario.email}</p>
      <Field label="Nova senha" hint="Mínimo de 8 caracteres.">
        <TextInput type="password" value={senha} onChange={setSenha} required minLength={8} />
      </Field>
      <div className="adm-modal__foot">
        <button type="button" className="adm-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="adm-btn adm-btn--primary">Redefinir</button>
      </div>
    </form>
  )
}
