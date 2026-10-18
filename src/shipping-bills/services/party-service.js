/**
 * Asynchronous, Promise-based service for managing Exporters, Consignees, Buyers,
 * Third Parties, and Branch addresses.
 * Fully decoupled from UI components.
 */

const STORAGE_KEY = 'export-software-shipping-bills-v2'

const SEED_DATA = {
  exporters: [
    {
      id: 1000,
      name: 'Aarav Textiles Pvt Ltd',
      iec: 'AAECA1234F',
      class: 'F',
      type: 'P',
      pan: 'AAACA1234F',
      branches: [
        {
          id: 1000,
          branchName: 'Ludhiana factory',
          address1: '12 Industrial Area',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141015',
          countryCode: 'IN',
          gstnId: '03AAECA1234F1Z5',
          adCode: '62093230170136'
        },
        {
          id: 1001,
          branchName: 'Tirupur Processing Unit',
          address1: '45 Cotton Mill Road',
          city: 'Tirupur',
          state: 'Tamil Nadu',
          pincode: '641601',
          countryCode: 'IN',
          gstnId: '33AAECA1234F1Z3',
          adCode: '62093230170144'
        }
      ]
    },
    {
      id: 1002,
      name: 'Blue Harbor Exports',
      iec: 'AABCB5678G',
      class: 'R',
      type: 'P',
      branches: [
        {
          id: 1003,
          branchName: 'Mumbai office',
          address1: '8 Dock Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          countryCode: 'IN',
          gstnId: '27AABCB5678G1Z1',
          adCode: '54093230170199'
        },
        {
          id: 1005,
          branchName: 'Mundra Port Logistics Hub',
          address1: 'Plot 14 Port SEZ',
          city: 'Mundra',
          state: 'Gujarat',
          pincode: '370421',
          countryCode: 'IN',
          gstnId: '24AABCB5678G1Z8'
        }
      ]
    },
    {
      id: 1010,
      name: 'Apex Garments & Fashion Pvt Ltd',
      iec: 'AAACG9876K',
      class: 'F',
      type: 'P',
      branches: [
        {
          id: 1011,
          branchName: 'Surat Apparel Park',
          address1: 'Sector 3 GIDC Khatodara',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '395002',
          countryCode: 'IN',
          gstnId: '24AAACG9876K1Z9'
        },
        {
          id: 1012,
          branchName: 'Ahmedabad Central Warehouse',
          address1: 'NH-8 Narol Highway',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '382405',
          countryCode: 'IN'
        }
      ]
    },
    {
      id: 1020,
      name: 'Zenith Spices & Agri Corp',
      iec: 'AADCZ3456M',
      class: 'R',
      type: 'P',
      branches: [
        {
          id: 1021,
          branchName: 'Kochi Export Hub',
          address1: 'Willingdon Island Terminal',
          city: 'Kochi',
          state: 'Kerala',
          pincode: '682003',
          countryCode: 'IN',
          gstnId: '32AADCZ3456M1Z2'
        },
        {
          id: 1022,
          branchName: 'Guntur Spice Processing Center',
          address1: 'Guntur GT Road',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          pincode: '522001',
          countryCode: 'IN'
        }
      ]
    },
    {
      id: 1030,
      name: 'Titanium Engineering Works',
      iec: 'AAEET7788P',
      class: 'F',
      type: 'P',
      branches: [
        {
          id: 1031,
          branchName: 'Pune Auto Cluster Plant',
          address1: 'Chinchwad MIDC Industrial Zone',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411019',
          countryCode: 'IN',
          gstnId: '27AAEET7788P1Z6'
        }
      ]
    }
  ],
  businesses: [
    {
      id: 1000,
      name: 'Gulf Retail LLC',
      isConsignee: true,
      isBuyer: true,
      isNotify: false,
      isThirdParty: false,
      branches: [
        {
          id: 1000,
          branchName: 'Dubai head office',
          address1: '18 Creek Road',
          city: 'Dubai',
          countryCode: 'AE'
        },
        {
          id: 2004,
          branchName: 'Abu Dhabi Distribution Hub',
          address1: 'KIZAD Industrial Zone',
          city: 'Abu Dhabi',
          countryCode: 'AE'
        }
      ]
    },
    {
      id: 2002,
      name: 'Northstar Trading Inc',
      isConsignee: true,
      isBuyer: true,
      isNotify: true,
      isThirdParty: false,
      branches: [
        {
          id: 2003,
          branchName: 'New Orleans warehouse',
          address1: '456 Import Street',
          city: 'New Orleans',
          state: 'Louisiana',
          countryCode: 'US'
        },
        {
          id: 2005,
          branchName: 'Houston Fulfillment Center',
          address1: '8900 Port of Houston Parkway',
          city: 'Houston',
          state: 'Texas',
          countryCode: 'US'
        }
      ]
    },
    {
      id: 2010,
      name: 'EuroGlobal Fashion GmbH',
      isConsignee: true,
      isBuyer: true,
      isNotify: true,
      isThirdParty: false,
      branches: [
        {
          id: 2011,
          branchName: 'Hamburg Central Hub',
          address1: 'Speicherstadt Logistics Park 4',
          city: 'Hamburg',
          countryCode: 'DE'
        }
      ]
    },
    {
      id: 2020,
      name: 'Pacific Rim Import Co.',
      isConsignee: true,
      isBuyer: true,
      isNotify: false,
      isThirdParty: false,
      branches: [
        {
          id: 2021,
          branchName: 'Los Angeles Port Terminal Branch',
          address1: '700 Harbor Boulevard',
          city: 'Los Angeles',
          state: 'California',
          countryCode: 'US'
        }
      ]
    },
    {
      id: 2030,
      name: 'Al-Mansoor Trading FZE',
      isConsignee: true,
      isBuyer: true,
      isNotify: true,
      isThirdParty: false,
      branches: [
        {
          id: 2031,
          branchName: 'Jebel Ali Free Zone Office',
          address1: 'JAFZA North Tower 2',
          city: 'Dubai',
          countryCode: 'AE'
        }
      ]
    },
    {
      id: 2040,
      name: 'Apex Overseas Pte Ltd',
      isConsignee: true,
      isBuyer: true,
      isNotify: false,
      isThirdParty: false,
      branches: [
        {
          id: 2041,
          branchName: 'Singapore Tech Park Branch',
          address1: '50 Jurong East Street 21',
          city: 'Singapore',
          countryCode: 'SG'
        }
      ]
    },
    {
      id: 2099,
      name: 'Third Party Logistics Global BV',
      isConsignee: false,
      isBuyer: false,
      isNotify: false,
      isThirdParty: true,
      branches: [
        {
          id: 2099,
          branchName: 'Rotterdam Logistics Center',
          address1: 'Haven 1022',
          city: 'Rotterdam',
          countryCode: 'NL'
        }
      ]
    }
  ]
}

function loadPartiesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.exporters) && Array.isArray(parsed.businesses)) {
        return {
          exporters: parsed.exporters,
          businesses: parsed.businesses
        }
      }
    }
  } catch {
    // Local storage fallback
  }
  return SEED_DATA
}

let store = loadPartiesFromStorage()
const listeners = new Set()

function persist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing = raw ? JSON.parse(raw) : {}
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...existing,
        exporters: store.exporters,
        businesses: store.businesses
      })
    )
  } catch {
    // Ignore storage issues in test/restricted environments
  }
  listeners.forEach((fn) => fn())
}

function delay(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function nextId() {
  const ids = [
    ...store.exporters.flatMap((e) => [e.id, ...e.branches.map((b) => b.id)]),
    ...store.businesses.flatMap((b) => [b.id, ...b.branches.map((br) => br.id)])
  ]
  return Math.max(3000, ...ids) + 1
}

export const partyService = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /**
   * Search exporters asynchronously
   */
  async searchExporters(query = '') {
    await delay(50)
    const q = query.toLowerCase().trim()
    const active = store.exporters.filter((e) => !e.disabled)
    if (!q) return active
    return active.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.iec && e.iec.toLowerCase().includes(q)) ||
        (e.pan && e.pan.toLowerCase().includes(q))
    )
  },

  /**
   * Get single exporter by ID
   */
  async getExporterById(id) {
    await delay(30)
    if (!id) return null
    return store.exporters.find((e) => String(e.id) === String(id)) || null
  },

  /**
   * Search branches of a specific exporter
   */
  async searchExporterBranches(exporterId, query = '') {
    await delay(40)
    if (!exporterId) return []
    const exporter = store.exporters.find((e) => String(e.id) === String(exporterId))
    if (!exporter) return []
    const q = query.toLowerCase().trim()
    if (!q) return exporter.branches
    return exporter.branches.filter(
      (b) =>
        b.branchName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        (b.address1 && b.address1.toLowerCase().includes(q)) ||
        (b.gstnId && b.gstnId.toLowerCase().includes(q))
    )
  },

  /**
   * Search consignees asynchronously
   */
  async searchConsignees(query = '') {
    await delay(50)
    const q = query.toLowerCase().trim()
    const list = store.businesses.filter((b) => b.isConsignee)
    if (!q) return list
    return list.filter((b) => b.name.toLowerCase().includes(q))
  },

  /**
   * Get single consignee / business by ID
   */
  async getConsigneeById(id) {
    await delay(30)
    if (!id) return null
    return store.businesses.find((b) => String(b.id) === String(id)) || null
  },

  /**
   * Search branches of a consignee / business
   */
  async searchConsigneeBranches(businessId, query = '') {
    await delay(40)
    if (!businessId) return []
    const business = store.businesses.find((b) => String(b.id) === String(businessId))
    if (!business) return []
    const q = query.toLowerCase().trim()
    if (!q) return business.branches
    return business.branches.filter(
      (b) =>
        b.branchName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        (b.address1 && b.address1.toLowerCase().includes(q))
    )
  },

  /**
   * Search buyers asynchronously
   */
  async searchBuyers(query = '') {
    await delay(50)
    const q = query.toLowerCase().trim()
    const list = store.businesses.filter((b) => b.isBuyer)
    if (!q) return list
    return list.filter((b) => b.name.toLowerCase().includes(q))
  },

  /**
   * Search third parties asynchronously
   */
  async searchThirdParties(query = '') {
    await delay(50)
    const q = query.toLowerCase().trim()
    const list = store.businesses.filter((b) => b.isThirdParty)
    if (!q) return list
    return list.filter((b) => b.name.toLowerCase().includes(q))
  },

  /**
   * Save or update an exporter
   */
  async saveExporter(data) {
    await delay(80)
    const id = data.id ? Number(data.id) : nextId()
    const existing = store.exporters.find((e) => e.id === id)
    const branches = existing?.branches || (data.firstBranch ? [{ ...data.firstBranch, id: id + 1 }] : [])

    const record = {
      id,
      name: data.name,
      iec: data.iec || '',
      class: data.class || 'F',
      type: data.type || 'P',
      pan: data.pan || '',
      tan: data.tan || '',
      branches
    }

    store = {
      ...store,
      exporters: [...store.exporters.filter((e) => e.id !== id), record]
    }
    persist()
    return record
  },

  /**
   * Save or update a business (Consignee/Buyer/ThirdParty)
   */
  async saveBusiness(data) {
    await delay(80)
    const id = data.id ? Number(data.id) : nextId()
    const existing = store.businesses.find((b) => b.id === id)
    const branches = existing?.branches || (data.firstBranch ? [{ ...data.firstBranch, id: id + 1 }] : [])

    const record = {
      id,
      name: data.name,
      iec: data.iec || '',
      isConsignee: data.isConsignee ?? true,
      isBuyer: data.isBuyer ?? true,
      isNotify: data.isNotify ?? false,
      isThirdParty: data.isThirdParty ?? false,
      branches
    }

    store = {
      ...store,
      businesses: [...store.businesses.filter((b) => b.id !== id), record]
    }
    persist()
    return record
  },

  /**
   * Save a branch for an exporter or business
   */
  async saveBranch(kind, ownerId, branchData) {
    await delay(80)
    const id = branchData.id ? Number(branchData.id) : nextId()
    const record = { ...branchData, id }

    if (kind === 'exporter') {
      store = {
        ...store,
        exporters: store.exporters.map((owner) =>
          owner.id === Number(ownerId)
            ? { ...owner, branches: [...owner.branches.filter((b) => b.id !== id), record] }
            : owner
        )
      }
    } else {
      store = {
        ...store,
        businesses: store.businesses.map((owner) =>
          owner.id === Number(ownerId)
            ? { ...owner, branches: [...owner.branches.filter((b) => b.id !== id), record] }
            : owner
        )
      }
    }
    persist()
    return record
  }
}
