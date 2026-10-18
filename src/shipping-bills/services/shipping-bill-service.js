import { emptyBill, emptyInvoice, toShippingBillPayload } from '../domain/shipping-bill-model'

const STORAGE_KEY = 'export-software-shipping-bills-v2'

const SEED_BILLS = [
  {
    id: 3000,
    created: '2026-09-18T08:00:00.000Z',
    updated: '2026-09-18T08:00:00.000Z',
    values: {
      jobNumber: '2081',
      jobDate: '2026-09-18',
      exporterId: '1000',
      exporterBranchId: '1001',
      exporterName: 'Aarav Textiles Pvt Ltd',
      consigneeId: '2002',
      consigneeBranchId: '2003',
      consigneeName: 'Northstar Trading Inc',
      loadingPort: 'INMUN1',
      finalDestinationPort: 'USMSY',
      dischargePort: 'USMSY',
      natureOfCargo: 'P',
      grossWeight: '34.6',
      netWeight: '23.5',
      measurementUnit: 'KG',
      totalPackages: '12',
      marksAndNumbers: 'AT/USA/2081',
      invoices: [
        {
          invoiceNumber: 'EX/2081/2026',
          invoiceDate: '2026-09-17',
          currency: 'USD',
          contractType: 'FOB',
          buyerSameAsConsignee: true,
          buyerId: '2002',
          buyerBranchId: '2003',
          freightAmount: '250',
          insuranceAmount: '75',
          items: [
            {
              ritcCode: '61091000',
              goodsDescription1: '100% Combed Cotton T-shirts (Men / Boy)',
              quantity: '500',
              unitOfMeasurement: 'PCS',
              unitPrice: '4.50',
              schemeCode: '19',
              igstPaymentStatus: 'LUT',
              rewardItem: true,
              totalPackage: '12',
              drawbackSerialNumber: '6109A',
              drawbackQuantity: '500'
            }
          ]
        }
      ],
      containers: [],
      packingRanges: [
        {
          packingNumberFrom: '1',
          packingNumberTo: '12',
          packingCode: 'CTN'
        }
      ],
      documents: [
        {
          documentTypeCode: '380000',
          imageReferenceNumber: 'IRN20260918001234',
          documentIssueDate: '2026-09-17',
          fileType: 'pdf'
        }
      ],
      licenses: []
    }
  },
  {
    id: 3001,
    created: '2026-10-01T10:00:00.000Z',
    updated: '2026-10-02T11:30:00.000Z',
    values: {
      jobNumber: '2094',
      jobDate: '2026-10-01',
      exporterId: '1002',
      exporterBranchId: '1003',
      exporterName: 'Blue Harbor Exports',
      consigneeId: '1000',
      consigneeBranchId: '1000',
      consigneeName: 'Gulf Retail LLC',
      loadingPort: 'INNSA1',
      finalDestinationPort: 'AEJEA',
      dischargePort: 'AEJEA',
      natureOfCargo: 'C',
      grossWeight: '120.0',
      netWeight: '105.0',
      measurementUnit: 'KG',
      totalPackages: '25',
      marksAndNumbers: 'BHE/DXB/2094',
      invoices: [
        {
          invoiceNumber: 'BHE/EXP/991',
          invoiceDate: '2026-10-01',
          currency: 'AED',
          contractType: 'CIF',
          buyerSameAsConsignee: true,
          buyerId: '1000',
          buyerBranchId: '1000',
          items: [
            {
              ritcCode: '52081190',
              goodsDescription1: 'Bleached Cotton Woven Fabrics',
              quantity: '1200',
              unitOfMeasurement: 'MTR',
              unitPrice: '15.00',
              schemeCode: '19',
              igstPaymentStatus: 'LUT',
              rewardItem: true
            }
          ]
        }
      ],
      containers: [
        {
          containerNumber: 'MSCU1234567',
          containerSize: '20',
          exciseSealNumber: 'SEAL-99881',
          sealType: 2
        }
      ],
      packingRanges: [],
      documents: [],
      licenses: []
    }
  }
]

function loadBillsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.bills) && parsed.bills.length > 0) {
        return parsed.bills
      }
    }
  } catch {
    // Storage access fallback
  }
  return SEED_BILLS
}

let bills = loadBillsFromStorage()
const billListeners = new Set()

function persistBills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing = raw ? JSON.parse(raw) : {}
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...existing,
        bills
      })
    )
  } catch {
    // Ignore storage issues in test/restricted environments
  }
  billListeners.forEach((fn) => fn())
}

