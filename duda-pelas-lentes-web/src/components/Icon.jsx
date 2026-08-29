// Ícones de traço fino, discretos — usados nos cards de categoria e na interface.
const PATHS = {
  leaf: <path d="M5 21c0-8 5-13 14-14C18 15 13 20 5 21Zm0 0c3-6 7-9 12-10" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.7-3.5 3-5 5.5-5s4.8 1.5 5.5 5" />
      <path d="M16 6.5a3 3 0 0 1 0 5.6M17.5 20c-.3-2-1-3.5-2-4.5" />
    </>
  ),
  heart: <path d="M12 20S4 14.5 4 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8 2.8C20 14.5 12 20 12 20Z" />,
  rings: (
    <>
      <circle cx="9" cy="14" r="5" />
      <circle cx="15" cy="14" r="5" />
      <path d="m8 4 1 3.5M16 4l-1 3.5M12 3v3" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm0 2a7 7 0 0 1 5.9 10.8l.3.5-.6 2.2-2.3-.6-.5.3A7 7 0 1 1 12 5Zm-2.5 3.4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 3 4.5 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2.2-1.6-.2-.3 0-.4.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: <path d="M6 3h3l1.5 5-2 1.5a12 12 0 0 0 6 6l1.5-2 5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 1-2Z" />,
  pin: (
    <>
      <path d="M12 21c4-4.5 7-8 7-11a7 7 0 0 0-14 0c0 3 3 6.5 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  quote: <path d="M9 7c-2.5 1.2-4 3.6-4 6.5V19h5v-5H6.8c0-2 1-3.4 2.7-4.2Zm9 0c-2.5 1.2-4 3.6-4 6.5V19h5v-5h-3.2c0-2 1-3.4 2.7-4.2Z" fill="currentColor" stroke="none" />,
  star: <path d="m12 4 2.3 4.7 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 9.4l5.2-.7Z" fill="currentColor" stroke="none" />,
}

export default function Icon({ name, size = 22, strokeWidth = 1.4, className, ...rest }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  )
}
