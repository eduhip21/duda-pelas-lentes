import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

/**
 * Botão da identidade Duda Pelas Lentes.
 * variant: 'solid' (claro sobre foto) | 'gold' | 'outline' | 'dark' | 'ghost'
 */
export default function Button({
  children,
  to,
  href,
  variant = 'solid',
  size = 'md',
  icon,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim()
  const content = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      <span>{children}</span>
    </>
  )

  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>
  if (href)
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    )
  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {content}
    </button>
  )
}