function delay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function nextBillId() {
  const ids = bills.map((b) => b.id)
  return Math.max(3000, ...ids) + 1
}

/**
 * Triggers a file download directly in the browser
 */
function triggerFileDownload(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

/**
 * Generates official ICEGATE Flat File (.sb format) according to customs standards
 */
export function generateFlatFileContent(bill) {
  const v = bill.values || emptyBill()
  const lines = []

  // Header Record
  lines.push(`HREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  // Table 1: Shipping Bill
  lines.push(`<TABLE>SHIPPING_BILL`)
  lines.push(
    `<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS`
  )
  lines.push(
    `<R>F^1000^${v.jobNumber || bill.id}^${v.jobDate || ''}^${v.exporterId || ''}^${v.exporterBranchId || ''}^${v.consigneeId || ''}^${v.loadingPort || ''}^${v.finalDestinationPort || ''}^${v.dischargePort || v.finalDestinationPort || ''}^${v.sealType || ''}^${v.natureOfCargo || ''}^${v.grossWeight || ''}^${v.netWeight || ''}^${v.measurementUnit || 'KGS'}^${v.totalPackages || ''}^${(v.marksAndNumbers || '').replace(/[\^\r\n]+/g, ' ')}`
  )

  // Table 2: Invoices
  if (v.invoices && v.invoices.length > 0) {
    lines.push(`<TABLE>INVOICE`)
    lines.push(
      `<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT`
    )
    v.invoices.forEach((inv, idx) => {
      lines.push(
        `<R>${idx + 1}^${inv.invoiceNumber}^${inv.invoiceDate || ''}^${inv.currency || 'USD'}^${inv.contractType || 'FOB'}^${inv.buyerId || v.consigneeId || ''}^${inv.freightAmount || 0}^${inv.insuranceAmount || 0}`
      )
    })

    // Table 3: Goods Items
    lines.push(`<TABLE>ITEM`)
    lines.push(
      `<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE`
    )
    v.invoices.forEach((inv, invIdx) => {
      ;(inv.items || []).forEach((item, itemIdx) => {
        const qty = Number(item.quantity) || 0
        const price = Number(item.unitPrice) || 0
        const total = (qty * price).toFixed(2)
        lines.push(
          `<R>${invIdx + 1}^${itemIdx + 1}^${item.ritcCode || ''}^${(item.goodsDescription1 || '').replace(/[\^\r\n]+/g, ' ')}^${item.quantity || ''}^${item.unitOfMeasurement || 'PCS'}^${item.unitPrice || ''}^${total}^${item.schemeCode || ''}`
        )
      })
    })
  }

  // Table 4: Packing
  if (v.packingRanges && v.packingRanges.length > 0) {
    lines.push(`<TABLE>PACKING`)
    lines.push(`<F>FROM_PKG^TO_PKG^PKG_CODE`)
    v.packingRanges.forEach((pkg) => {
      lines.push(`<R>${pkg.packingNumberFrom}^${pkg.packingNumberTo}^${pkg.packingCode || 'CTN'}`)
    })
  }

  // Trailer Record
  lines.push(`TREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
}

/**
 * Asynchronous, Promise-based Shipping Bill Service
 */
export const shippingBillService = {
  subscribe(listener) {
    billListeners.add(listener)
    return () => billListeners.delete(listener)
  },

  /**
   * Synchronous accessor for fast initial renders
   */
  getInitialBills() {
    return [...bills]
  },

  /**
   * Fetch all shipping bills asynchronously with optional search filter
   */
  async list(filter = '') {
    await delay(70)
    bills = loadBillsFromStorage()
    if (!filter) return [...bills]
    const q = filter.toLowerCase().trim()
    return bills.filter((b) => {
      const v = b.values || {}
      return (
        String(b.id).includes(q) ||
        (v.jobNumber && v.jobNumber.toLowerCase().includes(q)) ||
        (v.exporterName && v.exporterName.toLowerCase().includes(q)) ||
        (v.consigneeName && v.consigneeName.toLowerCase().includes(q))
      )
    })
  },

  /**
   * Refresh and reload shipping bills from persistent storage
   */
  async refresh() {
    await delay(180)
    bills = loadBillsFromStorage()
    billListeners.forEach((fn) => fn())
    return [...bills]
  },

  /**
   * Reset bills back to default seed bills
   */
  async resetToSeedBills() {
    await delay(150)
    bills = [...SEED_BILLS]
    persistBills()
    return [...bills]
  },

  /**
   * Fetch single shipping bill by ID asynchronously
   */
  async getById(id) {
    await delay(50)
    if (!id) return null
    return bills.find((b) => String(b.id) === String(id)) || null
  },

  /**
   * Create or update a shipping bill asynchronously
   */
  async save(values, id = null) {
    await delay(100)
    const now = new Date().toISOString()
    const targetId = id ? Number(id) : nextBillId()
    const existing = bills.find((b) => b.id === targetId)

    const record = {
      id: targetId,
      created: existing?.created || now,
      updated: now,
      values,
      payload: toShippingBillPayload(values)
    }

    bills = [record, ...bills.filter((b) => b.id !== targetId)]
    persistBills()
    return record
  },

  /**
   * Delete a shipping bill asynchronously
   */
  async delete(id) {
    await delay(60)
    const targetId = Number(id)
    bills = bills.filter((b) => b.id !== targetId)
    persistBills()
    return true
  },

  /**
   * Fetch available Marks and Numbers options for an exporter
   */
  async getMarksAndNumbersOptions(exporterId) {
    await delay(40)
    if (!exporterId) return []
    return [
      { value: 'AS PER INVOICE', label: 'AS PER INVOICE' },
      { value: 'NO MARKS', label: 'NO MARKS' },
      { value: `EXP/${exporterId}/STD-MARKS`, label: `EXP/${exporterId}/STD-MARKS` }
    ]
  },

  /**
   * Download Shipping Bill as an official PDF document directly in the browser
   */
  async downloadPdf(bill) {
    await delay(80)
    if (!bill) throw new Error('Shipping bill data required to generate PDF')
    const pdfContent = generateShippingBillPdf(bill)
    const safeJob = bill.values?.jobNumber || bill.id
    const filename = `shipping_bill_${safeJob}.pdf`
    triggerFileDownload(pdfContent, filename, 'application/pdf')
    return { success: true, filename }
  },

  /**
   * Download ICEGATE compliant Flat File (.sb) (Legacy / Optional)
   */
  async downloadFlatFile(bill) {
    await delay(50)
    if (!bill) throw new Error('Shipping bill data required to generate flat file')
    const content = generateFlatFileContent(bill)
    const safeJob = bill.values?.jobNumber || bill.id
    const filename = `shipping_bill_${safeJob}.sb`
    triggerFileDownload(content, filename)
    return { success: true, filename }
  }
}

/**
 * Pure JavaScript PDF generator for Indian Customs Shipping Bills (PDF 1.4)
 */
export function generateShippingBillPdf(bill) {
  const v = bill.values || {}
  const safeJob = v.jobNumber || bill.id || 'Draft'
  const dateStr = v.jobDate || new Date().toISOString().split('T')[0]
  const exporter = v.exporterName || 'Aarav Textiles Pvt Ltd'
  const consignee = v.consigneeName || 'Northstar Trading Inc'
  const loadingPort = v.loadingPort || 'INMUN1'
  const destPort = v.finalDestinationPort || 'USMSY'
  const dischargePort = v.dischargePort || destPort || 'USMSY'
  const grossWeight = v.grossWeight || '0.00'
  const netWeight = v.netWeight || '0.00'
  const uom = v.measurementUnit || 'KG'
  const packages = v.totalPackages || '0'
  const natureOfCargo = v.natureOfCargo === 'C' ? 'Containerized' : v.natureOfCargo === 'P' ? 'Packaged' : 'General Cargo'
  const invoices = v.invoices || []

  const escapePdf = (str) =>
    String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')

  const cmds = []
  const add = (c) => cmds.push(c)

  // Header Banner (Deep Navy Blue)
  add('0.09 0.19 0.38 rg')
  add('36 756 523 52 re f')

  // Banner Title
  add('BT')
  add('/F1 15 Tf')
  add('1 1 1 rg')
  add('48 784 Td')
  add(`(${escapePdf('INDIAN CUSTOMS - EXPORT SHIPPING BILL')}) Tj`)
  add('ET')

  add('BT')
  add('/F2 9 Tf')
  add('0.85 0.9 1 rg')
  add('48 768 Td')
  add(`(${escapePdf('ICEGATE EDI FORM - OFFICIAL EXPORT DOCUMENTATION')}) Tj`)
  add('ET')

  // Top Metadata Card
  add('0.97 0.98 0.99 rg')
  add('36 676 523 72 re f')
  add('0.82 0.86 0.9 RG')
  add('0.75 w')
  add('36 676 523 72 re S')

  // Row 1
  add('BT')
  add('/F1 9.5 Tf')
  add('0.09 0.19 0.38 rg')
  add('48 730 Td')
  add(`(Job No: #${escapePdf(safeJob)}) Tj`)
  add('175 0 Td')
  add(`(Job Date: ${escapePdf(dateStr)}) Tj`)
  add('165 0 Td')
  add(`(Status: DRAFT / READY FOR FILING) Tj`)
  add('ET')

  // Row 2
  add('BT')
  add('/F2 8.5 Tf')
  add('0.2 0.25 0.3 rg')
  add('48 710 Td')
  add(`(Port of Loading: ${escapePdf(loadingPort)}) Tj`)
  add('175 0 Td')
  add(`(Port of Discharge: ${escapePdf(dischargePort)}) Tj`)
  add('165 0 Td')
  add(`(Final Destination: ${escapePdf(destPort)}) Tj`)
  add('ET')

  // Row 3
  add('BT')
  add('/F2 8.5 Tf')
  add('0.2 0.25 0.3 rg')
  add('48 690 Td')
  add(`(Gross Wt: ${escapePdf(grossWeight)} ${escapePdf(uom)}) Tj`)
  add('175 0 Td')
  add(`(Net Wt: ${escapePdf(netWeight)} ${escapePdf(uom)}) Tj`)
  add('165 0 Td')
  add(`(Cargo: ${escapePdf(natureOfCargo)} | ${escapePdf(packages)} Pkgs) Tj`)
  add('ET')

  // Exporter & Consignee Columns
  let y = 646
  add('0.92 0.94 0.97 rg')
  add(`36 ${y} 255 18 re f`)
  add(`304 ${y} 255 18 re f`)
  add('0.82 0.86 0.9 RG')
  add(`36 ${y} 255 18 re S`)
  add(`304 ${y} 255 18 re S`)

  add('BT')
  add('/F1 8.5 Tf')
  add('0.09 0.19 0.38 rg')
  add(`44 ${y + 5} Td`)
  add('(EXPORTER / SHIPPER) Tj')
  add('268 0 Td')
  add('(CONSIGNEE / OVERSEAS BUYER) Tj')
  add('ET')

  y -= 44
  add('1 1 1 rg')
  add(`36 ${y} 255 44 re f`)
  add(`304 ${y} 255 44 re f`)
  add('0.82 0.86 0.9 RG')
  add(`36 ${y} 255 44 re S`)
  add(`304 ${y} 255 44 re S`)

  add('BT')
  add('/F1 9 Tf')
  add('0.1 0.1 0.1 rg')
  add(`44 ${y + 28} Td`)
  add(`(${escapePdf(exporter.substring(0, 36))}) Tj`)
  add('268 0 Td')
  add(`(${escapePdf(consignee.substring(0, 36))}) Tj`)
  add('ET')

  add('BT')
  add('/F2 8 Tf')
  add('0.35 0.4 0.45 rg')
  add(`44 ${y + 14} Td`)
  add(`(IEC Code: ${escapePdf(v.exporterId || '1000')} | Branch: ${escapePdf(v.exporterBranchId || '1001')}) Tj`)
  add('268 0 Td')
  add(`(Consignee ID: ${escapePdf(v.consigneeId || '2002')} | Country: ${escapePdf(destPort.substring(0, 2))}) Tj`)
  add('ET')

  // Invoices & Goods Items Table
  y -= 28
  add('0.09 0.19 0.38 rg')
  add(`36 ${y} 523 18 re f`)
  add('BT')
  add('/F1 8.5 Tf')
  add('1 1 1 rg')
  add(`44 ${y + 5} Td`)
  add('(COMMERCIAL INVOICES & GOODS SPECIFICATIONS) Tj')
  add('ET')

  // Table header
  y -= 18
  add('0.92 0.94 0.97 rg')
  add(`36 ${y} 523 18 re f`)
  add('0.82 0.86 0.9 RG')
  add(`36 ${y} 523 18 re S`)

  add('BT')
  add('/F1 8 Tf')
  add('0.1 0.15 0.25 rg')
  add(`44 ${y + 5} Td`)
  add('(Invoice No) Tj')
  add('110 0 Td')
  add('(HS / RITC Code) Tj')
  add('95 0 Td')
  add('(Item Description) Tj')
  add('160 0 Td')
  add('(Quantity) Tj')
  add('75 0 Td')
  add('(Amount) Tj')
  add('ET')

  // Table rows
  let totalVal = 0
  let mainCurrency = 'USD'
  let itemCount = 0
  y -= 20

  if (invoices.length === 0) {
    add('BT')
    add('/F2 8.5 Tf')
    add('0.5 0.5 0.5 rg')
    add(`44 ${y + 5} Td`)
    add('(No commercial invoices registered) Tj')
    add('ET')
    y -= 16
  }

  for (const inv of invoices) {
    mainCurrency = inv.currency || 'USD'
    const items = inv.items || []
    for (const item of items) {
      itemCount++
      const qty = Number(item.quantity) || 1
      const price = Number(item.unitPrice) || 0
      const lineTotal = qty * price
      totalVal += lineTotal

      add('0.9 0.92 0.95 RG')
      add(`36 ${y} 523 20 re S`)

      add('BT')
      add('/F2 8 Tf')
      add('0.15 0.15 0.15 rg')
      add(`44 ${y + 6} Td`)
      add(`(${escapePdf(inv.invoiceNumber || 'INV-01')}) Tj`)
      add('110 0 Td')
      add(`(${escapePdf(item.ritcCode || '61091000')}) Tj`)
      add('95 0 Td')
      const desc = (item.goodsDescription1 || 'Export Cargo Merchandise').substring(0, 34)
      add(`(${escapePdf(desc)}) Tj`)
      add('160 0 Td')
      add(`(${escapePdf(qty + ' ' + (item.unitOfMeasurement || 'PCS'))}) Tj`)
      add('75 0 Td')
      add(`(${escapePdf(mainCurrency + ' ' + lineTotal.toFixed(2))}) Tj`)
      add('ET')
      y -= 20

      if (y < 120) break
    }
  }

  // Grand Total Box
  add('0.94 0.97 1.0 rg')
  add(`36 ${y - 4} 523 22 re f`)
  add('0.8 0.86 0.94 RG')
  add(`36 ${y - 4} 523 22 re S`)

  add('BT')
  add('/F1 8.5 Tf')
  add('0.09 0.19 0.38 rg')
  add(`44 ${y + 4} Td`)
  add(`(Total Invoices: ${invoices.length} | Items: ${itemCount}) Tj`)
  add('320 0 Td')
  add(`(Total FOB/CIF Value: ${mainCurrency} ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) Tj`)
  add('ET')

  // Customs Legal Declaration & Electronic Signature
  y -= 45
  add('BT')
  add('/F2 7.5 Tf')
  add('0.4 0.45 0.5 rg')
  add(`36 ${y} Td`)
  add(`(Declaration: I/We declare that the particulars given herein are true and correct according to the Customs Act, 1962.) Tj`)
  add('0 -12 Td')
  add(`(Digitally generated via Export Software ICEGATE Portal on ${escapePdf(new Date().toLocaleString())} | Valid for Indian Customs Submission) Tj`)
  add('ET')

  const streamContent = cmds.join('\n')
  const streamLength = new TextEncoder().encode(streamContent).length

  const objects = [
    `1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj`,
    `2 0 obj\n<<\n  /Type /Pages\n  /Kids [3 0 R]\n  /Count 1\n>>\nendobj`,
    `3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 595.28 841.89]\n  /Contents 4 0 R\n  /Resources <<\n    /Font <<\n      /F1 5 0 R\n      /F2 6 0 R\n    >>\n  >>\n>>\nendobj`,
    `4 0 obj\n<<\n  /Length ${streamLength}\n>>\nstream\n${streamContent}\nendstream\nendobj`,
    `5 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Bold\n>>\nendobj`,
    `6 0 obj\n<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica\n>>\nendobj`
  ]

  let offset = 9
  const xrefEntries = ['0000000000 65535 f ']
  let body = '%PDF-1.4\n'

  for (let i = 0; i < objects.length; i++) {
    xrefEntries.push(String(offset).padStart(10, '0') + ' 00000 n ')
    body += objects[i] + '\n'
    offset = new TextEncoder().encode(body).length
  }

  const startXref = offset
  const xref = `xref\n0 ${objects.length + 1}\n` + xrefEntries.join('\n') + '\n'
  const trailer = `trailer\n<<\n  /Size ${objects.length + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startXref}\n%%EOF`

  return body + xref + trailer
}
