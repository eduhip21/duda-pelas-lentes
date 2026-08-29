import { createContext, useContext, useMemo } from 'react'
import { useApi } from './useApi.js'

const SiteConfigContext = createContext(null)

/*
  Configuração de fallback.

  Nenhum telefone ou e-mail fictício é utilizado.
*/
const FALLBACK = {
  nomeMarca: 'Duda Pelas Lentes',

  instagram: 'dudapelaslentes',
  instagramUrl: 'https://instagram.com/dudapelaslentes',

  whatsAppUrl: null,
  whatsAppDisplay: null,
  whatsAppAgendamentoUrl: null,
  whatsAppContatoUrl: null,

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


/*
  Remove tudo que não for número.
*/
function somenteNumeros(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}


/*
  Extrai o número de URLs como:

  https://wa.me/5548999999999
  https://api.whatsapp.com/send?phone=5548999999999
*/
function extrairNumeroWhatsApp(url) {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)

    /*
      wa.me/5548999999999
    */
    if (parsed.hostname.includes('wa.me')) {
      return somenteNumeros(parsed.pathname)
    }

    /*
      api.whatsapp.com/send?phone=...
    */
    const phone = parsed.searchParams.get('phone')

    if (phone) {
      return somenteNumeros(phone)
    }

    return somenteNumeros(url)
  } catch {
    return somenteNumeros(url)
  }
}


/*
  Formata números brasileiros.

  5548999999999
  vira
  (48) 99999-9999
*/
function formatarTelefone(numero) {
  if (!numero) {
    return null
  }

  let digits = somenteNumeros(numero)

  /*
    Remove DDI 55 somente para apresentação.
  */
  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2)
  }

  /*
    Celular:
    DDD + 9 dígitos
  */
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  /*
    Telefone fixo:
    DDD + 8 dígitos
  */
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return numero
}


/*
  Cria uma URL segura para o WhatsApp
  adicionando uma mensagem inicial.

  Mantém parâmetros existentes.
*/
function criarWhatsAppUrl(urlBase, mensagem) {
  if (!urlBase) {
    return null
  }

  try {
    const url = new URL(urlBase)

    url.searchParams.set('text', mensagem)

    return url.toString()
  } catch {
    /*
      Fallback para uma eventual URL não padrão.
    */
    const separador = urlBase.includes('?') ? '&' : '?'

    return `${urlBase}${separador}text=${encodeURIComponent(mensagem)}`
  }
}


/*
  Enriquece os dados vindos da API com informações
  úteis para todo o frontend.
*/
function enriquecerConfiguracao(config) {
  const base = {
    ...FALLBACK,
    ...(config ?? {}),
  }

  const numero = extrairNumeroWhatsApp(base.whatsAppUrl)

  const mensagemAgendamento =
    'Olá! Vim pelo site Duda Pelas Lentes e gostaria de informações para agendar um ensaio.'

  const mensagemContato =
    'Olá! Vim pelo site Duda Pelas Lentes e gostaria de conversar sobre um ensaio.'

  return {
    ...base,

    whatsAppDisplay:
      base.whatsAppDisplay ??
      formatarTelefone(numero),

    whatsAppAgendamentoUrl:
      criarWhatsAppUrl(
        base.whatsAppUrl,
        mensagemAgendamento,
      ),

    whatsAppContatoUrl:
      criarWhatsAppUrl(
        base.whatsAppUrl,
        mensagemContato,
      ),
  }
}


export function SiteConfigProvider({ children }) {
  const { data } = useApi('/api/public/configuracoes')

  const value = useMemo(
    () => enriquecerConfiguracao(data),
    [data],
  )

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  )
}


export function useSiteConfig() {
  const context = useContext(SiteConfigContext)

  return context ?? enriquecerConfiguracao(FALLBACK)
}