import { useEffect, useState } from 'react'
import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { SectionHeader } from '../common/SectionHeader'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { AsyncSelect } from '../common/AsyncSelect'
import { lookupService } from '../../services/lookup-service'
import {
  emptyContainer,
  emptyDocument,
  emptyLicense,
  emptyPackingRange
} from '../../domain/shipping-bill-model'

export function OthersTab({ formCtx }) {
  const { register, control } = formCtx.hooks

  const {
    fields: containers,
    append: addContainer,
    remove: removeContainer
  } = useFieldArray({ control, name: 'containers' })

  const {
    fields: packingRanges,
    append: addPackingRange,
    remove: removePackingRange
  } = useFieldArray({ control, name: 'packingRanges' })

  const {
    fields: documents,
    append: addDocument,
    remove: removeDocument
  } = useFieldArray({ control, name: 'documents' })

  const {
    fields: licenses,
    append: addLicense,
    remove: removeLicense
  } = useFieldArray({ control, name: 'licenses' })

  const [containerSizes, setContainerSizes] = useState([])
  const [sealTypes, setSealTypes] = useState([])
  const [fileTypes, setFileTypes] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([
      lookupService.getContainerSizes(),
      lookupService.getSealTypes(),
      lookupService.getFileTypes()
    ]).then(([sizes, seals, files]) => {
      if (active) {
        setContainerSizes(sizes)
        setSealTypes(seals)
        setFileTypes(files)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* 1. Containers */}
      <Card className="shadow-xs border-gray-200">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-950">Cargo Containers ({containers.length})</h3>
            <p className="text-xs text-gray-500">Provide container IDs and electronic seal numbers when shipping via FCL/LCL.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => addContainer(emptyContainer())} className="text-xs">
            + Add Container
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {containers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
              No containers declared. If cargo is containerized, click "+ Add Container".
            </div>
          ) : (
            containers.map((container, index) => (
              <div key={container.id} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-800">Container #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeContainer(index)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Input
                    label="Container Number *"
                    {...register(`containers.${index}.containerNumber`)}
                    placeholder="e.g. MSCU1234567"
                  />
                  <div>
                    {containerSizes.length > 0 && (
                      <Select
                        label="ISO Size"
                        name={`containers.${index}.containerSize`}
                        options={containerSizes}
                        placeholder="Select container size"
                      />
                    )}
                  </div>
                  <Input label="Seal Number" {...register(`containers.${index}.exciseSealNumber`)} placeholder="Seal / e-Seal No." />
                  <div>
                    {sealTypes.length > 0 && (
                      <Select
                        label="Seal Type"
                        name={`containers.${index}.sealType`}
                        options={sealTypes}
                        placeholder="Select type"
                      />
                    )}
                  </div>
                  <Input label="Seal Date" type="date" {...register(`containers.${index}.sealDate`)} />
                  <Input label="Seal Device ID" {...register(`containers.${index}.sealDeviceId`)} placeholder="RFID / IoT ID" />
                  <Input label="Movement Doc Type" {...register(`containers.${index}.movementDocumentType`)} placeholder="e.g. EIR / LEO" />
                  <Input label="Movement Doc No." {...register(`containers.${index}.movementDocumentNumber`)} placeholder="Gate Pass / Ticket" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. Packing List Ranges */}
      <Card className="shadow-xs border-gray-200">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-950">Packing List Serial Ranges ({packingRanges.length})</h3>
            <p className="text-xs text-gray-500">Map package numbers sequentially to packaging types.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => addPackingRange(emptyPackingRange())} className="text-xs">
            + Add Packing Range
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {packingRanges.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
              No packing ranges added yet.
            </div>
          ) : (
            packingRanges.map((range, index) => (
              <div key={range.id} className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 bg-white">
                <span className="col-span-2 sm:col-span-1 text-xs font-semibold text-gray-700 sm:w-16 mb-1 sm:mb-2">
                  Range {index + 1}:
                </span>
                <div className="w-full sm:w-28">
                  <Input
                    label="From #"
                    type="number"
                    {...register(`packingRanges.${index}.packingNumberFrom`)}
                    placeholder="1"
                  />
                </div>
                <div className="w-full sm:w-28">
                  <Input
                    label="To #"
                    type="number"
                    {...register(`packingRanges.${index}.packingNumberTo`)}
                    placeholder="50"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <Input
                    label="Package Code"
                    {...register(`packingRanges.${index}.packingCode`)}
                    placeholder="CTN / BOX / BAG"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 sm:ml-auto pt-2 sm:pt-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removePackingRange(index)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Supporting Documents (e-Sanchit) */}
      <Card className="shadow-xs border-gray-200">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-950">Supporting Documents (e-Sanchit IRN) ({documents.length})</h3>
            <p className="text-xs text-gray-500">Link uploaded digital documents using Indian Customs e-SANCHIT Image Reference Numbers.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => addDocument(emptyDocument())} className="text-xs">
            + Add Document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
              No supporting documents added. Click "+ Add Document" to attach e-Sanchit IRN.
            </div>
          ) : (
            documents.map((doc, index) => (
              <div key={doc.id} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-800">Document #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDocument(index)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-900">Document Type Code *</label>
                    <AsyncSelect
                      name={`documents.${index}.documentTypeCode`}
                      placeholder="Search e-Sanchit doc code (e.g. 380000 - Commercial Invoice)..."
                      fetchOptions={async (query) => {
                        const results = await lookupService.searchDocumentCodes(query)
                        return results.map((d) => ({ value: d.value, label: `${d.value} · ${d.label}` }))
                      }}
                      getInitialLabel={async (val) => {
                        const d = await lookupService.getDocumentCodeByValue(val)
                        return d ? `${d.value} · ${d.label}` : val
                      }}
                    />
                  </div>
                  <Input
                    label="Image Reference Number (IRN) *"
                    {...register(`documents.${index}.imageReferenceNumber`)}
                    placeholder="16-digit e-Sanchit IRN"
                  />
                  <Input label="Issue Date *" type="date" {...register(`documents.${index}.documentIssueDate`)} />
                </div>

                <CollapsibleSection title="Issuing Authority & Beneficiary Details">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input label="Document Reference Number" {...register(`documents.${index}.documentReferenceNumber`)} />
                    <Input label="Expiry Date" type="date" {...register(`documents.${index}.documentExpiryDate`)} />
                    <div>
                      {fileTypes.length > 0 && (
                        <Select label="File Type" name={`documents.${index}.fileType`} options={fileTypes} />
                      )}
                    </div>
                    <Input label="Issuing Authority Name" {...register(`documents.${index}.issuingPartyName`)} />
                    <Input label="Place of Issue" {...register(`documents.${index}.placeOfIssue`)} />
                    <Input label="Beneficiary Party Name" {...register(`documents.${index}.beneficiaryPartyName`)} />
                  </div>
                </CollapsibleSection>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Export Licenses */}
      <Card className="shadow-xs border-gray-200">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-950">Export Licences ({licenses.length})</h3>
            <p className="text-xs text-gray-500">Provide license registration details for advance authorizations or EPCG schemes.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => addLicense(emptyLicense())} className="text-xs">
            + Add Licence
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {licenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
              No export licences added.
            </div>
          ) : (
            licenses.map((lic, index) => (
              <div key={lic.id} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-800">Licence #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLicense(index)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Input label="Registration Number" {...register(`licenses.${index}.registrationNumber`)} placeholder="DGFT Registration No." />
                  <Input label="Registration Date" type="date" {...register(`licenses.${index}.registrationDate`)} />
                  <Input label="Licence Serial Number" type="number" {...register(`licenses.${index}.licenseSerialNumber`)} />
                  <Input label="Export Quantity" type="number" step="any" {...register(`licenses.${index}.licenseExportQuantity`)} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
