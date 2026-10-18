import { useEffect, useState } from 'react'
import { routes } from '@/shared/route-paths'
import { invoiceTotal } from '@/shipping-bills/domain/shipping-bill-model'
import { shippingBillService } from '@/shipping-bills/services/shipping-bill-service'
import { navigate } from 'core/routing'
import { toast } from 'core/toast-manager'
import { Badge } from 'ui/basic/badge'
import { Button } from 'ui/basic/button'
import { Card, CardContent } from 'ui/basic/card'
import { Table } from 'ui/basic/table'
import { Input } from 'ui/inputs/input'

export default function ListDashboard() {
  const [bills, setBills] = useState(() => shippingBillService.getInitialBills())
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  const fetchBills = async (isManualClick = false) => {
    setIsLoading(true)
    try {
      const data = await shippingBillService.refresh()
      if (data) {
        setBills([...data])
        if (isManualClick) {
          toast.success(`Successfully refreshed ${data.length} shipping bills`)
        }
      }
    } catch (err) {
      toast.error('Failed to load shipping bills: ' + (err.message || 'Error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBills(false)
    return shippingBillService.subscribe(() => {
      fetchBills(false)
    })
  }, [])

  const handleDownloadPdf = async (bill) => {
    try {
      setDownloadingId(bill.id)
      const res = await shippingBillService.downloadPdf(bill)
      toast.success(`Shipping Bill PDF (${res.filename}) generated & downloaded`)
    } catch (err) {
      toast.error('Failed to generate PDF: ' + (err.message || 'Error'))
    } finally {
      setDownloadingId(null)
    }
  }

  const filtered = bills
    .filter((bill) => {
      const v = bill.values || {}
      const exporter = v.exporterName || ''
      const consignee = v.consigneeName || ''
      const invoices = v.invoices || []
      return [
        bill.id,
        v.jobNumber,
        exporter,
        consignee,
        ...invoices.map((inv) => inv.invoiceNumber)
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    })
    .sort((a, b) => {
      const timeA = a.updated ? new Date(a.updated).getTime() : 0
      const timeB = b.updated ? new Date(b.updated).getTime() : 0
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA)
    })

  const uniqueExportersCount = new Set(
    bills.map((b) => b.values?.exporterName).filter(Boolean)
  ).size

  const uniqueConsigneesCount = new Set(
    bills.map((b) => b.values?.consigneeName).filter(Boolean)
  ).size

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Shipping Bills</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage, and generate customs flat files for your export shipments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBills(true)}
            disabled={isLoading}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium shadow-xs">
            <span className={`inline-block text-sm transition-transform ${isLoading ? 'animate-spin text-primary-600' : ''}`}>↻</span>
            <span>{isLoading ? 'Syncing...' : 'Refresh Bills'}</span>
          </Button>
          <Button onClick={() => navigate(routes.shippingBillNew)}>+ New Shipping Bill</Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-200">
          <CardContent className="pt-5">
            <p className="text-xs font-medium text-gray-500">Total Shipping Bills</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{bills.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-5">
            <p className="text-xs font-medium text-gray-500">Active Exporters</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{uniqueExportersCount || 1}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-5">
            <p className="text-xs font-medium text-gray-500">Overseas Consignees</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{uniqueConsigneesCount || 1}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-gray-200">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="w-full max-w-sm">
              <Input
                label="Search bills"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job, invoice, exporter or consignee..."
              />
            </div>
            <span className="text-xs font-medium text-gray-500">
              Showing {filtered.length} {filtered.length === 1 ? 'bill' : 'bills'}
            </span>
          </div>

          {filtered.length > 0 ? (
            <>
              {/* Mobile Card List (visible on screens < 768px) */}
              <div className="grid gap-3 md:hidden">
                {filtered.map((bill) => {
                  const v = bill.values || {}
                  const exporterName = v.exporterName || '—'
                  const consigneeName = v.consigneeName || '—'
                  const invoices = v.invoices || []
                  const total = invoices.reduce((sum, inv) => sum + invoiceTotal(inv), 0)
                  const currency = invoices[0]?.currency || 'USD'
                  const jobNumberText = v.jobNumber ? `#${v.jobNumber}` : `Bill #${bill.id}`

                  return (
                    <div
                      key={bill.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-950 text-base">{jobNumberText}</span>
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Draft / Ready</Badge>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">Job Date: {v.jobDate || '—'}</span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {bill.updated && !isNaN(new Date(bill.updated).getTime())
                            ? new Date(bill.updated).toLocaleDateString()
                            : ''}
                        </span>
                      </div>

                      <div className="rounded-lg bg-gray-50/80 p-2.5 text-xs space-y-1.5 border border-gray-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-500 font-medium shrink-0">Parties:</span>
                          <span className="text-gray-900 font-semibold truncate text-right">
                            {exporterName} → {consigneeName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-500 font-medium shrink-0">Route:</span>
                          <span className="text-gray-800 font-medium truncate text-right">
                            {v.loadingPort || '—'} → {v.finalDestinationPort || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-500 font-medium shrink-0">Invoices & Value:</span>
                          <span className="text-primary-700 font-bold truncate text-right">
                            {invoices.length} {invoices.length === 1 ? 'inv' : 'invs'} · {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadingId === bill.id}
                          onClick={() => handleDownloadPdf(bill)}
                          className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium py-2">
                          {downloadingId === bill.id ? 'Generating...' : 'Download PDF'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(routes.toShippingBillEdit(bill.id))}
                          className="w-full text-xs font-semibold py-2">
                          Open Form →
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tablet & Desktop Data Table (hidden on mobile, visible on md+) */}
              <div className="hidden md:block">
                <Table className="min-w-[760px]">
                  <thead>
                    <tr>
                      <th>Job / Date</th>
                      <th>Exporter → Consignee</th>
                      <th>Route</th>
                      <th>Invoices & Value</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((bill) => {
                      const v = bill.values || {}
                      const exporterName = v.exporterName || '—'
                      const consigneeName = v.consigneeName || '—'
                      const invoices = v.invoices || []
                      const total = invoices.reduce((sum, inv) => sum + invoiceTotal(inv), 0)
                      const currency = invoices[0]?.currency || 'USD'

                      return (
                        <tr key={bill.id} className="hover:bg-gray-50/50">
                          <td className="font-medium">
                            <span className="font-semibold text-gray-950">
                              {v.jobNumber ? `#${v.jobNumber}` : `Bill #${bill.id}`}
                            </span>
                            <span className="block text-xs font-normal text-gray-500">{v.jobDate || '—'}</span>
                          </td>
                          <td>
                            <span className="font-medium text-gray-900">{exporterName}</span>
                            <span className="block text-xs text-gray-500">to {consigneeName}</span>
                          </td>
                          <td>
                            <span className="text-xs font-medium text-gray-800">
                              {v.loadingPort || '—'} → {v.finalDestinationPort || '—'}
                            </span>
                          </td>
                          <td>
                            <span className="font-medium text-gray-900">
                              {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td>
                            <Badge variant="secondary">Draft / Ready</Badge>
                          </td>
                          <td>
                            <span className="text-xs text-gray-600">
                              {bill.updated && !isNaN(new Date(bill.updated).getTime())
                                ? new Date(bill.updated).toLocaleDateString()
                                : '—'}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={downloadingId === bill.id}
                                onClick={() => handleDownloadPdf(bill)}
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium shadow-xs">
                                {downloadingId === bill.id ? 'Generating...' : 'Download PDF'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(routes.toShippingBillEdit(bill.id))}>
                                Open Form
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center space-y-3">
              <p className="font-medium text-gray-900">
                {search ? 'No matching shipping bills found' : 'No shipping bills created yet'}
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {search
                  ? 'Try searching with different job number, invoice number, or party name.'
                  : 'Get started by creating your first export shipping bill.'}
              </p>
              {!search && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <Button onClick={() => navigate(routes.shippingBillNew)}>
                    + Create First Shipping Bill
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const reset = await shippingBillService.resetToSeedBills()
                      setBills([...reset])
                      toast.success(`Loaded ${reset.length} sample shipping bills`)
                    }}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                    ↻ Load Sample Bills
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
