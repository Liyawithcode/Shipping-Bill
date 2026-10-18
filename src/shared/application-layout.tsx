import { navigate } from 'core/routing'
import { routes } from '@/shared/route-paths'

interface ApplicationLayoutProps {
  children?: React.ReactNode
  maxWidth?: string
}

export function ApplicationLayout({ children, maxWidth }: ApplicationLayoutProps) {
  return (
    <div className="min-h-svh w-full max-w-full overflow-x-hidden bg-slate-50 text-gray-900 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="border-b border-gray-200 bg-white px-3 sm:px-6 py-3 shadow-xs sticky top-0 z-40 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => navigate(routes.dashboard)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(routes.dashboard)}>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white shadow-xs group-hover:bg-primary-700 transition-colors shrink-0 text-sm">
              ES
            </div>
            <div>
              <div className="text-sm font-bold text-gray-950 leading-tight group-hover:text-primary-700 transition-colors">
                Export Software
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-medium hidden sm:block">
                ICEGATE Shipping Bills Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-emerald-700 border border-emerald-200 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Live System
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="grow p-3 sm:p-6 lg:p-8 print:p-0">
        <div className="mx-auto h-full" style={{ maxWidth: maxWidth ?? '80rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
