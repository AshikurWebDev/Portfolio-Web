import { QueryClient } from '@tanstack/react-query'

/*
  One TanStack Query client for the whole site.
  - Public content (projects, posts) rarely changes, so it stays fresh for 5 minutes.
  - One retry only: the static fallback covers a missing API, so long retry loops add nothing.
  - No refetch on window focus: a portfolio page should not flicker when the visitor switches tabs.
*/
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Query keys in one place, so the admin can invalidate exactly what it changed. */
export const queryKeys = {
  posts: ['posts'] as const,
  post: (slug: string) => ['posts', slug] as const,
  projects: ['projects'] as const,
  designPosts: ['design-posts'] as const,
  skills: ['skills'] as const,
  cv: ['cv'] as const,
}
