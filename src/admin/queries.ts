import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../data/queryClient'
import { api } from './client'
import type { AdminDesignPost, AdminOverview, AdminPost, ApiToken, ContactMessageRow, CvInfo, FigureInfo, SavePost, SaveSkill, UpdateDesignPost } from './types'
import type { SkillGroup } from '../content/skills'

/*
  TanStack Query hooks for the admin. Every mutation that changes posts also
  invalidates the public post queries, so the blog shows the change at once.
*/
const adminKeys = {
  posts: ['admin', 'posts'] as const,
  post: (id: string) => ['admin', 'posts', id] as const,
  messages: ['admin', 'messages'] as const,
  tokens: ['admin', 'api-tokens'] as const,
  figures: ['figures'] as const,
  design: ['admin', 'design-posts'] as const,
  skills: ['admin', 'skills'] as const,
  cv: ['admin', 'cv'] as const,
  overview: ['admin', 'overview'] as const,
}

export const useAdminPosts = () => useQuery({ queryKey: adminKeys.posts, queryFn: () => api<AdminPost[]>('/api/admin/posts') })

export const useAdminPost = (id: string | null) =>
  useQuery({ queryKey: adminKeys.post(id ?? 'new'), queryFn: () => api<AdminPost>(`/api/admin/posts/${id}`), enabled: !!id })

export const useFigures = () =>
  useQuery({ queryKey: adminKeys.figures, queryFn: () => api<FigureInfo[]>('/api/figures'), staleTime: Infinity })

export const useMessages = () => useQuery({ queryKey: adminKeys.messages, queryFn: () => api<ContactMessageRow[]>('/api/admin/messages') })

export const useTokens = () => useQuery({ queryKey: adminKeys.tokens, queryFn: () => api<ApiToken[]>('/api/admin/api-tokens') })

function useInvalidatePosts() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: adminKeys.posts })
    qc.invalidateQueries({ queryKey: queryKeys.posts })
  }
}

export function useSavePost() {
  const invalidate = useInvalidatePosts()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string | null; body: SavePost }) =>
      id
        ? api<AdminPost>(`/api/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) })
        : api<AdminPost>('/api/admin/posts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (post) => {
      qc.setQueryData(adminKeys.post(post.id), post)
      invalidate()
    },
  })
}

export function usePostAction() {
  const invalidate = useInvalidatePosts()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'publish' | 'unpublish' | 'delete' }): Promise<AdminPost | null> => {
      if (action === 'delete') {
        await api<void>(`/api/admin/posts/${id}`, { method: 'DELETE' })
        return null
      }
      return api<AdminPost>(`/api/admin/posts/${id}/${action}`, { method: 'POST' })
    },
    onSuccess: (post, { id }) => {
      if (post) qc.setQueryData(adminKeys.post(id), post)
      invalidate()
    },
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/messages/${id}/read`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.messages }),
  })
}

export function useCreateToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; expiresInDays: number }) =>
      api<{ token: string; details: ApiToken }>('/api/admin/api-tokens', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.tokens }),
  })
}

export function useRevokeToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/api-tokens/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.tokens }),
  })
}

/* ---------- Design gallery ---------- */

export const useAdminDesign = () =>
  useQuery({ queryKey: adminKeys.design, queryFn: () => api<AdminDesignPost[]>('/api/admin/design-posts') })

/** Every design change refreshes the admin list and the public gallery. */
function useInvalidateDesign() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: adminKeys.design })
    qc.invalidateQueries({ queryKey: queryKeys.designPosts })
  }
}

/** Upload: multipart form with file, caption and optional link. The API compresses to WebP. */
export function useCreateDesign() {
  const invalidate = useInvalidateDesign()
  return useMutation({
    mutationFn: ({ file, caption, link }: { file: File; caption: string; link: string }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('caption', caption)
      if (link.trim()) form.append('link', link.trim())
      return api<AdminDesignPost>('/api/admin/design-posts', { method: 'POST', body: form })
    },
    onSuccess: invalidate,
  })
}

