import { useEffect, useState } from 'react'
import { useForm } from 'core/form'
import { Form } from 'core/form/components'
import { navigate, useParams } from 'core/routing'
import { toast } from 'core/toast-manager'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { routes } from '@/shared/route-paths'

// Services & Domain
import { emptyBill } from './domain/shipping-bill-model'
import { shippingBillSchema, validateDomainRelationships } from './domain/shipping-bill-validation'
import { shippingBillService } from './services/shipping-bill-service'

// UI Components
import { WorkflowIndicator } from './components/workflow/WorkflowIndicator'
import { ShipmentBasicsTab } from './components/tabs/ShipmentBasicsTab'
import { InvoicesTab } from './components/tabs/InvoicesTab'
import { OthersTab } from './components/tabs/OthersTab'
import { Button } from 'ui/basic/button'
import { FormActionsBar } from './components/common/FormActionsBar'
import { PartyQuickAddModal } from './components/parties/PartyQuickAddModal'
import { BranchQuickAddModal } from './components/parties/BranchQuickAddModal'

/**
 * Persistent tab panel keeps form fields mounted so React Hook Form validates
 * all fields across tabs during final submission.
 */
function TabPanel({ id, activeTab, children }) {
  return (
    <div role="tabpanel" hidden={activeTab !== id} className="mt-4">
      {children}
    </div>
  )
}

