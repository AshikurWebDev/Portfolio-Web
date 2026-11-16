/*
  Skills. Two kinds:
    strengths  - groups with a self-rated level (0-100), shown as bars
    other      - groups shown as plain lists (in-progress work, design)
  Levels are Ashikur's own rating; adjust the numbers here. The label shown
  next to each bar comes from the number (see levelLabel).
*/
/** One skill bar. Same shape as the API's SkillResponse (GET /api/skills). */
export type Skill = { id: string; name: string; level: number; icon?: string | null; note?: string | null }
/** One Skills card. Same shape as the API's SkillGroupResponse. */
export type SkillGroup = { id: string; name: string; skills: Skill[] }

export type ListItem = string | { name: string; inProgress?: boolean }
export type ListGroup = {
  id: string
  name: string
  line: string
  items: ListItem[]
  link?: { label: string; href: string }
}

/*
  Fallback skills, shown when the API is off or unreachable. Normally the Skills section
  comes from the API (GET /api/skills) and is managed in the admin dashboard (/admin/skills).
  The API seeds its first copy from this same list (api/.../Seed/SkillSeed.cs).
*/
const s = (id: string, name: string, level: number, icon: string | null, note?: string): Skill => ({ id, name, level, icon, note })

export const strengths: SkillGroup[] = [
  {
    id: 'dotnet',
    name: 'Backend · .NET',
    skills: [
      s('aspnetcore', 'ASP.NET Core Web API', 100, 'dotnet'),
      s('efcore', 'Entity Framework Core', 80, 'dotnet'),
      s('mvc5', 'ASP.NET MVC 5 / Web API', 80, 'dotnet'),
      s('csharp', 'C#', 100, 'csharp'),
    ],
  },
  {
    id: 'node',
    name: 'Backend · JavaScript',
    skills: [s('nodejs', 'Node.js', 65, 'nodejs'), s('express', 'Express', 65, 'express')],
  },
  {
    id: 'desktop',
    name: 'Desktop',
    skills: [s('winforms', 'Windows Forms', 75, 'desktop'), s('wpf', 'WPF', 70, 'desktop')],
  },
  {
    id: 'data',
    name: 'Databases',
    skills: [s('mssql', 'MS SQL Server', 100, 'mssql'), s('postgresql', 'PostgreSQL', 75, 'postgresql'), s('mongodb', 'MongoDB', 60, 'mongodb')],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    skills: [s('react', 'React + TypeScript', 100, 'react'), s('angular', 'Angular', 50, 'angular', 'normal knowledge')],
  },
  {
    id: 'ai',
    name: 'AI engineering',
    skills: [
      s('agents', 'AI agents', 70, 'agent'),
      s('mcp', 'MCP (Model Context Protocol) servers', 70, 'mcp'),
      s('skills', 'Agent skills', 70, 'ai'),
      s('prompt', 'Prompt engineering', 80, 'prompt'),
      s('harness', 'Agent harness', 65, 'claude'),
    ],
  },
]

export const otherGroups: ListGroup[] = [
  {
    id: 'integrations',
    name: 'Integrations',
    line: 'Hardware and sign-in connected to the ERP.',
    items: [
      { name: 'ZKTeco fingerprint devices', inProgress: true },
      { name: 'Door access control', inProgress: true },
      { name: 'OAuth 2.0 / OpenID Connect', inProgress: true },
    ],
  },
  {
    id: 'design',
    name: 'Graphic design',
    line: 'Posters and social media design for Educatory.',
    items: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe After Effects', 'Social and print design'],
    link: { label: 'See the work on Facebook', href: 'https://www.facebook.com/educatorybd' },
  },
]

export function levelLabel(level: number): string {
  if (level >= 80) return 'Advanced'
  if (level >= 65) return 'Proficient'
  return 'Working knowledge'
}
