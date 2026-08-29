import { useState } from 'react'
import { mediaUrl } from '../../lib/api.js'

export function Field({ label, hint, children, error }) {
  return (
    <label className="adm-field">
      <span className="adm-field__label">{label}</span>
      {children}
      {hint && <span className="adm-field__hint">{hint}</span>}
      {error && <span className="adm-field__error">{error}</span>}
    </label>
  )
}

export function TextInput({ value, onChange, ...rest }) {
  return (
    <input
      className="adm-input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function TextArea({ value, onChange, rows = 4, ...rest }) {
  return (
    <textarea
      className="adm-input"
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle__track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}

/**
 * Campo de upload com preview. onUpload recebe o File e deve devolver o caminho salvo.
 */
export function ImageField({ label, value, onUpload, hint, ratio = '4 / 5' }) {
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')

  const handle = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setErro('')
    try {
      await onUpload(file)
    } catch (err) {
      setErro(err.message || 'Falha ao enviar a imagem.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-image-field">
      <span className="adm-field__label">{label}</span>
      <div className="adm-image-field__body">
        <span className="adm-image-field__preview" style={{ aspectRatio: ratio }}>
          {value ? <img src={mediaUrl(value)} alt="" /> : <span>Sem imagem</span>}
        </span>
        <div>
          <label className="adm-btn adm-btn--outline">
            {busy ? 'Enviando…' : value ? 'Trocar imagem' : 'Enviar imagem'}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handle} disabled={busy} />
          </label>
          {hint && <p className="adm-field__hint">{hint}</p>}
          {erro && <p className="adm-field__error">{erro}</p>}
        </div>
      </div>
    </div>
  )
}

export function ConfirmButton({ onConfirm, children = 'Excluir', message = 'Tem certeza? Esta ação não pode ser desfeita.' }) {
  return (
    <button
      type="button"
      className="adm-btn adm-btn--danger"
      onClick={() => {
        if (window.confirm(message)) onConfirm()
      }}
    >
      {children}
    </button>
  )
}

export function EmptyState({ children }) {
  return <p className="adm-empty">{children}</p>
}

export function Spinner() {
  return <span className="inline-spinner" />
}
