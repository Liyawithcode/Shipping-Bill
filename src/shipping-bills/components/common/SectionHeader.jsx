export function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-gray-950">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
