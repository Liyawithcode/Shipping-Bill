import { useEffect, useState } from 'react'
import { Button } from 'ui/basic/button'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncSelect } from '../common/AsyncSelect'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { PartySelector } from '../parties/PartySelector'
import { lookupService } from '../../services/lookup-service'
import { lineTotal } from '../../domain/shipping-bill-model'

export function InvoiceItemEditor({
  formCtx,
  invoiceIndex,
  itemIndex,
  currency = 'USD',
  canRemove = false,
  onRemove,
  onQuickAddParty,
  onQuickAddBranch
}) {
  const { register, watch } = formCtx.hooks
  const basePath = `invoices.${invoiceIndex}.items.${itemIndex}`
  const itemValues = watch(basePath) || {}

  const [tradeAgreements, setTradeAgreements] = useState([])
  const [igstStatuses, setIgstStatuses] = useState([])
  const [selectedScheme, setSelectedScheme] = useState(null)

  // Load trade agreements and IGST payment options
  useEffect(() => {
    let active = true
    Promise.all([lookupService.getTradeAgreements(), lookupService.getIgstPaymentStatuses()]).then(
      ([trades, statuses]) => {
        if (active) {
          setTradeAgreements(trades)
          setIgstStatuses(statuses)
        }
      }
    )
    return () => {
      active = false
    }
  }, [])

  // Check scheme code for drawback eligibility
  useEffect(() => {
    let active = true
    if (itemValues.schemeCode) {
      lookupService.getSchemeCode(itemValues.schemeCode).then((scheme) => {
        if (active) setSelectedScheme(scheme)
      })
    } else {
      setSelectedScheme(null)
    }
    return () => {
      active = false
    }
  }, [itemValues.schemeCode])

  const calculatedTotal = lineTotal(itemValues)
  const isDrawbackEligible =
    selectedScheme &&
    (selectedScheme.drawback === true || selectedScheme.RODTEP === true || selectedScheme.ROSCTL === true)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs space-y-4">
      {/* Item Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800 shrink-0">
            {itemIndex + 1}
          </span>
          <h4 className="text-sm font-semibold text-gray-900">Line Item #{itemIndex + 1}</h4>
          {itemValues.goodsDescription1 && (
            <span className="text-xs text-gray-500 max-w-[140px] sm:max-w-xs truncate">· {itemValues.goodsDescription1}</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-medium text-gray-600">
            Total: <strong className="text-gray-950">{currency} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
          {canRemove && (
            <Button size="sm" variant="ghost" onClick={onRemove} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2">
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Row 1: HS Code, Scheme, Description */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <Input
            label="HS / RITC Code *"
            {...register(`${basePath}.ritcCode`)}
            placeholder="e.g. 61091000"
            rules={{ required: true }}
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-900">Customs Scheme Code</label>
          <AsyncSelect
            name={`${basePath}.schemeCode`}
            placeholder="Search export scheme..."
            fetchOptions={async (query) => {
              const res = await lookupService.searchSchemeCodes(query)
              return res.map((s) => ({
                value: String(s.value),
                label: `${s.value} - ${s.label}`,
                sublabel: s.drawback ? 'Duty Drawback eligible' : undefined
              }))
            }}
            getInitialLabel={async (val) => {
              const s = await lookupService.getSchemeCode(val)
              return s ? `${s.value} - ${s.label}` : val
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <Input
            label="Goods Description *"
            {...register(`${basePath}.goodsDescription1`)}
            placeholder="Commercial description of exported goods"
            rules={{ required: true }}
          />
        </div>
      </div>

      {/* Row 2: Quantity, UOM, Unit Price, Line Total Preview, IGST Status */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
        <div>
          <Input
            label="Quantity *"
            type="number"
            step="any"
            {...register(`${basePath}.quantity`)}
            placeholder="e.g. 100"
            rules={{ required: true }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Unit (UOM) <span className="text-red-500">*</span>
          </label>
          <AsyncSelect
            name={`${basePath}.unitOfMeasurement`}
            placeholder="Unit of measure"
            rules={{ required: true }}
            fetchOptions={async (query) => {
              const units = await lookupService.searchQuantityCodes(query)
              return units.map((u) => ({ value: u.value, label: `${u.value} · ${u.label}` }))
            }}
          />
        </div>

        <div>
          <Input
            label={`Unit Price (${currency}) *`}
            type="number"
            step="any"
            {...register(`${basePath}.unitPrice`)}
            placeholder="0.00"
            rules={{ required: true }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Computed Line Total</label>
          <div className="flex h-9 items-center rounded border border-gray-100 bg-gray-50 px-3 text-sm font-semibold text-gray-900">
            {currency} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          {igstStatuses.length > 0 && (
            <Select
              label="IGST Payment"
              name={`${basePath}.igstPaymentStatus`}
              options={igstStatuses}
              placeholder="Select IGST status"
            />
          )}
        </div>
      </div>

      {/* Conditional Tax Fields when IGST is Paid (P) */}
      {itemValues.igstPaymentStatus === 'P' && (
        <div className="grid gap-3 sm:grid-cols-3 rounded border border-blue-100 bg-blue-50/50 p-3">
          <Input label="Taxable Value (INR)" type="number" {...register(`${basePath}.taxableValue`)} placeholder="0.00" />
          <Input label="IGST Amount (INR)" type="number" {...register(`${basePath}.igstAmount`)} placeholder="0.00" />
          <Input label="Compensation Cess (INR)" type="number" {...register(`${basePath}.cess`)} placeholder="0.00" />
        </div>
      )}

      {/* Row 3: Incentive flags and Drawback fields */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <Checkbox {...register(`${basePath}.rewardItem`)} />
            <span>Claim Export Incentive / RoDTEP</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <Checkbox {...register(`${basePath}.thirdPartyItem`)} />
            <span>Manufactured by Third Party</span>
          </label>
        </div>

        {/* Drawback inputs if scheme supports it */}
        {isDrawbackEligible && (
          <div className="flex flex-wrap items-center gap-2 rounded bg-amber-50/80 px-3 py-1.5 text-xs text-amber-900 border border-amber-200/60">
            <span className="font-semibold">Duty Drawback:</span>
            <div className="w-28">
              <Input
                placeholder="Serial No."
                className="py-1 text-xs"
                {...register(`${basePath}.drawbackSerialNumber`)}
              />
            </div>
            <div className="w-24">
              <Input
                placeholder="Quantity"
                type="number"
                className="py-1 text-xs"
                {...register(`${basePath}.drawbackQuantity`)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Third Party Item Manufacturer Selector */}
      {itemValues.thirdPartyItem && (
        <div className="rounded border border-gray-200 bg-gray-50/60 p-3">
          <PartySelector
            formCtx={formCtx}
            ownerName={`${basePath}.itemThirdPartyId`}
            branchName={`${basePath}.itemThirdPartyBranchId`}
            label="Item Manufacturer / Third Party"
            kind="business"
            role="thirdParty"
            required={false}
            onQuickAdd={() => onQuickAddParty('business', 'thirdParty', invoiceIndex, itemIndex)}
            onAddBranch={(ownerId) => onQuickAddBranch('business', ownerId, `${basePath}.itemThirdPartyBranchId`)}
          />
        </div>
      )}

      {/* Collapsible Advanced Customs & Excise fields */}
      <CollapsibleSection title="Advanced Customs, Excise & Trade Agreement Details">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Present Market Value (PMV)" type="number" {...register(`${basePath}.presentMarketValue`)} placeholder="0.00" />
          <Input label="Number of Units (Rate Basis)" type="number" placeholder="1" {...register(`${basePath}.numberOfUnits`)} />
          <Input label="Item Packages" type="number" {...register(`${basePath}.totalPackage`)} placeholder="Cartons/Bags" />
          <Input label="Origin District Code" {...register(`${basePath}.originDistrictCode`)} placeholder="e.g. 03" />

          {tradeAgreements.length > 0 && (
            <Select
              label="Trade Agreement"
              name={`${basePath}.tradeAgreementsCode`}
              options={tradeAgreements}
              placeholder="Preferential tariff agreement"
            />
          )}

          <Input label="End Use Code" {...register(`${basePath}.endUseOfItem`)} placeholder="e.g. 01 (Commercial)" />
          <Input label="AR4 / Excise Number" {...register(`${basePath}.ar4Number`)} />
          <Input label="AR4 Date" type="date" {...register(`${basePath}.ar4Date`)} />
        </div>
      </CollapsibleSection>
    </div>
  )
}
