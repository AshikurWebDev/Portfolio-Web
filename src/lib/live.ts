import { apiEnabled, API_BASE } from '../data/api'
import { queryClient, queryKeys } from '../data/queryClient'

/*
  Live updates. The API broadcasts "contentChanged(topic)" over SignalR whenever the admin
  (or an AI agent) changes public content. Each open page then refetches just that content,
  so a new design, skill or CV shows up without a reload.

  The SignalR client (@microsoft/signalr) is loaded only after the page is idle, so it never
  slows the first paint. If the connection fails, nothing breaks: the page keeps its data and
  TanStack Query refetches on the next visit as usual.

  Topics must match api/src/Portfolio.Application/Common/Interfaces/SiteTopics.cs.
*/
const topics: Record<string, readonly unknown[]> = {
  design: queryKeys.designPosts,
  skills: queryKeys.skills,
  cv: queryKeys.cv,
  posts: queryKeys.posts,
}

let started = false

export function startLiveUpdates(): void {
  if (started || !apiEnabled || typeof window === 'undefined') return
  started = true

  const connect = async () => {
    try {
      const signalR = await import('@microsoft/signalr')
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE}/hubs/site`)
        // Retry after 0, 2, 10 and 30 s, then every 60 s while the tab stays open.
        .withAutomaticReconnect({ nextRetryDelayInMilliseconds: (ctx) => [0, 2000, 10000, 30000][ctx.previousRetryCount] ?? 60000 })
        .configureLogging(signalR.LogLevel.None)
        .build()

      connection.on('contentChanged', (topic: string) => {
        const key = topics[topic]
        if (key) queryClient.invalidateQueries({ queryKey: key })
      })
      // After a reconnect we may have missed messages: refetch everything that is live.
      connection.onreconnected(() => {
        Object.values(topics).forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      })

      await connection.start()
    } catch {
      // API unreachable or SignalR blocked: live updates are a bonus, the page works without them.
    }
  }

  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
  if (idle) idle(() => void connect())
  else window.setTimeout(() => void connect(), 2000)
}
