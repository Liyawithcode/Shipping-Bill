import { workflowSteps } from '../../domain/workflow-steps'

export function WorkflowIndicator() {
  return (
    <div>
      {/* Mobile Compact Workflow Indicator (screens < 640px) */}
      <div className="sm:hidden rounded-lg border border-primary-200 bg-primary-50/50 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white shadow-2xs">
              1
            </span>
            <span className="font-semibold text-gray-950 text-xs">Current: Shipping Bill Creation</span>
          </div>
          <span className="text-[11px] font-semibold text-primary-700 bg-primary-100/80 px-2 py-0.5 rounded-full">
            Step 1 of 4
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.id}
              title={step.title}
              className={`h-1.5 rounded-full transition-colors ${
                idx === 0 ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tablet & Desktop Workflow Cards */}
      <div className="hidden sm:grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {workflowSteps.map((step, index) => {
          const isCurrent = step.id === 'shipping-bill'
          return (
            <div
              key={step.id}
              className={`rounded-lg border p-3 transition-colors ${
                isCurrent
                  ? 'border-primary-300 bg-primary-50/60 shadow-xs ring-1 ring-primary-400/30'
                  : 'border-gray-200 bg-gray-50/80 text-gray-500'
              }`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                  }`}>
                  {index + 1}
                </span>
                <span className={isCurrent ? 'text-primary-950 font-semibold' : 'text-gray-700'}>
                  {step.title}
                </span>
              </div>
              <p className="mt-1 ml-8 text-xs text-gray-500">{step.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
