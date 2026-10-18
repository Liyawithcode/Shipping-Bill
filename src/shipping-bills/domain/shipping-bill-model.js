/**
 * Domain models, default values, and financial calculations for Shipping Bills.
 * Provides clean domain logic separate from UI and network layers.
 */

export function emptyItem() {
  return {
    schemeCode: '19', // Drawback/RoDTEP common scheme
    ritcCode: '',
    goodsDescription1: '',
    quantity: '',
    unitOfMeasurement: 'PCS',
    unitPrice: '',
    unitOfRate: '',
    numberOfUnits: '1',
    presentMarketValue: '',
    thirdPartyItem: false,
    itemThirdPartyId: '',
    itemThirdPartyBranchId: '',
    rewardItem: false,
    totalPackage: '',
    endUseOfItem: '',
    igstPaymentStatus: 'LUT',
    taxableValue: '',
    igstAmount: '',
    cess: '',
    originDistrictCode: '',
    tradeAgreementsCode: '',
    drawbackSerialNumber: '',
    drawbackUnit: '',
    drawbackQuantity: '',
    accessoriesDescription: '',
    accessoryStatus: '0',
    ar4Number: '',
    ar4Date: ''
  }
}

export function emptyInvoice() {
  const today = new Date().toISOString().split('T')[0]
  return {
    invoiceNumber: '',
    invoiceDate: today,
    currency: 'USD',
    contractType: 'FOB',
    buyerSameAsConsignee: true,
    buyerId: '',
    buyerBranchId: '',
    thirdPartyId: '',
    thirdPartyBranchId: '',
    freightRate: '',
    freightAmount: '',
    freightCurrency: '',
    insuranceRate: '',
    insuranceAmount: '',
    insuranceCurrency: '',
    commissionRate: '',
    commissionAmount: '',
    commissionCurrency: '',
    discountRate: '',
    discountAmount: '',
    discountCurrency: '',
    otherDeductionsRate: '',
    otherDeductionsAmount: '',
    otherDeductionsCurrency: '',
    packingCharges: '',
    freightInsuranceIncluded: '',
    contractNumber: '',
    natureOfPayment: 'LC',
    periodOfPayment: '30',
    items: [emptyItem()]
  }
}

export function emptyContainer() {
  return {
    containerNumber: '',
    containerSize: '20',
    exciseSealNumber: '',
    sealDate: '',
    sealType: 1,
    sealDeviceId: '',
    movementDocumentType: '',
    movementDocumentNumber: ''
  }
}

export function emptyPackingRange() {
  return {
    packingNumberFrom: '',
    packingNumberTo: '',
    packingCode: 'CTN'
  }
}

export function emptyDocument() {
  const today = new Date().toISOString().split('T')[0]
  return {
    documentTypeCode: '',
    imageReferenceNumber: '',
    documentIssueDate: today,
    documentReferenceNumber: '',
    documentExpiryDate: '',
    invoiceSerialNumber: '1',
    itemSerialNumber: '1',
    fileType: 'pdf',
    placeOfIssue: '',
    issuingPartyCode: '',
    issuingPartyName: '',
    issuingPartyAddress1: '',
    issuingPartyAddress2: '',
    issuingPartyCity: '',
    issuingPartyPin: '',
    beneficiaryPartyCode: '',
    beneficiaryPartyName: '',
    beneficiaryPartyAddress1: '',
    beneficiaryPartyAddress2: '',
    beneficiaryPartyCity: '',
    beneficiaryPartyPin: ''
  }
}

export function emptyLicense() {
  return {
    registrationNumber: '',
    registrationDate: '',
    invoiceSerialNumber: '1',
    itemSerialNumber: '1',
    licenseSerialNumber: '1',
    itemSerialNumberPartE: '',
    itemSerialNumberPartC: '',
    licenseQuantity: '',
    licenseExportQuantity: '',
    indigenousOrImported: 'D'
  }
}

export function emptyBill() {
  const today = new Date().toISOString().split('T')[0]
  return {
    jobNumber: '',
    jobDate: today,
    exporterId: '',
    exporterBranchId: '',
    consigneeId: '',
    consigneeBranchId: '',
    loadingPort: 'INMUN1',
    finalDestinationPort: '',
    dischargePort: '',
    originStateCode: '',
    nfeiCategory: '',
    rbiWaiverNumber: '',
    rbiWaiverDate: '',
    natureOfCargo: 'P',
    sealType: '3',
    grossWeight: '',
    netWeight: '',
    measurementUnit: 'KG',
    totalPackages: '',
    marksAndNumbers: '',
    numberOfContainers: '',
    loosePackets: '0',
    mawbNumber: '',
    hawbNumber: '',
    invoices: [emptyInvoice()],
    containers: [],
    packingRanges: [],
    documents: [],
    licenses: []
  }
}

/**
 * Calculates item line total: quantity * unitPrice
 */
export function lineTotal(item) {
  if (!item) return 0
  const qty = Number(item.quantity) || 0
  const price = Number(item.unitPrice) || 0
  const total = qty * price
  return isNaN(total) ? 0 : total
}

/**
 * Calculates total value of goods across all items in an invoice
 */
export function invoiceItemsTotal(invoice) {
  if (!invoice || !Array.isArray(invoice.items)) return 0
  return invoice.items.reduce((sum, item) => sum + lineTotal(item), 0)
}

/**
 * Calculates comprehensive invoice total including additions and deductions
 */
export function invoiceTotal(invoice) {
  if (!invoice) return 0
  const base = invoiceItemsTotal(invoice)
  const freight = Number(invoice.freightAmount) || 0
  const insurance = Number(invoice.insuranceAmount) || 0
  const packing = Number(invoice.packingCharges) || 0
  const discount = Number(invoice.discountAmount) || 0
  const deductions = Number(invoice.otherDeductionsAmount) || 0

  const net = base + freight + insurance + packing - discount - deductions
  return Math.max(0, net)
}

/**
 * Derives country name/code from port code
 */
export function portCountry(portCode) {
  if (!portCode || typeof portCode !== 'string') return ''
  const prefix = portCode.slice(0, 2).toUpperCase()
  const mapping = {
    IN: 'India',
    US: 'United States',
    AE: 'United Arab Emirates',
    GB: 'United Kingdom',
    DE: 'Germany',
    SG: 'Singapore',
    NL: 'Netherlands',
    KR: 'South Korea',
    JP: 'Japan',
    CN: 'China',
    SA: 'Saudi Arabia',
    AU: 'Australia',
    CA: 'Canada'
  }
  return mapping[prefix] || prefix
}

/**
 * Transforms form values into structured Shipping Bill payload
 */
export function toShippingBillPayload(values) {
  return {
    ...values,
    computed: {
      totalInvoices: values.invoices.length,
      totalItems: values.invoices.reduce((acc, inv) => acc + (inv.items ? inv.items.length : 0), 0),
      grandTotal: values.invoices.reduce((acc, inv) => acc + invoiceTotal(inv), 0),
      isContainerized: (values.containers && values.containers.length > 0) || values.natureOfCargo === 'C'
    }
  }
}
