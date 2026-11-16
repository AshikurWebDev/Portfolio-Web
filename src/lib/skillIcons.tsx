import {
  siAngular,
  siAnthropic,
  siBlazor,
  siBootstrap,
  siClaude,
  siCss,
  siDocker,
  siDotnet,
  siExpress,
  siFigma,
  siGit,
  siGithub,
  siGithubcopilot,
  siGooglegemini,
  siHtml5,
  siHuggingface,
  siJavascript,
  siJquery,
  siLangchain,
  siLinux,
  siModelcontextprotocol,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siOllama,
  siPostgresql,
  siPostman,
  siReact,
  siRedis,
  siRedux,
  siSqlite,
  siSwagger,
  siTailwindcss,
  siTypescript,
  siVite,
  siVuedotjs,
} from 'simple-icons'

/*
  Small flat logos next to each skill.

  The API stores only a key ("react", "postgresql"); this file turns the key into an SVG.
  The list of keys must match api/src/Portfolio.Application/Skills/SkillIcons.cs.

  Brand logos come from Simple Icons (CC0, https://simpleicons.org): one 24x24 path each.
  Brands that Simple Icons does not carry (C#, SQL Server, Windows desktop) and the general
  AI ideas use simple drawn icons instead. Every logo is drawn flat in the ink color, like the
  contact icons in the header, so the list stays calm and easy to scan.
  Named imports keep the bundle small: only the icons listed here are shipped.
*/

export type SkillIcon = {
  /** Shown in the admin picker and used as the tooltip. */
  label: string
  /** Simple Icons path (24x24), or a custom drawing. */
  path?: string
  draw?: () => React.ReactNode
}

const brand = (label: string, icon: { path: string }): SkillIcon => ({ label, path: icon.path })

/** Line icons for things without a brand logo. 24x24, stroked in the current color. */
const line = (label: string, children: React.ReactNode): SkillIcon => ({
  label,
  draw: () => (
    <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  ),
})

export const skillIcons: Record<string, SkillIcon> = {
  // .NET and languages
  dotnet: brand('.NET', siDotnet),
  csharp: {
    label: 'C#',
    // A hexagon badge with "C#" cut out of it.
    draw: () => (
      <>
        <path d="M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75Z" fill="currentColor" />
        <text x="12" y="15.6" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="system-ui, sans-serif" fill="#fff">
          C#
        </text>
      </>
    ),
  },
  blazor: brand('Blazor', siBlazor),
  typescript: brand('TypeScript', siTypescript),
  javascript: brand('JavaScript', siJavascript),

  // Frontend
  react: brand('React', siReact),
  angular: brand('Angular', siAngular),
  vue: brand('Vue', siVuedotjs),
  nextjs: brand('Next.js', siNextdotjs),
  html5: brand('HTML5', siHtml5),
  css: brand('CSS', siCss),
  tailwind: brand('Tailwind CSS', siTailwindcss),
  bootstrap: brand('Bootstrap', siBootstrap),
  jquery: brand('jQuery', siJquery),
  redux: brand('Redux', siRedux),
  vite: brand('Vite', siVite),

  // Backend and data
  nodejs: brand('Node.js', siNodedotjs),
  express: brand('Express', siExpress),
  postgresql: brand('PostgreSQL', siPostgresql),
  mssql: line(
    'SQL Server',
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-13" />
      <path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />
    </>,
  ),
  mysql: brand('MySQL', siMysql),
  sqlite: brand('SQLite', siSqlite),
  mongodb: brand('MongoDB', siMongodb),
  redis: brand('Redis', siRedis),

  // Desktop
  desktop: line(
    'Windows desktop',
    <>
      <rect x="2.5" y="3.5" width="19" height="17" rx="2.5" />
      <path d="M2.5 8h19" />
      <path d="M6 5.75h.01M8.5 5.75h.01" />
    </>,
  ),

  // Tools and platforms
  docker: brand('Docker', siDocker),
  git: brand('Git', siGit),
  github: brand('GitHub', siGithub),
  linux: brand('Linux', siLinux),
  nginx: brand('NGINX', siNginx),
  postman: brand('Postman', siPostman),
  swagger: brand('Swagger', siSwagger),
  figma: brand('Figma', siFigma),

  // AI
  ai: line(
    'AI (sparkle)',
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="M12 7.5 13.6 10.4 16.5 12 13.6 13.6 12 16.5 10.4 13.6 7.5 12 10.4 10.4Z" fill="currentColor" />
    </>,
  ),
  agent: line(
    'AI agent',
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4M9 12.5h.01M15 12.5h.01M9.5 16h5" />
    </>,
  ),
  prompt: line(
    'Prompt',
    <>
      <path d="M4 5.5h16v10H9l-5 4Z" />
      <path d="m8 9 2 1.5L8 12M12 12h4" />
    </>,
  ),
  mcp: brand('MCP', siModelcontextprotocol),
  claude: brand('Claude', siClaude),
  anthropic: brand('Anthropic', siAnthropic),
  gemini: brand('Gemini', siGooglegemini),
  langchain: brand('LangChain', siLangchain),
  ollama: brand('Ollama', siOllama),
  huggingface: brand('Hugging Face', siHuggingface),
  copilot: brand('GitHub Copilot', siGithubcopilot),
}

/** Keys in a stable order, for the admin picker. */
export const skillIconKeys = Object.keys(skillIcons)

/**
 * The logo for a skill, or nothing when the key is empty or unknown.
 * Decorative: the skill name is always written next to it.
 */
export function SkillLogo({ icon, size = 20, className }: { icon?: string | null; size?: number; className?: string }) {
  const def = icon ? skillIcons[icon] : undefined
  if (!def) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ color: 'var(--ink)', flex: 'none' }}
    >
      {def.path ? <path d={def.path} fill="currentColor" /> : def.draw?.()}
    </svg>
  )
}