function BillEditor({ bill, billId }) {
  const formCtx = useForm(shippingBillSchema, {
    defaultValues: bill?.values || emptyBill()
  })

  const { setValue, formState } = formCtx.hooks
  const [activeTab, setActiveTab] = useState('details')
  const [draftId, setDraftId] = useState(billId || bill?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick Add Dialog state
  const [quickAddParty, setQuickAddParty] = useState(null)
  const [quickAddBranch, setQuickAddBranch] = useState(null)

  // Auto-navigate to first tab with validation errors on submit failure
  useEffect(() => {
    if (!formState.submitCount || !Object.keys(formState.errors).length) return
    toast.error('Please check the required fields marked in red')

    const detailsFields = [
      'jobDate',
      'exporterId',
      'exporterBranchId',
      'consigneeId',
      'consigneeBranchId',
      'loadingPort',
      'finalDestinationPort'
    ]

    const hasDetailsError = detailsFields.some((f) => f in formState.errors)
    if (hasDetailsError) {
      setActiveTab('details')
    } else if (formState.errors.invoices) {
      setActiveTab('invoices')
    } else if (
      formState.errors.containers ||
      formState.errors.packingRanges ||
      formState.errors.documents ||
      formState.errors.licenses
    ) {
      setActiveTab('others')
    }
  }, [formState.submitCount, formState.errors])

  // Final Form Submission
  async function handleFinalSubmit(data) {
    // Validate domain relationships (e.g. net weight <= gross weight)
    const domainErrors = validateDomainRelationships(data)
    if (domainErrors) {
      const firstError = Object.values(domainErrors)[0]
      toast.error(firstError)
      return
    }

    setIsSubmitting(true)
    try {
      const saved = await shippingBillService.save(data, draftId)
      setDraftId(saved.id)
      toast.success(bill ? 'Shipping bill updated successfully' : 'Shipping bill created successfully')
      navigate(routes.toShippingBillEdit(saved.id))
    } catch (err) {
      toast.error('Failed to save shipping bill: ' + (err.message || 'Error occurred'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Intermediary tab transition & auto-save draft
  async function handleSaveAndNext() {
    const currentValues = formCtx.hooks.getValues()
    try {
      const saved = await shippingBillService.save(currentValues, draftId)
      setDraftId(saved.id)
      toast.success('Section progress saved')
    } catch {
      // Keep going even if local autosave has an issue
    }

    if (activeTab === 'details') {
      setActiveTab('invoices')
    } else if (activeTab === 'invoices') {
      setActiveTab('others')
    }
  }

  function handlePrevious() {
    if (activeTab === 'others') {
      setActiveTab('invoices')
    } else if (activeTab === 'invoices') {
      setActiveTab('details')
    }
  }

  // Quick Add Party handler
  function handlePartyCreated(party) {
    if (!quickAddParty) return
    const primaryBranchId = party.branches[0]?.id
    if (!primaryBranchId) return

    if (quickAddParty.kind === 'exporter') {
      setValue('exporterId', String(party.id), { shouldValidate: true })
      setValue('exporterBranchId', String(primaryBranchId), { shouldValidate: true })
    } else if (quickAddParty.role === 'consignee') {
      setValue('consigneeId', String(party.id), { shouldValidate: true })
      setValue('consigneeBranchId', String(primaryBranchId), { shouldValidate: true })
    } else if (quickAddParty.role === 'buyer' && quickAddParty.invoiceIndex != null) {
      setValue(`invoices.${quickAddParty.invoiceIndex}.buyerId`, String(party.id), { shouldValidate: true })
      setValue(`invoices.${quickAddParty.invoiceIndex}.buyerBranchId`, String(primaryBranchId), {
        shouldValidate: true
      })
    } else if (
      quickAddParty.role === 'thirdParty' &&
      quickAddParty.invoiceIndex != null &&
      quickAddParty.itemIndex != null
    ) {
      setValue(
        `invoices.${quickAddParty.invoiceIndex}.items.${quickAddParty.itemIndex}.itemThirdPartyId`,
        String(party.id),
        { shouldValidate: true }
      )
      setValue(
        `invoices.${quickAddParty.invoiceIndex}.items.${quickAddParty.itemIndex}.itemThirdPartyBranchId`,
        String(primaryBranchId),
        { shouldValidate: true }
      )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumb */}
      <div>
        <button
          type="button"
          className="mb-2 text-xs font-semibold text-gray-500 hover:text-primary-600 hover:underline cursor-pointer flex items-center gap-1"
          onClick={() => navigate(routes.dashboard)}>
          ← Back to Shipping Bills
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
              {bill ? `Edit Shipping Bill #${bill.values.jobNumber || bill.id}` : 'Create New Shipping Bill'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Indian Customs Electronic Gateway (ICEGATE) export shipping bill creation form.
            </p>
          </div>
          {bill && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const currentVals = formCtx.hooks.getValues()
                await shippingBillService.downloadPdf({ ...bill, values: currentVals })
                toast.success('Shipping Bill PDF downloaded')
              }}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium shadow-xs">
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Visual Workflow Steps */}
      <WorkflowIndicator />

      {/* Main Form Tabs */}
      <Form ctx={formCtx} handleSubmit={handleFinalSubmit} className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(String(val))} className="w-full max-w-full">
          <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none border-b border-gray-200">
            <TabsList className="flex w-max min-w-full justify-start border-none bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="shrink-0 whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700">
                <span className="sm:hidden">1. Basics</span>
                <span className="hidden sm:inline">1. Shipment Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="shrink-0 whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700">
                <span className="sm:hidden">2. Invoices</span>
                <span className="hidden sm:inline">2. Commercial Invoices & Goods</span>
              </TabsTrigger>
              <TabsTrigger
                value="others"
                className="shrink-0 whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700">
                <span className="sm:hidden">3. Cargo & Docs</span>
                <span className="hidden sm:inline">3. Containers, Packing & Docs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Shipment Basics */}
          <TabPanel id="details" activeTab={activeTab}>
            <ShipmentBasicsTab
              formCtx={formCtx}
              onQuickAddParty={(kind, role) => setQuickAddParty({ kind, role })}
              onQuickAddBranch={(kind, ownerId, targetField) =>
                setQuickAddBranch({ kind, ownerId, targetField })
              }
            />
          </TabPanel>

          {/* Tab 2: Commercial Invoices & Goods */}
          <TabPanel id="invoices" activeTab={activeTab}>
            <InvoicesTab
              formCtx={formCtx}
              onQuickAddParty={(kind, role, invoiceIndex, itemIndex) =>
                setQuickAddParty({ kind, role, invoiceIndex, itemIndex })
              }
              onQuickAddBranch={(kind, ownerId, targetField) =>
                setQuickAddBranch({ kind, ownerId, targetField })
              }
            />
          </TabPanel>

          {/* Tab 3: Containers, Packing & Documents */}
          <TabPanel id="others" activeTab={activeTab}>
            <OthersTab formCtx={formCtx} />
          </TabPanel>
        </Tabs>

        {/* Action Controls Bar */}
        <FormActionsBar
          activeTab={activeTab}
          onPrevious={handlePrevious}
          onSaveAndNext={handleSaveAndNext}
          onCancel={() => navigate(routes.dashboard)}
          isSubmitting={isSubmitting}
        />
      </Form>

      {/* Quick Add Party Modal */}
      {quickAddParty && (
        <PartyQuickAddModal
          kind={quickAddParty.kind}
          role={quickAddParty.role}
          onClose={() => setQuickAddParty(null)}
          onSaved={handlePartyCreated}
        />
      )}

      {/* Quick Add Branch Modal */}
      {quickAddBranch && (
        <BranchQuickAddModal
          kind={quickAddBranch.kind}
          ownerId={quickAddBranch.ownerId}
          onClose={() => setQuickAddBranch(null)}
          onSaved={(branch) => {
            setValue(quickAddBranch.targetField, String(branch.id), { shouldValidate: true })
          }}
        />
      )}
    </div>
  )
}

export default function ShippingBillPage() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    if (id) {
      setLoading(true)
      shippingBillService
        .getById(id)
        .then((found) => {
          if (active) {
            if (found) {
              setBill(found)
            } else {
              setNotFound(true)
            }
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setNotFound(true)
            setLoading(false)
          }
        })
    } else {
      setBill(null)
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading shipping bill data...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center space-y-3">
        <h2 className="text-lg font-bold text-gray-950">Shipping Bill Not Found</h2>
        <p className="text-sm text-gray-500">The requested shipping bill could not be found or has been removed.</p>
        <button
          type="button"
          onClick={() => navigate(routes.dashboard)}
          className="rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
          Return to Dashboard
        </button>
      </div>
    )
  }

  return <BillEditor key={id || 'new'} bill={bill} billId={id ? Number(id) : undefined} />
}
