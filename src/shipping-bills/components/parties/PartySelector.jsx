import { useEffect, useState } from 'react'
import { AsyncSelect } from '../common/AsyncSelect'
import { partyService } from '../../services/party-service'

export function PartySelector({
  formCtx,
  ownerName,
  branchName,
  label,
  kind = 'exporter',
  role = 'consignee',
  required = true,
  onQuickAdd,
  onAddBranch
}) {
  const ownerId = formCtx.hooks.watch(ownerName)
  const branchId = formCtx.hooks.watch(branchName)
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Fetch active owner details whenever ownerId changes
  useEffect(() => {
    let active = true
    if (!ownerId) {
      setSelectedOwner(null)
      setSelectedBranch(null)
      return
    }

    const fetcher = kind === 'exporter' ? partyService.getExporterById(ownerId) : partyService.getConsigneeById(ownerId)
    Promise.resolve(fetcher).then((owner) => {
      if (active && owner) {
        setSelectedOwner(owner)
        // If current branch isn't in owner's branches, reset or auto-pick first branch
        const foundBranch = owner.branches.find((b) => String(b.id) === String(branchId))
        if (!foundBranch && owner.branches.length > 0) {
          formCtx.hooks.setValue(branchName, String(owner.branches[0].id), { shouldValidate: true })
          setSelectedBranch(owner.branches[0])
        } else {
          setSelectedBranch(foundBranch || null)
        }
      }
    })

    return () => {
      active = false
    }
  }, [ownerId, branchId, kind, branchName, formCtx.hooks])

  // Update selected branch when branchId changes
  useEffect(() => {
    if (selectedOwner && branchId) {
      const b = selectedOwner.branches.find((br) => String(br.id) === String(branchId))
      setSelectedBranch(b || null)
    }
  }, [branchId, selectedOwner])

  const isExporter = kind === 'exporter'

  return (
    <div className="space-y-2">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Party / Company Selector */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {label} {required && <span className="text-red-500">*</span>}
            </span>
            {onQuickAdd && (
              <button
                type="button"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                onClick={onQuickAdd}>
                + New {isExporter ? 'Exporter' : 'Party'}
              </button>
            )}
          </div>
          <AsyncSelect
            name={ownerName}
            placeholder={`Search ${isExporter ? 'exporter name or IEC' : 'company name'}...`}
            rules={{ required }}
            fetchOptions={async (query) => {
              if (isExporter) {
                const results = await partyService.searchExporters(query)
                return results.map((e) => ({
                  value: String(e.id),
                  label: e.name,
                  sublabel: e.iec ? `IEC: ${e.iec}` : undefined
                }))
              } else if (role === 'buyer') {
                const results = await partyService.searchBuyers(query)
                return results.map((b) => ({
                  value: String(b.id),
                  label: b.name
                }))
              } else if (role === 'thirdParty') {
                const results = await partyService.searchThirdParties(query)
                return results.map((b) => ({
                  value: String(b.id),
                  label: b.name
                }))
              } else {
                const results = await partyService.searchConsignees(query)
                return results.map((c) => ({
                  value: String(c.id),
                  label: c.name
                }))
              }
            }}
            getInitialLabel={async (id) => {
              const res = isExporter
                ? await partyService.getExporterById(id)
                : await partyService.getConsigneeById(id)
              return res ? res.name : ''
            }}
          />
        </div>

        {/* Branch / Operating Address Selector */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Operating Branch / Address {required && <span className="text-red-500">*</span>}
            </span>
            {selectedOwner && onAddBranch && (
              <button
                type="button"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                onClick={() => onAddBranch(selectedOwner.id)}>
                + New Branch
              </button>
            )}
          </div>
          <AsyncSelect
            name={branchName}
            placeholder={selectedOwner ? 'Select branch location...' : `Select ${isExporter ? 'exporter' : 'party'} first`}
            disabled={!selectedOwner}
            rules={{ required: required || !!ownerId }}
            deps={[ownerId]}
            fetchOptions={async (query) => {
              if (!ownerId) return []
              if (isExporter) {
                const branches = await partyService.searchExporterBranches(ownerId, query)
                return branches.map((b) => ({
                  value: String(b.id),
                  label: `${b.branchName} · ${b.city || ''}`,
                  sublabel: [b.address1, b.gstnId ? `GST: ${b.gstnId}` : null].filter(Boolean).join(' | ')
                }))
              } else {
                const branches = await partyService.searchConsigneeBranches(ownerId, query)
                return branches.map((b) => ({
                  value: String(b.id),
                  label: `${b.branchName} · ${b.city || ''}`,
                  sublabel: b.address1
                }))
              }
            }}
            getInitialLabel={async (id) => {
              if (!selectedOwner) return ''
              const b = selectedOwner.branches.find((item) => String(item.id) === String(id))
              return b ? `${b.branchName} · ${b.city || ''}` : ''
            }}
          />
        </div>
      </div>

      {/* Selected Address Preview Card */}
      {selectedBranch && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-gray-100 bg-gray-50/70 px-3 py-1.5 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">{selectedBranch.branchName}:</span>
          <span>{selectedBranch.address1 || 'No street specified'}</span>
          {selectedBranch.city && <span>· {selectedBranch.city}</span>}
          {selectedBranch.state && <span>· {selectedBranch.state}</span>}
          {selectedBranch.pincode && <span>({selectedBranch.pincode})</span>}
          {selectedBranch.gstnId && (
            <span className="rounded bg-gray-200/80 px-1.5 py-0.5 font-mono text-[11px] text-gray-700">
              GST: {selectedBranch.gstnId}
            </span>
          )}
          {selectedBranch.adCode && (
            <span className="rounded bg-primary-100/80 px-1.5 py-0.5 font-mono text-[11px] text-primary-800">
              AD: {selectedBranch.adCode}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
