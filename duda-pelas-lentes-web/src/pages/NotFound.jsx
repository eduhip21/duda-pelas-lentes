import Seo from '../components/Seo.jsx'
import Button from '../components/Button.jsx'
import './pages.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <Seo title="Página não encontrada" />
      <div className="container">
        <span className="notfound__code">404</span>
        <h1>Não encontramos esta página</h1>
        <p>O link pode estar quebrado ou a página foi movida.</p>
        <Button to="/" variant="dark">Voltar para a Home</Button>
      </div>
    </div>
  )
}
