import { documentCodes as rawDocumentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes as rawQuantityCodes } from '@/data/quantity-code'
import rawSchemeCodes from '@/data/scheme-codes'
import { stateOptions as rawStateOptions } from '@/data/states'
import { Trades as rawTradeAgreements } from '@/data/trade-agrements'
import {
  cargoOptions as rawCargoOptions,
  contractTypes as rawContractTypes,
  paymentTypes as rawPaymentTypes,
  priceInclusionTypes as rawPriceInclusionTypes,
  sealTypes as rawSealTypes,
  weightUnits as rawWeightUnits
} from '@/data/types'

// Pre-defined ports representing Indian loading ports and global discharge/destination ports
const RAW_LOADING_PORTS = [
  { code: 'INMUN1', name: 'Mundra Port', countryCode: 'IN', state: 'Gujarat' },
  { code: 'INNSA1', name: 'Nhava Sheva (JNPT)', countryCode: 'IN', state: 'Maharashtra' },
  { code: 'INMAA1', name: 'Chennai Port', countryCode: 'IN', state: 'Tamil Nadu' },
  { code: 'INBOM4', name: 'Mumbai Air Cargo Terminal', countryCode: 'IN', state: 'Maharashtra' },
  { code: 'INCOK1', name: 'Cochin Port', countryCode: 'IN', state: 'Kerala' },
  { code: 'INVTZ1', name: 'Visakhapatnam Port', countryCode: 'IN', state: 'Andhra Pradesh' },
  { code: 'INKAN1', name: 'Kandla (Deendayal Port)', countryCode: 'IN', state: 'Gujarat' },
  { code: 'INDEL4', name: 'Delhi Air Cargo (IGI)', countryCode: 'IN', state: 'Delhi' }
]

const RAW_DESTINATION_PORTS = [
  { code: 'USMSY', name: 'Port of New Orleans', countryCode: 'US' },
  { code: 'USLAX', name: 'Port of Los Angeles', countryCode: 'US' },
  { code: 'USNYC', name: 'Port of New York & New Jersey', countryCode: 'US' },
  { code: 'DEHAM', name: 'Port of Hamburg', countryCode: 'DE' },
  { code: 'AEJEA', name: 'Jebel Ali Port (Dubai)', countryCode: 'AE' },
  { code: 'SGSIN', name: 'Port of Singapore', countryCode: 'SG' },
  { code: 'NLRTM', name: 'Port of Rotterdam', countryCode: 'NL' },
  { code: 'GBFXT', name: 'Felixstowe Port', countryCode: 'GB' },
  { code: 'KRBUS', name: 'Busan Port', countryCode: 'KR' },
  { code: 'JPTYO', name: 'Tokyo Port', countryCode: 'JP' }
]

