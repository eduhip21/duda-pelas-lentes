/** Cabeçalho de página interna — abaixo do header fixo. */
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="page-header">
      <div className="container">
        {eyebrow && <span className="section__eyebrow" style={{ textAlign: 'center' }}>{eyebrow}</span>}
        <h1 className="page-header__title">{title}</h1>
        {children && <p className="page-header__lead">{children}</p>}
        <div className="section__rule" />
      </div>
    </header>
  )
}
