/*
  Single source of truth for profile content.
  Values in [brackets] are placeholders waiting on Ashikur. Do not invent
  numbers, clients or experience years here.
*/
export const profile = {
  name: 'Ashikur Rahman',
  role: 'ERP & Full-Stack Developer',
  city: 'Dhaka',
  headline: 'I build ERP systems that organizations actually run on.',
  subline:
    "I'm Ashikur Rahman, a full-stack developer in Dhaka building ERP and SaaS platforms for coaching centers and real estate. Open to full-time ERP and full-stack roles.",
  availableFrom: '1 Jan 2027',
  stack: ['C# / .NET Core', 'PostgreSQL', 'MS SQL Server', 'React + TS'],
  proof: {
    system: 'coaching-erp',
    status: 'in daily use',
    detail: '~110 students · 25 staff',
  },
  /*
    IsDB-BISEW IT Scholarship Programme (Islamic Development Bank + Bangladesh
    Islamic Solidarity Educational Wakf). Programme facts from isdb-bisew.org
    (checked 2026-11-15): full-time, intensive, 8 to 9 months, merit-based
    selection (aptitude test + viva). Track name as the site lists it.
    Modules are the ones in Ashikur's own course folders.
    Round, training centre (TSP) and start month confirmed by Ashikur 2026-11-15;
    JPTL's full name is from the isdb-bisew.org TSP list. Finish date (20 Dec 2026)
    confirmed by Ashikur; trainingStatus() switches the wording after that day.
  */
  training: {
    programme: 'IsDB-BISEW IT Scholarship',
    org: 'Islamic Development Bank · BISEW',
    track: 'Application Development with Microsoft C#.NET',
    shortTrack: 'C#.NET full-stack',
    status: 'final stage',
    format: 'Full-time, 8–9 months, merit-based selection',
    modules: ['SQL Server', 'C#', 'ADO.NET', 'ASP.NET MVC 5', 'Web API 2', 'ASP.NET Core MVC & Web API', 'Angular', 'React'],
    round: 'Round 71' as string | null,
    institute: 'Jupiter Technologies Ltd. (JPTL), Dhaka' as string | null,
    started: 'Jan 2026',
    completed: 'Dec 2026' as string | null,
    completedOn: '2026-12-20',
  },
  cvUrl: '/docs/Ashikur-Rahman-CV.pdf',
  links: {
    github: 'https://github.com/AshikurWebDev',
    linkedin: 'https://www.linkedin.com/in/ashikur-rahaman-6082831a2/',
    // Confirmed by Ashikur 2026-11-16 for the header email icon
    email: 'ashik.cu.ges@gmail.com',
    // Facebook profile, confirmed by Ashikur 2026-11-16.
    facebook: 'https://www.facebook.com/mohammad.rahaman.5623',
    // Set when confirmed (the old site's number looked one digit short). null hides it.
    phone: null as string | null,
    // WhatsApp number confirmed by Ashikur 2026-11-16 (01650040054, Bangladesh +880).
    whatsapp: '+880 1650-040054' as string | null,
  },
} as const

export const navItems = [
  { label: 'Systems', href: '#systems' },
  { label: 'AI ERP', href: '#ai' },
  { label: 'How I build', href: '#how-i-build' },
  { label: 'Skills', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
] as const

/**
 * "completing Dec 2026" until the finish date, then "completed Dec 2026",
 * so the site stays correct without an edit on the day.
 */
export function trainingStatus(now: Date = new Date()): string {
  const t = profile.training
  if (!t.completed) return t.status
  return now >= new Date(`${t.completedOn}T23:59:59`) ? `completed ${t.completed}` : `completing ${t.completed}`
}
