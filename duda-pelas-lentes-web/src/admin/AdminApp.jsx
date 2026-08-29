import {
  lazy,
  Suspense,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  AuthProvider,
  useAuth,
} from './lib/AuthContext.jsx'

import {
  ToastProvider,
} from './lib/useToast.jsx'

import AdminLayout from './AdminLayout.jsx'
import Login from './pages/Login.jsx'

import './admin.css'


/* =========================================
   PÁGINAS ADMINISTRATIVAS
========================================= */

const Dashboard =
  lazy(
    () =>
      import(
        './pages/Dashboard.jsx'
      ),
  )


const HomeEditor =
  lazy(
    () =>
      import(
        './pages/HomeEditor.jsx'
      ),
  )


const Configuracoes =
  lazy(
    () =>
      import(
        './pages/Configuracoes.jsx'
      ),
  )


const SobreEditor =
  lazy(
    () =>
      import(
        './pages/SobreEditor.jsx'
      ),
  )


const Categorias =
  lazy(
    () =>
      import(
        './pages/Categorias.jsx'
      ),
  )


const PortfolioList =
  lazy(
    () =>
      import(
        './pages/PortfolioList.jsx'
      ),
  )


const EnsaioEditor =
  lazy(
    () =>
      import(
        './pages/EnsaioEditor.jsx'
      ),
  )


const Servicos =
  lazy(
    () =>
      import(
        './pages/Servicos.jsx'
      ),
  )


const Depoimentos =
  lazy(
    () =>
      import(
        './pages/Depoimentos.jsx'
      ),
  )


const Instagram =
  lazy(
    () =>
      import(
        './pages/Instagram.jsx'
      ),
  )


const Contatos =
  lazy(
    () =>
      import(
        './pages/Contatos.jsx'
      ),
  )


const Usuarios =
  lazy(
    () =>
      import(
        './pages/Usuarios.jsx'
      ),
  )


/* =========================================
   LOADING
========================================= */

function AdminLoading() {
  return (
    <div className="adm-boot">

      <span
        className="inline-spinner"
        aria-label="Carregando"
      />

    </div>
  )
}


/* =========================================
   PROTEÇÃO ADMIN
========================================= */

function RequireAuth({
  children,
}) {
  const {
    user,
    ready,
  } = useAuth()


  if (!ready) {
    return <AdminLoading />
  }


  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }


  return children
}


/* =========================================
   PROTEÇÃO MASTER
========================================= */

/*
  Somente Master acessa gestão
  de usuários.

  Admin comum é enviado ao Dashboard.

  A API também deve devolver 403,
  então esta proteção não substitui
  a autorização do backend.
*/
function RequireMaster({
  children,
}) {
  const {
    isMaster,
    ready,
  } = useAuth()


  if (!ready) {
    return <AdminLoading />
  }


  if (!isMaster) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    )
  }


  return children
}


/* =========================================
   APLICAÇÃO ADMINISTRATIVA
========================================= */

export default function AdminApp() {
  return (
    <AuthProvider>

      <ToastProvider>

        <Suspense
          fallback={
            <AdminLoading />
          }
        >

          <Routes>

            {/* =========================
                LOGIN
            ========================== */}

            <Route
              path="login"
              element={<Login />}
            />


            {/* =========================
                ROTAS AUTENTICADAS
            ========================== */}

            <Route
              element={
                <RequireAuth>

                  <AdminLayout />

                </RequireAuth>
              }
            >

              {/* /admin */}

              <Route
                index
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />


              {/* Dashboard */}

              <Route
                path="dashboard"
                element={
                  <Dashboard />
                }
              />


              {/* Home */}

              <Route
                path="home"
                element={
                  <HomeEditor />
                }
              />


              {/* Sobre */}

              <Route
                path="sobre"
                element={
                  <SobreEditor />
                }
              />


              {/* =========================
                  PORTFÓLIO
              ========================== */}

              <Route
                path="portfolio"
                element={
                  <PortfolioList />
                }
              />


              <Route
                path="portfolio/novo"
                element={
                  <EnsaioEditor />
                }
              />


              <Route
                path="portfolio/:id"
                element={
                  <EnsaioEditor />
                }
              />


              {/* Categorias */}

              <Route
                path="categorias"
                element={
                  <Categorias />
                }
              />


              {/* Serviços */}

              <Route
                path="servicos"
                element={
                  <Servicos />
                }
              />


              {/* Depoimentos */}

              <Route
                path="depoimentos"
                element={
                  <Depoimentos />
                }
              />


              {/* Instagram */}

              <Route
                path="instagram"
                element={
                  <Instagram />
                }
              />


              {/* Contatos */}

              <Route
                path="contatos"
                element={
                  <Contatos />
                }
              />


              {/* Configurações */}

              <Route
                path="configuracoes"
                element={
                  <Configuracoes />
                }
              />


              {/* =========================
                  MASTER
              ========================== */}

              <Route
                path="usuarios"
                element={
                  <RequireMaster>

                    <Usuarios />

                  </RequireMaster>
                }
              />

            </Route>


            {/* =========================
                ROTA INVÁLIDA
            ========================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </Suspense>

      </ToastProvider>

    </AuthProvider>
  )
}