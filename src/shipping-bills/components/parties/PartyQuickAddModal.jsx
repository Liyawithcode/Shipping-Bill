import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { partyService } from '../../services/party-service'
import { toast } from 'core/toast-manager'

export function PartyQuickAddModal({ kind, role = 'consignee', onClose, onSaved }) {
  const [name, setName] = useState('')
  const [iec, setIec] = useState('')
  const [branchName, setBranchName] = useState('Head Office')
  const [address1, setAddress1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [countryCode, setCountryCode] = useState(kind === 'exporter' ? 'IN' : 'US')
  const [gstnId, setGstnId] = useState('')
  const [adCode, setAdCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isExporter = kind === 'exporter'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Party name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const firstBranch = {
        branchName: branchName.trim() || 'Head Office',
        address1: address1.trim(),
        city: city.trim(),
        state: state.trim(),
        countryCode: countryCode.trim() || (isExporter ? 'IN' : 'US'),
        ...(isExporter && gstnId ? { gstnId: gstnId.trim() } : {}),
        ...(isExporter && adCode ? { adCode: adCode.trim() } : {})
      }

      let savedRecord
      if (isExporter) {
        savedRecord = await partyService.saveExporter({
          name: name.trim(),
          iec: iec.trim(),
          class: 'F',
          type: 'P',
          firstBranch
        })
        toast.success(`Exporter "${savedRecord.name}" added successfully`)
      } else {
        savedRecord = await partyService.saveBusiness({
          name: name.trim(),
          iec: iec.trim(),
          isConsignee: role === 'consignee',
          isBuyer: role === 'buyer',
          isThirdParty: role === 'thirdParty',
          firstBranch
        })
        toast.success(`Party "${savedRecord.name}" added successfully`)
      }

      onSaved(savedRecord)
      onClose()
    } catch (err) {
      toast.error('Failed to save party: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs">
      <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-950">
              {isExporter ? 'Add New Exporter' : `Add New Party (${role})`}
            </h3>
            <p className="text-xs text-gray-500">Quickly register this party and its primary branch address.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600">
            ✕
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paramount Exports Pvt Ltd"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">IEC Number</label>
                <input
                  type="text"
                  value={iec}
                  onChange={(e) => setIec(e.target.value.toUpperCase())}
                  placeholder="e.g. AABCP1234F"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Factory unit 1"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="e.g. Plot 12, Industrial Area"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ludhiana"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Punjab"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {isExporter && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">GSTIN</label>
                    <input
                      type="text"
                      value={gstnId}
                      onChange={(e) => setGstnId(e.target.value.toUpperCase())}
                      placeholder="e.g. 03AABCP1234F1Z5"
                      className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">AD Code</label>
                    <input
                      type="text"
                      value={adCode}
                      onChange={(e) => setAdCode(e.target.value)}
                      placeholder="14-digit bank AD code"
                      className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Party'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
