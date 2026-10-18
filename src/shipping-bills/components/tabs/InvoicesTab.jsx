import { useEffect, useState } from 'react'
import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { SectionHeader } from '../common/SectionHeader'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { PartySelector } from '../parties/PartySelector'
import { InvoiceItemEditor } from './InvoiceItemEditor'
import { lookupService } from '../../services/lookup-service'
import { emptyInvoice, emptyItem, invoiceItemsTotal, invoiceTotal } from '../../domain/shipping-bill-model'

function SingleInvoiceCard({
  formCtx,
  index,
  canRemove,
  onRemove,
  currencies,
  contractTypes,
  paymentTypes,
  priceInclusions,
  onQuickAddParty,
  onQuickAddBranch
}) {
  const { register, control, watch } = formCtx.hooks
  const invoiceValues = watch(`invoices.${index}`) || {}
  const currency = invoiceValues.currency || 'USD'
  const buyerSameAsConsignee = invoiceValues.buyerSameAsConsignee ?? true

  const {
    fields: items,
    append: addItem,
    remove: removeItem
  } = useFieldArray({ control, name: `invoices.${index}.items` })

  const itemsTotal = invoiceItemsTotal(invoiceValues)
  const netTotal = invoiceTotal(invoiceValues)

  return (
    <Card className="shadow-xs border-gray-200">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <h3 className="font-semibold text-gray-950">
              Commercial Invoice {invoiceValues.invoiceNumber ? `#${invoiceValues.invoiceNumber}` : `#${index + 1}`}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">Commercial terms, buyer details, charges, and goods lines.</p>
        </div>
        {canRemove && (
          <Button size="sm" variant="outline" onClick={onRemove} className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs">
            Remove Invoice
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Invoice Key Meta */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Invoice Number *"
            {...register(`invoices.${index}.invoiceNumber`)}
            placeholder="e.g. INV-2026-001"
            rules={{ required: true }}
          />

          <Input
            label="Invoice Date *"
            type="date"
            {...register(`invoices.${index}.invoiceDate`)}
            rules={{ required: true }}
          />

          <div>
            {currencies.length > 0 && (
              <Select
                label="Currency *"
                name={`invoices.${index}.currency`}
                options={currencies}
                rules={{ required: true }}
              />
            )}
          </div>

          <div>
            {contractTypes.length > 0 && (
              <Select
                label="Contract Terms (Incoterm) *"
                name={`invoices.${index}.contractType`}
                options={contractTypes}
                rules={{ required: true }}
              />
            )}
          </div>
        </div>

        {/* Buyer Section */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
            <Checkbox {...register(`invoices.${index}.buyerSameAsConsignee`)} />
            <span>Buyer is the same entity as Consignee</span>
          </label>

          {!buyerSameAsConsignee && (
            <div className="pt-2 border-t border-gray-200/60">
              <PartySelector
                formCtx={formCtx}
                ownerName={`invoices.${index}.buyerId`}
                branchName={`invoices.${index}.buyerBranchId`}
                label="Overseas Buyer"
                kind="business"
                role="buyer"
                required={true}
                onQuickAdd={() => onQuickAddParty('business', 'buyer', index)}
                onAddBranch={(ownerId) => onQuickAddBranch('business', ownerId, `invoices.${index}.buyerBranchId`)}
              />
            </div>
          )}
        </div>

        {/* Financial Charges, Deductions & Terms */}
        <CollapsibleSection title="Invoice Additions, Deductions & Commercial Terms">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label={`Freight Amount (${currency})`}
                type="number"
                step="any"
                {...register(`invoices.${index}.freightAmount`)}
                placeholder="0.00"
              />
              <Input
                label={`Insurance Amount (${currency})`}
                type="number"
                step="any"
                {...register(`invoices.${index}.insuranceAmount`)}
                placeholder="0.00"
              />
              <Input
                label={`Packing Charges (${currency})`}
                type="number"
                step="any"
                {...register(`invoices.${index}.packingCharges`)}
                placeholder="0.00"
              />
              <Input
                label={`Discount (${currency})`}
                type="number"
                step="any"
                {...register(`invoices.${index}.discountAmount`)}
                placeholder="0.00"
              />
              <Input
                label={`Other Deductions (${currency})`}
                type="number"
                step="any"
                {...register(`invoices.${index}.otherDeductionsAmount`)}
                placeholder="0.00"
              />
              <div>
                {priceInclusions.length > 0 && (
                  <Select
                    label="Price Inclusions"
                    name={`invoices.${index}.freightInsuranceIncluded`}
                    options={priceInclusions}
                    placeholder="None"
                  />
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 border-t border-gray-100 pt-3">
              <Input label="Purchase Order / Contract No." {...register(`invoices.${index}.contractNumber`)} />
              <div>
                {paymentTypes.length > 0 && (
                  <Select
                    label="Nature of Payment"
                    name={`invoices.${index}.natureOfPayment`}
                    options={paymentTypes}
                    placeholder="Select payment term"
                  />
                )}
              </div>
              <Input label="Payment Period (Days)" type="number" {...register(`invoices.${index}.periodOfPayment`)} placeholder="30" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Goods Items Lines */}
        <div className="space-y-4 border-t border-gray-100 pt-5">
          <SectionHeader
            title={`Declared Goods Items (${items.length})`}
            description="Detailed product lines, HS classification, UOM, and export values."
            action={
              <Button size="sm" variant="outline" onClick={() => addItem(emptyItem())} className="text-xs">
                + Add Another Item
              </Button>
            }
          />

          <div className="space-y-3">
            {items.map((item, itemIdx) => (
              <InvoiceItemEditor
                key={item.id}
                formCtx={formCtx}
                invoiceIndex={index}
                itemIndex={itemIdx}
                currency={currency}
                canRemove={items.length > 1}
                onRemove={() => removeItem(itemIdx)}
                onQuickAddParty={onQuickAddParty}
                onQuickAddBranch={onQuickAddBranch}
              />
            ))}
          </div>
        </div>

        {/* Invoice Summary Calculation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 border border-gray-200">
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>Items Subtotal: <strong>{currency} {itemsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
            <div>Charges & Deductions included in net total</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Invoice Net Amount</span>
            <div className="text-xl font-bold text-gray-950">
              {currency} {netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InvoicesTab({
  formCtx,
  onQuickAddParty,
  onQuickAddBranch
}) {
  const { control } = formCtx.hooks
  const {
    fields: invoices,
    append: addInvoice,
    remove: removeInvoice
  } = useFieldArray({ control, name: 'invoices' })

  const [currencies, setCurrencies] = useState([])
  const [contractTypes, setContractTypes] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])
  const [priceInclusions, setPriceInclusions] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([
      lookupService.getCurrencies(),
      lookupService.getContractTypes(),
      lookupService.getPaymentTypes(),
      lookupService.getPriceInclusionTypes()
    ]).then(([currs, contracts, payments, inclusions]) => {
      if (active) {
        setCurrencies(currs)
        setContractTypes(contracts)
        setPaymentTypes(payments)
        setPriceInclusions(inclusions)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Export Invoices & Item Declaration</h2>
          <p className="text-xs text-gray-500">Attach commercial invoices and declared goods items under this shipping bill.</p>
        </div>
        <Button onClick={() => addInvoice(emptyInvoice())} className="text-sm">
          + Add Commercial Invoice
        </Button>
      </div>

      <div className="space-y-6">
        {invoices.map((inv, index) => (
          <SingleInvoiceCard
            key={inv.id}
            formCtx={formCtx}
            index={index}
            canRemove={invoices.length > 1}
            onRemove={() => removeInvoice(index)}
            currencies={currencies}
            contractTypes={contractTypes}
            paymentTypes={paymentTypes}
            priceInclusions={priceInclusions}
            onQuickAddParty={onQuickAddParty}
            onQuickAddBranch={onQuickAddBranch}
          />
        ))}
      </div>
    </div>
  )
}
