/*
  About copy and the record beside it. Facts only; no years-of-experience
  claims. The "next" line is a draft for Ashikur to confirm.
  In the record, `strong` lines are emphasised; others are secondary.
*/
import { trainingStatus } from './profile'

export type RecordLine = { text: string; strong?: boolean }

export const about = {
  statement: 'I build ERP systems around how organizations really work, and design what I build.',
  paragraphs: [
    'I work with ASP.NET Core, Entity Framework Core, SQL Server, PostgreSQL and React, and I build Windows desktop apps with WinForms and WPF. Working inside a coaching center showed me how fees, attendance and exams really run, so I build software around the real process, not around a template.',
    'I graduated from the University of Chittagong, and I trained through the IsDB-BISEW IT Scholarship (Round 71, Jupiter Technologies Ltd., January to December 2026), a full-time, merit-selected C#.NET programme from the Islamic Development Bank and BISEW. It took me from SQL Server and C# through ADO.NET, ASP.NET MVC and Web API to ASP.NET Core, Angular and React. Graphic design helps me make screens people understand without training.',
  ],
  next: 'Next, I want to join a team building ERP or business software full-time and grow on larger systems.',
  record: [
    {
      label: 'Building',
      lines: [
        { text: 'Coaching Center ERP (in daily use)', strong: true },
        { text: 'Land Syndicate SaaS (in development)', strong: true },
      ],
    },
    {
      label: 'Education',
      lines: [
        { text: 'IsDB-BISEW IT Scholarship', strong: true },
        { text: 'Application Development with Microsoft C#.NET' },
        { text: `Round 71 · Jupiter Technologies Ltd., Dhaka · Jan – Dec 2026 (${trainingStatus().split(' ')[0]})` },
        { text: 'University of Chittagong', strong: true },
        { text: 'MS · 2023–2024 · CGPA 3.86 / 4.00' },
        { text: 'BSc (Hons) · 2019–2023 · CGPA 3.63 / 4.00' },
      ],
    },
    {
      label: 'Also',
      lines: [{ text: 'Graphic design for Educatory', strong: true }],
    },
    {
      label: 'Based in',
      lines: [{ text: 'Dhaka, Bangladesh', strong: true }],
    },
  ] satisfies { label: string; lines: RecordLine[] }[],
}
