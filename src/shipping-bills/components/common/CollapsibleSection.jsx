import { useState } from 'react'

export function CollapsibleSection({ title, children, defaultOpen = false, badge }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <details
      className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}>
      <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-gray-700 select-none">
        <span>{title}</span>
        {badge && (
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-normal text-gray-700">
            {badge}
          </span>
        )}
      </summary>
      <div className="mt-4 border-t border-gray-200/60 pt-3">{children}</div>
    </details>
  )
}
