import { profile } from '../content/profile'

/*
  Contact links shared by the header dock and the Contact section.

  Email opens Gmail's compose window in a new tab instead of a mailto: link.
  mailto: needs a mail app set up on the visitor's computer; on most office
  Windows PCs nothing is, so the click did nothing. Gmail compose works in any
  browser (and opens the Gmail app on phones). The address stays visible on
  the page for anyone who prefers to copy it.
*/

const SUBJECT = 'Job opportunity'
const WA_TEXT = 'Hi Ashikur, I saw your portfolio and would like to talk about a role.'

export const emailHref =
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.links.email)}` +
  `&su=${encodeURIComponent(SUBJECT)}`

/** wa.me link with a starter message, or null while no WhatsApp number is set. */
export const whatsappHref = profile.links.whatsapp
  ? `https://wa.me/${profile.links.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(WA_TEXT)}`
  : null
