import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/global.css'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from './data/queryClient'
import { startLiveUpdates } from './lib/live'

// Content changed in the admin appears on open pages without a reload (SignalR, loaded when idle).
startLiveUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
