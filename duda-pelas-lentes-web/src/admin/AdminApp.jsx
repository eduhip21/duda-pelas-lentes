import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'
import { ToastProvider } from './lib/useToast.jsx'
import AdminLayout from './AdminLayout.jsx'
import Login from './pages/Login.jsx'
import './admin.css'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const HomeEditor = lazy(() => import('./pages/HomeEditor.jsx'))
const Configuracoes = lazy(() => import('./pages/Configuracoes.jsx'))
const SobreEditor = lazy(() => import('./pages/SobreEditor.jsx'))
const Categorias = lazy(() => import('./pages/Categorias.jsx'))
const PortfolioList = lazy(() => import('./pages/PortfolioList.jsx'))
const EnsaioEditor = lazy(() => import('./pages/EnsaioEditor.jsx'))
const Servicos = lazy(() => import('./pages/Servicos.jsx'))
const Depoimentos = lazy(() => import('./pages/Depoimentos.jsx'))
const Instagram = lazy(() => import('./pages/Instagram.jsx'))
const Contatos = lazy(() => import('./pages/Contatos.jsx'))

function RequireAuth({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="adm-boot"><span className="inline-spinner" /></div>
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<div className="adm-boot"><span className="inline-spinner" /></div>}>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="home" element={<HomeEditor />} />
              <Route path="sobre" element={<SobreEditor />} />
              <Route path="portfolio" element={<PortfolioList />} />
              <Route path="portfolio/novo" element={<EnsaioEditor />} />
              <Route path="portfolio/:id" element={<EnsaioEditor />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="depoimentos" element={<Depoimentos />} />
              <Route path="instagram" element={<Instagram />} />
              <Route path="contatos" element={<Contatos />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  )
}
