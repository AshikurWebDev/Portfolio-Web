/*
  "AI-powered ERP" section. The idea: AI agents work with ERP data through an
  MCP server, and every call still goes through the API's role, tenant and
  audit checks, exactly like a person would.

  The chat is a concept demo with sample data and is labelled as such.
  `status` on each capability must stay truthful; change it as work lands.
*/
export type AiCapability = {
  title: string
  text: string
  status: 'Prototype' | 'In development' | 'Planned' | 'Live'
}

export const aiCapabilities: AiCapability[] = [
  {
    title: 'Ask the ERP',
    text: 'Staff ask questions in plain language; the agent answers from live data instead of a report menu.',
    status: 'In development',
  },
  {
    title: 'MCP server for ERP tools',
    text: 'Students, attendance and exams exposed as typed tools an agent can call, nothing more.',
    status: 'In development',
  },
  {
    title: 'Attendance alerts',
    text: 'Flags unusual absence patterns from ZKTeco logs so teachers can follow up early.',
    status: 'In development',
  },
]

export type ChatTurn = {
  question: string
  tool: string
  answer: string
  rows?: [string, string, string][]
}

/** Sample conversation for the concept demo. Rolls and amounts are invented sample data. */
export const chatScript: ChatTurn[] = [
  {
    question: 'How many students are present today, by class?',
    tool: 'attendance.summary(date: "today")',
    answer: '96 of 110 students are present today.',
    rows: [
      ['Class 9', '32 of 36', '89%'],
      ['Class 10', '34 of 38', '89%'],
      ['HSC 2', '30 of 36', '83%'],
    ],
  },
  {
    question: 'Who was absent three days in a row this week?',
    tool: 'attendance.find_streaks(min_days: 3, week: "current")',
    answer: '2 students were absent 3 days in a row. Their guardians have not been contacted yet.',
    rows: [
      ['Roll 1034', 'Class 10', 'Sun to Tue'],
      ['Roll 1078', 'HSC 2', 'Mon to Wed'],
    ],
  },
  {
    question: 'Which Class 10 students scored under 40% in the last math exam?',
    tool: 'exams.find_below(class: "10", subject: "Math", exam: "latest", percent: 40)',
    answer: '2 students in Class 10 scored under 40% in the last math exam.',
    rows: [
      ['Roll 1034', 'Class 10', '36%'],
      ['Roll 1091', 'Class 10', '38%'],
    ],
  },
]

export const aiFlow = [
  { id: 'agent', name: 'AI agent', detail: 'Understands the question, picks a tool' },
  { id: 'mcp', name: 'MCP server', detail: 'Typed ERP tools, nothing else exposed' },
  { id: 'api', name: 'ASP.NET Core API', detail: 'Role and tenant check, audit log' },
  { id: 'db', name: 'SQL Server · PostgreSQL', detail: 'The same data staff work with' },
]
