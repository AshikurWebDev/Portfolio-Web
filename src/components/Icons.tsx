/* Small inline SVG icons. Decorative unless a label is passed by the parent. */
type IconProps = { size?: number }

export function IconDownload({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconArrowRight({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconArrowDown({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14m0 0-5.5-5.5M12 19l5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconGitHub({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 6.8 8.5c-.1-.3-.5-1.3.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.3 0c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.5.1 2.8a3.9 3.9 0 0 1 1.1 2.8c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  )
}

export function IconLinkedIn({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.1 8.2H1.7V22h3.4V8.2ZM3.4 2A2 2 0 1 0 3.4 6a2 2 0 0 0 0-4ZM22 13.8c0-4.2-2.2-6.1-5.2-6.1a4.5 4.5 0 0 0-4 2.2V8.2H9.4V22h3.4v-6.8c0-1.8.3-3.5 2.6-3.5 2.2 0 2.3 2.1 2.3 3.6V22H22v-8.2Z" />
    </svg>
  )
}

export function IconWhatsApp({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  )
}

export function IconMail({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconFacebook({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

export function IconMenu({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconClose({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
