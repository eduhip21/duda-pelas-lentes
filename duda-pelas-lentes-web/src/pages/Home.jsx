import Seo from '../components/Seo.jsx'
import { useApi } from '../hooks/useApi.js'
import Hero from './home/Hero.jsx'
import Historias from './home/Historias.jsx'
import SobreResumo from './home/SobreResumo.jsx'
import Momentos from './home/Momentos.jsx'
import DepoimentosCarrossel from './home/DepoimentosCarrossel.jsx'
import Cta from './home/Cta.jsx'
import InstagramGrade from './home/InstagramGrade.jsx'
import '../styles/home.css'

export default function Home() {
  const { data, loading } = useApi('/api/public/home')

  return (
    <>
      <Seo />
      <Hero hero={data?.hero} loading={loading} />
      <Historias titulo={data?.titulos?.historias} categorias={data?.categorias ?? []} />
      <SobreResumo sobre={data?.sobre} />
      <Momentos titulo={data?.titulos?.momentos} fotos={data?.destaques ?? []} />
      <DepoimentosCarrossel
        titulo={data?.titulos?.depoimentos}
        depoimentos={data?.depoimentos ?? []}
      />
      <Cta cta={data?.cta} />
      <InstagramGrade titulo={data?.titulos?.instagram} fotos={data?.instagram ?? []} />
    </>
  )
}
