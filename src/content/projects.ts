import type { Project } from '../types/content'

/*
  Projects shown in the Systems section, in `order`.

  To add a project: copy one entry, give it a new id and order, and pick its
  media:
    { type: 'image', src: '/media/projects/my-app.webp', alt: '...' }
    { type: 'video', src: '/media/projects/my-app.mp4', poster: '/media/projects/my-app.webp', alt: '...' }
    { type: 'fragment', id: 'attendance-feed' }   (live UI built in code)
  Put image and video files in web/public/media/projects/.

  Honesty rules: status says what is true today; in-progress features carry
  inProgress: true; links stay null until they are public.
*/
export const projects: Project[] = [
  {
    id: 'coaching-erp',
    order: 1,
    title: 'Coaching Center ERP',
    tags: ['ASP.NET Core', 'React', 'SQL Server', 'ZKTeco'],
    status: 'live',
    statusLabel: 'In daily use',
    facts: [{ label: 'Users', value: '~110 students, 25 staff' }],
    summary:
      'ERP for a Dhaka coaching center: fees, attendance and exams for about 110 students and 25 staff (teachers, administration, support), with ZKTeco fingerprint integration.',
    highlights: [
      { text: 'Fees, attendance and exams' },
      { text: 'Role-based access and audit trail' },
      { text: 'Finance chat with encrypted messages' },
      { text: 'Configurable data retention and archives' },
      { text: 'ZKTeco fingerprint attendance and door access', inProgress: true },
      { text: 'OAuth 2.0 sign-in', inProgress: true },
    ],
    // Swap to { type: 'image', ... } once real screenshots exist
    media: { type: 'fragment', id: 'attendance-feed' },
    tone: 'dark',
    demoUrl: null,
    codeUrl: null,
    caseStudyUrl: null,
  },
  {
    id: 'syndicate-saas',
    order: 2,
    title: 'Land Syndicate SaaS',
    tags: ['ASP.NET Core', 'React', 'PostgreSQL', 'PostGIS'],
    status: 'in-development',
    statusLabel: 'In development',
    facts: [{ label: 'Client', value: 'No live client yet' }],
    summary:
      'A SaaS platform for managing land-pooling syndicates: ownership shares, cash calls, payments and distributions, built for national and international investors.',
    highlights: [
      { text: 'Investor register and ownership shares' },
      { text: 'Cash calls and payment tracking' },
      { text: 'Distribution waterfall' },
      { text: 'Multi-currency with audit trail' },
      { text: 'Parcel map with mouza, dag and khatian (PostGIS)' },
      { text: 'Investor portal and document vault' },
    ],
    media: { type: 'fragment', id: 'parcel-map' },
    tone: 'stone',
    demoUrl: null,
    codeUrl: null,
    caseStudyUrl: null,
  },
]
