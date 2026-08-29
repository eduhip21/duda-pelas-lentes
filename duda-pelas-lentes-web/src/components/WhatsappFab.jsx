import Icon from './Icon.jsx'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

/** Botão flutuante de WhatsApp. Só aparece quando há número configurado. */
export default function WhatsappFab() {
  const { whatsAppUrl } = useSiteConfig()
  if (!whatsAppUrl) return null

  return (
    <a
      className="whatsapp-fab"
      href={whatsAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
    >
      <Icon name="whatsapp" size={28} strokeWidth={1.3} />
    </a>
  )
}
