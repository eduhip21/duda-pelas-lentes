import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import Home from './pages/Home.jsx'

const Portfolio = lazy(() => import('./pages/Portfolio.jsx'))
const EnsaioDetalhe = lazy(() => import('./pages/EnsaioDetalhe.jsx'))
const Sobre = lazy(() => import('./pages/Sobre.jsx'))
const Servicos = lazy(() => import('./pages/Servicos.jsx'))
const Depoimentos = lazy(() => import('./pages/Depoimentos.jsx'))
const Contato = lazy(() => import('./pages/Contato.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading__spinner" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:slug" element={<EnsaioDetalhe />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="depoimentos" element={<Depoimentos />} />
          <Route path="contato" element={<Contato />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
