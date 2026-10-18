import { ConfirmDeleteDialog } from 'core/components/confirm-delete-component'
import { init } from 'core/init'
import { queryClient, QueryClientProvider, ReactQueryDevtools } from 'core/react-query'
import { addInterceptors } from 'core/request'
import { initRouter } from 'core/routing'
import { Router } from 'core/routing/route-utils'
import { routeToReactElement } from 'core/routing/render-route'
import { ToastManager } from 'core/toast-manager-component'
import 'ui/styles.css'
import { onError, onRequest, onResponse } from './shared/interceptors'
import { routeObjects } from './shared/routes'

// Enforce pure light mode only
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark')
  document.documentElement.classList.add('light')
  document.documentElement.style.colorScheme = 'light'
  try {
    localStorage.setItem('z-dark', 'false')
  } catch {
    // Ignore storage issues
  }
}

addInterceptors({ onRequest, onResponse, onError })
initRouter(routeObjects)

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router renderRoute={routeToReactElement} />
      <ToastManager />
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {import.meta.env.DEV && ReactQueryDevtools && <ReactQueryDevtools initialIsOpen={true} client={queryClient} />}
      <ConfirmDeleteDialog />
    </QueryClientProvider>
  )
}

init(<App />)
