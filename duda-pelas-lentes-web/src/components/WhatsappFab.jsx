import Icon from './Icon.jsx'

import {
  useSiteConfig,
} from '../hooks/useSiteConfig.jsx'


export default function WhatsappFab() {
  const config =
    useSiteConfig()


  const href =
    config.whatsAppContatoUrl ??
    config.whatsAppUrl


  /*
    Sem WhatsApp configurado:
    não mostra o botão.
  */
  if (!href) {
    return null
  }


  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com Duda Pelas Lentes pelo WhatsApp"
      title={
        config.whatsAppDisplay
          ? `WhatsApp ${config.whatsAppDisplay}`
          : 'WhatsApp'
      }
    >

      <Icon
        name="whatsapp"
        size={25}
      />

    </a>
  )
}