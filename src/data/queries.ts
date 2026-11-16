import { useQuery } from '@tanstack/react-query'
import { apiEnabled, fallback, loadCvUrl, loadDesignPosts, loadPost, loadPosts, loadSkills } from './api'
import { profile } from '../content/profile'
import { queryKeys } from './queryClient'

/*
  TanStack Query hooks for blog content.
  The static posts render at once as placeholder data; API data replaces
  them when it arrives. If the API is not configured, the loaders return the
  static content directly.
*/

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: loadPosts,
    placeholderData: fallback.posts,
  })
}

/** One post with its body. `data === null` means the post does not exist. */
export function usePost(slug: string) {
  return useQuery({
    queryKey: queryKeys.post(slug),
    queryFn: () => loadPost(slug),
  })
}

/** Skills cards. The static list renders at once; API data replaces it when it arrives. */
export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: loadSkills,
    placeholderData: fallback.skills,
  })
}

/**
 * The "Download CV" link, or null when there is no CV (hide the button then).
 * While the API answers, nothing is shown rather than a link that may 404.
 */
export function useCvUrl(): string | null {
  const { data } = useQuery({
    queryKey: queryKeys.cv,
    queryFn: loadCvUrl,
    placeholderData: apiEnabled ? null : profile.cvUrl || null,
  })
  return data ?? null
}

/** Design gallery items. Local samples render first; the API's replace them, and live updates refetch them. */
export function useDesignPosts() {
  return useQuery({
    queryKey: queryKeys.designPosts,
    queryFn: loadDesignPosts,
    placeholderData: fallback.design,
  })
}
