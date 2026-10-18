import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { partyService } from '../../services/party-service'
import { toast } from 'core/toast-manager'

export function BranchQuickAddModal({ kind, ownerId, onClose, onSaved }) {
  const [branchName, setBranchName] = useState('')
  const [address1, setAddress1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [countryCode, setCountryCode] = useState(kind === 'exporter' ? 'IN' : 'US')
  const [gstnId, setGstnId] = useState('')
  const [adCode, setAdCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isExporter = kind === 'exporter'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!branchName.trim()) {
      toast.error('Branch name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const branchData = {
        branchName: branchName.trim(),
        address1: address1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        countryCode: countryCode.trim() || (isExporter ? 'IN' : 'US'),
        ...(isExporter && gstnId ? { gstnId: gstnId.trim() } : {}),
        ...(isExporter && adCode ? { adCode: adCode.trim() } : {})
      }

      const saved = await partyService.saveBranch(kind, ownerId, branchData)
      toast.success(`Branch "${saved.branchName}" added`)
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error('Failed to add branch: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs">
      <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-950">Add New Branch Address</h3>
            <p className="text-xs text-gray-500">Provide shipping address and location details.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600">
            ✕
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Branch / Location Name *</label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Warehouse 4 or Mumbai Office"
                className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="e.g. 100 Port Road, Terminal 2"
                className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400001"
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {isExporter && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">GSTIN</label>
                  <input
                    type="text"
                    value={gstnId}
                    onChange={(e) => setGstnId(e.target.value.toUpperCase())}
                    placeholder="27AABCP1234F1Z1"
                    className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">AD Code</label>
                  <input
                    type="text"
                    value={adCode}
                    onChange={(e) => setAdCode(e.target.value)}
                    placeholder="AD Code"
                    className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Branch'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
