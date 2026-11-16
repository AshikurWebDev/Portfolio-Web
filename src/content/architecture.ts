/*
  "How I build": the four layers every system here shares, and the
  cross-cutting features that are actually implemented (confirmed by
  Ashikur): role-based access, multi-tenancy, audit trail, reporting.
  Input validation is not listed until confirmed.
*/
export type Layer = {
  id: 'ui' | 'api' | 'logic' | 'data'
  name: string
  tech: string
  text: string
  features: string[]
}

export const layers: Layer[] = [
  {
    id: 'ui',
    name: 'Interface',
    tech: 'React + TypeScript',
    text: 'Screens built around the real daily work: fee desk, attendance, exams. Each user sees only what their role allows.',
    features: ['Role-based access'],
  },
  {
    id: 'api',
    name: 'API',
    tech: 'ASP.NET Core Web API',
    text: 'REST endpoints between the screens and the rules. Every request is checked against the user’s role and organization.',
    features: ['Role-based access', 'Multi-tenancy'],
  },
  {
    id: 'logic',
    name: 'Business logic',
    tech: 'C# services',
    text: 'Fees, dues, attendance and cash calls live here, in one place, not scattered across screens. Every change is recorded.',
    features: ['Audit trail'],
  },
  {
    id: 'data',
    name: 'Data',
    tech: 'SQL Server · PostgreSQL',
    text: 'A relational schema designed first. Organizations kept apart, history kept for the audit trail, reports read straight from the data.',
    features: ['Multi-tenancy', 'Audit trail', 'Reporting'],
  },
]

export const crossCutting = ['Role-based access', 'Multi-tenancy', 'Audit trail', 'Reporting']
