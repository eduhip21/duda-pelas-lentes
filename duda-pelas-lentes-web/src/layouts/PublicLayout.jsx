import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WhatsappFab from '../components/WhatsappFab.jsx'
import { useApi } from '../hooks/useApi.js'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const { data: servicos } = useApi('/api/public/servicos')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Outlet />
      </main>
      <Footer servicos={servicos ?? []} />
      <WhatsappFab />
    </>
  )
}
