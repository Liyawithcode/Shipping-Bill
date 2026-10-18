import { Button } from 'ui/basic/button'

export function FormActionsBar({
  activeTab,
  onPrevious,
  onSaveAndNext,
  onCancel,
  isSubmitting = false
}) {
  const isFirstTab = activeTab === 'details'
  const isLastTab = activeTab === 'others'

  const tabMeta = {
    details: { step: '1 of 3', title: 'Shipment Basics' },
    invoices: { step: '2 of 3', title: 'Invoices & Items' },
    others: { step: '3 of 3', title: 'Cargo & Documents' }
  }

  const currentStep = tabMeta[activeTab] || tabMeta.details

  return (
    <div className="sticky bottom-0 z-30 mt-6 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md px-3 sm:px-5 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Cancel Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm px-2.5 sm:px-3 font-medium transition-colors shadow-xs">
            Cancel
          </Button>
          <span className="hidden lg:inline text-xs text-gray-400">
            Progress is autosaved
          </span>
        </div>

        {/* Center: Step Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-gray-600 shrink-0">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 font-bold text-primary-700 border border-primary-200">
            {currentStep.step}
          </span>
          <span className="hidden sm:inline text-gray-700 font-medium">
            {currentStep.title}
          </span>
        </div>

        {/* Right: Step Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isFirstTab && (
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={onPrevious}
              disabled={isSubmitting}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs sm:text-sm px-2 sm:px-3 font-medium shadow-xs shrink-0">
              <span className="sm:hidden">← Prev</span>
              <span className="hidden sm:inline">← Previous</span>
            </Button>
          )}

          {!isLastTab ? (
            <Button
              type="button"
              size="sm"
              onClick={onSaveAndNext}
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm px-2.5 sm:px-4 font-semibold shadow-xs hover:shadow transition-all shrink-0">
              <span className="sm:hidden">Next →</span>
              <span className="hidden sm:inline">Save & Next →</span>
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-2.5 sm:px-4 font-semibold shadow-xs hover:shadow transition-all shrink-0">
              <span className="sm:hidden">{isSubmitting ? 'Saving...' : '✓ Complete'}</span>
              <span className="hidden sm:inline">{isSubmitting ? 'Saving...' : '✓ Complete Bill'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
