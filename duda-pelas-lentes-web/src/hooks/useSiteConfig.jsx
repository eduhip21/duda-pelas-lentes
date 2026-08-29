import { createContext, useContext } from 'react'
import { useApi } from './useApi.js'

const SiteConfigContext = createContext(null)

// Fallback usado enquanto a API carrega ou está indisponível — conteúdo neutro,
// nunca dados inventados da fotógrafa (telefone/e-mail ficam ausentes).
const FALLBACK = {
  nomeMarca: 'Duda Pelas Lentes',
  instagram: 'dudapelaslentes',
  instagramUrl: 'https://instagram.com/dudapelaslentes',
  whatsAppUrl: null,
  email: null,
  cidade: null,
  regiaoAtendida: null,
  desdeAno: 2017,
  logo: null,
  textoRodape:
    'Desde 2017, eternizando momentos e contando histórias através da fotografia.',
  seoTitle: 'Duda Pelas Lentes | Fotografia',
  seoDescription:
    'Eternizando momentos desde 2017. Retratos para diferentes fases da vida.',
  imagemSocial: null,
}

export function SiteConfigProvider({ children }) {
  const { data } = useApi('/api/public/configuracoes')
  return (
    <SiteConfigContext.Provider value={data ?? FALLBACK}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  return useContext(SiteConfigContext) ?? FALLBACK
}
