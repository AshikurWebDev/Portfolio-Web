/*
  Work experience, newest first. Add a role by copying an entry.
  `end: null` means current. Keep entries factual: role, place, dates, what
  you did. No invented titles or dates.
*/
export type Role = {
  id: string
  title: string
  org: string
  place: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'
  /** e.g. 'Sept 2025' */
  start: string
  end: string | null
  points: string[]
}

export const experience: Role[] = [
  {
    id: 'educatory-teacher',
    title: 'Coaching Teacher, ICT and Physics',
    org: 'Educatory',
    place: 'Dhaka',
    type: 'Part-time',
    start: 'Sept 2025',
    end: null,
    points: [
      'Teach ICT and Physics to English-medium students.',
      'Design the center’s posters and social media posts.',
    ],
  },
]
