import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Login() {
  const { user, ready, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  if (ready && user) return <Navigate to="/admin/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErro('')
    try {
      await login(form.email.trim(), form.senha)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={submit}>
        <div className="adm-login__brand">
          <span className="logo__script">Duda</span>
          <span className="logo__label">Pelas Lentes</span>
        </div>
        <h1>Painel administrativo</h1>

        <label className="adm-field">
          <span className="adm-field__label">E-mail</span>
          <input
            className="adm-input"
            type="email"
            autoComplete="username"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Senha</span>
          <input
            className="adm-input"
            type="password"
            autoComplete="current-password"
            required
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
          />
        </label>

        {erro && <p className="adm-field__error">{erro}</p>}

        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