const RAW_CURRENCIES = [
  { value: 'USD', label: 'USD - United States Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  { value: 'AED', label: 'AED - UAE Dirham', symbol: 'AED' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'SGD', label: 'SGD - Singapore Dollar', symbol: 'S$' }
]

const RAW_CONTAINER_SIZES = [
  { value: '20', label: '20 ft Standard' },
  { value: '40', label: '40 ft Standard / High Cube' },
  { value: '45', label: '45 ft High Cube' }
]

const RAW_NFEI_CATEGORIES = [
  { value: '01', label: '01 - Free trade sample' },
  { value: '02', label: '02 - Diplomatic goods' },
  { value: '03', label: '03 - Warranty replacement' },
  { value: '07', label: '07 - Gift parcel' },
  { value: '08', label: '08 - Other NFEI' }
]

const RAW_IGST_STATUSES = [
  { value: 'LUT', label: 'Under LUT / Bond (Without payment of IGST)' },
  { value: 'P', label: 'Payment of IGST (With payment of tax)' },
  { value: 'NA', label: 'Not Applicable' }
]

const RAW_FILE_TYPES = [
  { value: 'pdf', label: 'PDF Document (.pdf)' },
  { value: 'jpeg', label: 'JPEG Image (.jpg / .jpeg)' }
]

/**
 * Helper to simulate network latency with Promise
 */
function delay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Asynchronous, Promise-based Mock Reference Data Service.
 * Replaces hardcoded UI imports with API-ready service boundaries.
 */
export const lookupService = {
  /**
   * Search Indian loading ports asynchronously
   */
  async searchLoadingPorts(query = '') {
    await delay(60)
    const q = query.toLowerCase().trim()
    if (!q) return RAW_LOADING_PORTS
    return RAW_LOADING_PORTS.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.state && p.state.toLowerCase().includes(q))
    )
  },

  /**
   * Search global destination / discharge ports asynchronously
   */
  async searchDestinationPorts(query = '') {
    await delay(60)
    const q = query.toLowerCase().trim()
    const all = [...RAW_DESTINATION_PORTS, ...RAW_LOADING_PORTS]
    if (!q) return RAW_DESTINATION_PORTS
    return all.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.countryCode.toLowerCase().includes(q)
    )
  },

  /**
   * Get port by code
   */
  async getPortByCode(code) {
    await delay(30)
    if (!code) return null
    const all = [...RAW_LOADING_PORTS, ...RAW_DESTINATION_PORTS]
    return all.find((p) => p.code.toUpperCase() === code.toUpperCase()) || null
  },

  /**
   * List all ports for standard selects
   */
  async getPortOptions() {
    await delay(40)
    const all = [...RAW_LOADING_PORTS, ...RAW_DESTINATION_PORTS]
    return all.map((p) => ({
      value: p.code,
      label: `${p.name} · ${p.code}`
    }))
  },

  /**
   * Fetch Indian states options
   */
  async getStates(query = '') {
    await delay(40)
    if (!query) return rawStateOptions
    const q = query.toLowerCase().trim()
    return rawStateOptions.filter((s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q))
  },

  /**
   * Fetch supported currencies
   */
  async getCurrencies() {
    await delay(30)
    return RAW_CURRENCIES
  },

  /**
   * Search Customs Export Scheme codes (RoDTEP, RoSCTL, Duty Drawback, etc.)
   */
  async searchSchemeCodes(query = '') {
    await delay(60)
    if (!query) return rawSchemeCodes
    const q = query.toLowerCase().trim()
    return rawSchemeCodes.filter(
      (s) => s.label.toLowerCase().includes(q) || String(s.value).toLowerCase().includes(q)
    )
  },

  /**
   * Fetch Scheme Code by its ID/value
   */
  async getSchemeCode(value) {
    await delay(20)
    return rawSchemeCodes.find((s) => String(s.value) === String(value)) || null
  },

  /**
   * Search Quantity / UOM codes (PCS, KGS, MTR, etc.)
   */
  async searchQuantityCodes(query = '') {
    await delay(40)
    if (!query) return rawQuantityCodes
    const q = query.toLowerCase().trim()
    return rawQuantityCodes.filter(
      (u) => u.label.toLowerCase().includes(q) || u.value.toLowerCase().includes(q)
    )
  },

  /**
   * Search e-Sanchit Document Type codes
   */
  async searchDocumentCodes(query = '') {
    await delay(60)
    if (!query) return rawDocumentCodes.slice(0, 50)
    const q = query.toLowerCase().trim()
    return rawDocumentCodes
      .filter((d) => d.label.toLowerCase().includes(q) || d.value.toLowerCase().includes(q))
      .slice(0, 50)
  },

  /**
   * Fetch single document code by value
   */
  async getDocumentCodeByValue(val) {
    await delay(20)
    if (!val) return null
    return rawDocumentCodes.find((d) => d.value === val || d.label === val) || null
  },

  /**
   * Fetch Trade Agreements
   */
  async getTradeAgreements() {
    await delay(40)
    return rawTradeAgreements
  },

  /**
   * Fetch Cargo nature options
   */
  async getCargoOptions() {
    await delay(30)
    return rawCargoOptions
  },

  /**
   * Fetch Contract types (FOB, CIF, CFR, etc.)
   */
  async getContractTypes() {
    await delay(30)
    return rawContractTypes
  },

  /**
   * Fetch Payment terms (LC, DP, DA, etc.)
   */
  async getPaymentTypes() {
    await delay(30)
    return rawPaymentTypes
  },

  /**
   * Fetch Price inclusion options (Freight & Insurance included)
   */
  async getPriceInclusionTypes() {
    await delay(30)
    return rawPriceInclusionTypes
  },

  /**
   * Fetch Seal types (Bottle Seal, e-Seal, RFID)
   */
  async getSealTypes() {
    await delay(30)
    return rawSealTypes
  },

  /**
   * Fetch weight units (KG, LBS, etc.)
   */
  async getWeightUnits() {
    await delay(30)
    return rawWeightUnits
  },

  /**
   * Fetch ISO Container size options
   */
  async getContainerSizes() {
    await delay(30)
    return RAW_CONTAINER_SIZES
  },

  /**
   * Fetch NFEI exemption categories
   */
  async getNfeiCategories() {
    await delay(30)
    return RAW_NFEI_CATEGORIES
  },

  /**
   * Fetch IGST payment options
   */
  async getIgstPaymentStatuses() {
    await delay(30)
    return RAW_IGST_STATUSES
  },

  /**
   * Fetch accepted e-Sanchit file types
   */
  async getFileTypes() {
    await delay(30)
    return RAW_FILE_TYPES
  }
}