export function useUpdateDesign() {
  const invalidate = useInvalidateDesign()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDesignPost }) =>
      api<AdminDesignPost>(`/api/admin/design-posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })
}

export function useReplaceDesignImage() {
  const invalidate = useInvalidateDesign()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const form = new FormData()
      form.append('file', file)
      return api<AdminDesignPost>(`/api/admin/design-posts/${id}/image`, { method: 'PUT', body: form })
    },
    onSuccess: invalidate,
  })
}

/** Saves the whole order at once. Updates the list optimistically so moves feel instant. */
export function useReorderDesign() {
  const invalidate = useInvalidateDesign()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api<void>('/api/admin/design-posts/order', { method: 'PUT', body: JSON.stringify({ ids }) }),
    onMutate: (ids) => {
      const before = qc.getQueryData<AdminDesignPost[]>(adminKeys.design)
      if (before) qc.setQueryData(adminKeys.design, ids.map((id) => before.find((d) => d.id === id)!).filter(Boolean))
      return { before }
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.before) qc.setQueryData(adminKeys.design, ctx.before)
    },
    onSettled: invalidate,
  })
}

export function useDeleteDesign() {
  const invalidate = useInvalidateDesign()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/admin/design-posts/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

/* ---------- Overview ---------- */

export const useOverview = () => useQuery({ queryKey: adminKeys.overview, queryFn: () => api<AdminOverview>('/api/admin/overview') })

/* ---------- Skills ---------- */

export const useAdminSkills = () => useQuery({ queryKey: adminKeys.skills, queryFn: () => api<SkillGroup[]>('/api/admin/skills') })

/** Every skills change refreshes the admin list, the public Skills section and the overview counts. */
function useInvalidateSkills() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: adminKeys.skills })
    qc.invalidateQueries({ queryKey: queryKeys.skills })
    qc.invalidateQueries({ queryKey: adminKeys.overview })
  }
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) })

export function useCreateSkillGroup() {
  const onSuccess = useInvalidateSkills()
  return useMutation({ mutationFn: (name: string) => api<SkillGroup>('/api/admin/skills/groups', json('POST', { name })), onSuccess })
}

export function useRenameSkillGroup() {
  const onSuccess = useInvalidateSkills()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api<SkillGroup>(`/api/admin/skills/groups/${id}`, json('PUT', { name })),
    onSuccess,
  })
}

export function useDeleteSkillGroup() {
  const onSuccess = useInvalidateSkills()
  return useMutation({ mutationFn: (id: string) => api<void>(`/api/admin/skills/groups/${id}`, { method: 'DELETE' }), onSuccess })
}

export function useReorderSkillGroups() {
  const onSuccess = useInvalidateSkills()
  return useMutation({ mutationFn: (ids: string[]) => api<void>('/api/admin/skills/groups/order', json('PUT', { ids })), onSuccess })
}

export function useCreateSkill() {
  const onSuccess = useInvalidateSkills()
  return useMutation({
    mutationFn: ({ groupId, body }: { groupId: string; body: SaveSkill }) => api(`/api/admin/skills/groups/${groupId}/skills`, json('POST', body)),
    onSuccess,
  })
}

export function useUpdateSkill() {
  const onSuccess = useInvalidateSkills()
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: SaveSkill }) => api(`/api/admin/skills/${id}`, json('PUT', body)), onSuccess })
}

export function useDeleteSkill() {
  const onSuccess = useInvalidateSkills()
  return useMutation({ mutationFn: (id: string) => api<void>(`/api/admin/skills/${id}`, { method: 'DELETE' }), onSuccess })
}

export function useReorderSkills() {
  const onSuccess = useInvalidateSkills()
  return useMutation({
    mutationFn: ({ groupId, ids }: { groupId: string; ids: string[] }) => api<void>(`/api/admin/skills/groups/${groupId}/skills/order`, json('PUT', { ids })),
    onSuccess,
  })
}

/* ---------- CV ---------- */

/** The current CV, or null when none is uploaded (the API answers 204). */
export const useAdminCv = () => useQuery({ queryKey: adminKeys.cv, queryFn: async () => (await api<CvInfo | undefined>('/api/admin/cv')) ?? null })

function useInvalidateCv() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: adminKeys.cv })
    qc.invalidateQueries({ queryKey: queryKeys.cv })
    qc.invalidateQueries({ queryKey: adminKeys.overview })
  }
}

export function useUploadCv() {
  const onSuccess = useInvalidateCv()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api<CvInfo>('/api/admin/cv', { method: 'PUT', body: form })
    },
    onSuccess,
  })
}

export function useDeleteCv() {
  const onSuccess = useInvalidateCv()
  return useMutation({ mutationFn: () => api<void>('/api/admin/cv', { method: 'DELETE' }), onSuccess })
}
