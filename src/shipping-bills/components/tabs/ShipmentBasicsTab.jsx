import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { SectionHeader } from '../common/SectionHeader'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { AsyncSelect } from '../common/AsyncSelect'
import { PartySelector } from '../parties/PartySelector'
import { lookupService } from '../../services/lookup-service'
import { shippingBillService } from '../../services/shipping-bill-service'
import { portCountry } from '../../domain/shipping-bill-model'

export function ShipmentBasicsTab({
  formCtx,
  onQuickAddParty,
  onQuickAddBranch
}) {
  const { register, watch, setValue } = formCtx.hooks
  const exporterId = watch('exporterId')
  const loadingPort = watch('loadingPort')
  const finalDestinationPort = watch('finalDestinationPort')
  const grossWeight = watch('grossWeight')
  const netWeight = watch('netWeight')

  // Asynchronously fetched options from lookup service
  const [cargoOptions, setCargoOptions] = useState([])
  const [weightUnits, setWeightUnits] = useState([])
  const [sealTypes, setSealTypes] = useState([])
  const [nfeiCategories, setNfeiCategories] = useState([])
  const [marksOptions, setMarksOptions] = useState([])
  const [marksLoading, setMarksLoading] = useState(false)

  // Load standard reference options on mount
  useEffect(() => {
    let active = true
    Promise.all([
      lookupService.getCargoOptions(),
      lookupService.getWeightUnits(),
      lookupService.getSealTypes(),
      lookupService.getNfeiCategories()
    ]).then(([cargo, units, seals, nfei]) => {
      if (active) {
        setCargoOptions(cargo)
        setWeightUnits(units)
        setSealTypes(seals)
        setNfeiCategories(nfei)
      }
    })
    return () => {
      active = false
    }
  }, [])

  // Asynchronously fetch marks & numbers whenever exporter changes
  useEffect(() => {
    let active = true
    if (!exporterId) {
      setMarksOptions([])
      return
    }

    setMarksLoading(true)
    shippingBillService
      .getMarksAndNumbersOptions(exporterId)
      .then((opts) => {
        if (active) {
          setMarksOptions(opts)
          setMarksLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setMarksOptions([])
          setMarksLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [exporterId])

  // Domain check: Net Weight vs Gross Weight
  const hasWeightWarning =
    grossWeight &&
    netWeight &&
    !isNaN(Number(grossWeight)) &&
    !isNaN(Number(netWeight)) &&
    Number(netWeight) > Number(grossWeight)

  return (
    <Card className="shadow-xs border-gray-200">
      <CardHeader
        title="Shipment & Export Job Basics"
        description="Core parties, ports of transit, and package measurements required for Indian Customs (ICEGATE)."
      />
      <CardContent className="space-y-6 pt-2">
        {/* Job Identification */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Job Number" {...register('jobNumber')} placeholder="e.g. 2081" />
          <Input label="Job Date *" type="date" {...register('jobDate')} rules={{ required: true }} />
        </div>

        {/* Section 1: Parties */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <SectionHeader
            title="Export Parties"
            description="Declare registered Indian Exporter and Foreign Consignee."
          />
          <PartySelector
            formCtx={formCtx}
            ownerName="exporterId"
            branchName="exporterBranchId"
            label="Exporter"
            kind="exporter"
            required={true}
            onQuickAdd={() => onQuickAddParty('exporter')}
            onAddBranch={(ownerId) => onQuickAddBranch('exporter', ownerId, 'exporterBranchId')}
          />
          <PartySelector
            formCtx={formCtx}
            ownerName="consigneeId"
            branchName="consigneeBranchId"
            label="Consignee"
            kind="business"
            role="consignee"
            required={true}
            onQuickAdd={() => onQuickAddParty('business', 'consignee')}
            onAddBranch={(ownerId) => onQuickAddBranch('business', ownerId, 'consigneeBranchId')}
          />
        </div>

        {/* Section 2: Route & Ports */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <SectionHeader
            title="Customs Route & Ports"
            description="Select Indian Customs loading port and foreign destination."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Port of Loading (India) <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                name="loadingPort"
                placeholder="Search Indian loading port..."
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await lookupService.searchLoadingPorts(query)
                  return res.map((p) => ({
                    value: p.code,
                    label: `${p.name} · ${p.code}`,
                    sublabel: `State: ${p.state || 'India'}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const p = await lookupService.getPortByCode(code)
                  return p ? `${p.name} · ${p.code}` : code
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Final Destination Port <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                name="finalDestinationPort"
                placeholder="Search international port..."
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await lookupService.searchDestinationPorts(query)
                  return res.map((p) => ({
                    value: p.code,
                    label: `${p.name} · ${p.code}`,
                    sublabel: `Country: ${portCountry(p.code) || p.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const p = await lookupService.getPortByCode(code)
                  return p ? `${p.name} · ${p.code}` : code
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Route Summary:</span>
            <span>{portCountry(loadingPort) || 'India'}</span>
            <span>→</span>
            <span>{portCountry(finalDestinationPort) || 'Destination Country'}</span>
          </div>

          <CollapsibleSection title="Port & Regulatory Exceptions (Discharge, State, NFEI, RBI Waiver)">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">Discharge Port</label>
                <AsyncSelect
                  name="dischargePort"
                  placeholder="Defaults to destination"
                  fetchOptions={async (query) => {
                    const res = await lookupService.searchDestinationPorts(query)
                    return res.map((p) => ({
                      value: p.code,
                      label: `${p.name} · ${p.code}`
                    }))
                  }}
                  getInitialLabel={async (code) => {
                    const p = await lookupService.getPortByCode(code)
                    return p ? `${p.name} · ${p.code}` : code
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">Origin State</label>
                <AsyncSelect
                  name="originStateCode"
                  placeholder="Defaults to branch state"
                  fetchOptions={async (query) => {
                    const states = await lookupService.getStates(query)
                    return states.map((s) => ({ value: s.value, label: s.label }))
                  }}
                />
              </div>

              <div>
                {nfeiCategories.length > 0 && (
                  <Select
                    label="NFEI Category"
                    name="nfeiCategory"
                    options={nfeiCategories}
                    placeholder="Not applicable (Commercial)"
                  />
                )}
              </div>

              <Input label="RBI Waiver Number" {...register('rbiWaiverNumber')} placeholder="GR Waiver No." />
              <Input label="RBI Waiver Date" type="date" {...register('rbiWaiverDate')} />
            </div>
          </CollapsibleSection>
        </div>

        {/* Section 3: Package Measurements & Weights */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <SectionHeader
            title="Cargo & Package Details"
            description="Declared weights, measurement unit, package count, and markings."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              {cargoOptions.length > 0 && (
                <Select label="Nature of Cargo" name="natureOfCargo" options={cargoOptions} />
              )}
            </div>

            <div>
              <Input
                label="Gross Weight"
                type="number"
                step="any"
                {...register('grossWeight')}
                placeholder="Total packed weight"
              />
            </div>

            <div>
              <Input
                label="Net Weight"
                type="number"
                step="any"
                {...register('netWeight')}
                placeholder="Weight excluding packing"
              />
            </div>

            <div>
              {weightUnits.length > 0 && (
                <Select label="Weight Unit" name="measurementUnit" options={weightUnits} />
              )}
            </div>
          </div>

          {/* Domain Validation Alert */}
          {hasWeightWarning && (
            <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              <span className="font-semibold">Customs Rule Warning:</span>
              Net Weight ({netWeight}) cannot exceed Gross Weight ({grossWeight}). Please verify package figures.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Total Packages"
              type="number"
              {...register('totalPackages')}
              placeholder="e.g. 50"
            />

            <div className="sm:col-span-3">
              {marksOptions.length > 0 ? (
                <Select
                  label="Marks & Numbers"
                  name="marksAndNumbers"
                  options={marksOptions}
                  placeholder={marksLoading ? 'Loading marks...' : 'Select or type marks'}
                />
              ) : (
                <Input
                  label="Marks & Numbers"
                  {...register('marksAndNumbers')}
                  placeholder={exporterId ? 'e.g. AT/USA/2081 or AS PER INVOICE' : 'Select exporter first'}
                />
              )}
            </div>
          </div>

          <CollapsibleSection title="Additional Cargo Transport Identifiers">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                {sealTypes.length > 0 && (
                  <Select label="Seal Type" name="sealType" options={sealTypes} placeholder="Select seal type" />
                )}
              </div>
              <Input label="Loose Packets" type="number" {...register('loosePackets')} placeholder="0" />
              <Input label="MAWB Number" {...register('mawbNumber')} placeholder="Master Airway Bill" />
              <Input label="HAWB Number" {...register('hawbNumber')} placeholder="House Airway Bill" />
            </div>
          </CollapsibleSection>
        </div>
      </CardContent>
    </Card>
  )
}
