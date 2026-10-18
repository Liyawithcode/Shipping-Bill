import { s } from 'core/form'

/**
 * Custom schema refinements for domain-specific business rules.
 */
const positiveNumber = s.string().refine((val) => {
  if (val === '' || val == null) return undefined
  const num = Number(val)
  return !isNaN(num) && num > 0 ? undefined : 'Must be greater than 0'
})

const nonNegativeNumber = s.string().refine((val) => {
  if (val === '' || val == null) return undefined
  const num = Number(val)
  return !isNaN(num) && num >= 0 ? undefined : 'Cannot be negative'
})

/**
 * Item schema for goods lines within an export invoice
 */
export const itemSchema = s.object({
  ritcCode: s.string().refine((v) => (v && v.trim() ? undefined : 'HS/RITC Code is required')),
  goodsDescription1: s.string().refine((v) => (v && v.trim() ? undefined : 'Description is required')),
  quantity: positiveNumber,
  unitOfMeasurement: s.string().refine((v) => (v && v.trim() ? undefined : 'Unit is required')),
  unitPrice: positiveNumber,
  schemeCode: s.string().optional(),
  igstPaymentStatus: s.string().optional(),
  taxableValue: nonNegativeNumber.optional(),
  igstAmount: nonNegativeNumber.optional(),
  drawbackSerialNumber: s.string().optional(),
  drawbackQuantity: nonNegativeNumber.optional()
})

/**
 * Invoice schema representing commercial invoice details
 */
export const invoiceSchema = s.object({
  invoiceNumber: s.string().refine((v) => (v && v.trim() ? undefined : 'Invoice number is required')),
  invoiceDate: s.string().refine((v) => (v && v.trim() ? undefined : 'Invoice date is required')),
  currency: s.string().refine((v) => (v && v.trim() ? undefined : 'Currency is required')),
  contractType: s.string().refine((v) => (v && v.trim() ? undefined : 'Contract type is required')),
  freightAmount: nonNegativeNumber.optional(),
  insuranceAmount: nonNegativeNumber.optional(),
  discountAmount: nonNegativeNumber.optional(),
  otherDeductionsAmount: nonNegativeNumber.optional(),
  packingCharges: nonNegativeNumber.optional()
})

/**
 * Top-level Shipping Bill creation & editing form schema.
 * fe-zen-arch resolves nested field rules by their leaf path segment.
 */
export const shippingBillSchema = s.object({
  jobNumber: s.string().optional(),
  jobDate: s.string().refine((v) => (v && v.trim() ? undefined : 'Job date is required')),
  exporterId: s.string().refine((v) => (v && v.trim() ? undefined : 'Please select an exporter')),
  exporterBranchId: s.string().refine((v) => (v && v.trim() ? undefined : 'Please select an exporter branch')),
  consigneeId: s.string().refine((v) => (v && v.trim() ? undefined : 'Please select a consignee')),
  consigneeBranchId: s.string().refine((v) => (v && v.trim() ? undefined : 'Please select a consignee branch')),
  loadingPort: s.string().refine((v) => (v && v.trim() ? undefined : 'Loading port is required')),
  finalDestinationPort: s.string().refine((v) => (v && v.trim() ? undefined : 'Destination port is required')),
  dischargePort: s.string().optional(),
  originStateCode: s.string().optional(),
  nfeiCategory: s.string().optional(),
  rbiWaiverNumber: s.string().optional(),
  rbiWaiverDate: s.string().optional(),
  sealType: s.string().optional(),
  natureOfCargo: s.string().optional(),
  grossWeight: positiveNumber.optional(),
  netWeight: positiveNumber.optional(),
  measurementUnit: s.string().optional(),
  totalPackages: positiveNumber.optional(),
  marksAndNumbers: s.string().optional(),
  loosePackets: nonNegativeNumber.optional(),
  numberOfContainers: nonNegativeNumber.optional(),
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional(),

  // Nested leaf names for fe-zen-arch form validation
  invoiceNumber: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  invoiceDate: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  currency: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  contractType: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  ritcCode: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  goodsDescription1: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  quantity: positiveNumber,
  unitOfMeasurement: s.string().refine((v) => (v && v.trim() ? undefined : 'Required')),
  unitPrice: positiveNumber,
  containerNumber: s.string().optional(),
  packingNumberFrom: nonNegativeNumber.optional(),
  packingNumberTo: nonNegativeNumber.optional(),
  documentTypeCode: s.string().optional(),
  documentReferenceNumber: s.string().optional(),
  registrationNumber: s.string().optional()
})

/**
 * Cross-field domain validation helper to check relationships (e.g. Net Weight <= Gross Weight)
 * Returns null if valid, or an error message object
 */
export function validateDomainRelationships(values) {
  const errors = {}

  if (values.grossWeight && values.netWeight) {
    const gross = Number(values.grossWeight)
    const net = Number(values.netWeight)
    if (!isNaN(gross) && !isNaN(net) && net > gross) {
      errors.netWeight = 'Net weight cannot exceed gross weight'
    }
  }

  if (Array.isArray(values.packingRanges)) {
    values.packingRanges.forEach((range, idx) => {
      const from = Number(range.packingNumberFrom)
      const to = Number(range.packingNumberTo)
      if (!isNaN(from) && !isNaN(to) && to < from) {
        errors[`packingRanges.${idx}.packingNumberTo`] = 'End package number cannot be less than start'
      }
    })
  }

  return Object.keys(errors).length ? errors : null
}
