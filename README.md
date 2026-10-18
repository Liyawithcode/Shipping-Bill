## Export Software Frontend — Shipping Bill Refactoring

Built on top of [fe-zen-arch](https://github.com/shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

---

### Project Setup & Running

```bash
pnpm install   # Installs dependencies and workspace packages
pnpm dev       # Dev server on port 5173
pnpm build     # Production bundle verification
```

---

### Architecture & Refactoring Overview

This repository has been refactored from a monolithic 1,762-line file into a clean, modular, and maintainable frontend architecture using **JSX/JS** files according to the assignment requirements:

#### 1. Component Modularity & Single Responsibility
- **Separation of Concerns**: UI rendering, form state management, domain business logic, and network data access are strictly segregated.
- **Form Orchestrator (`src/shipping-bills/shipping-bill-form.jsx`)**: Under 250 lines. Coordinates multi-tab state, persistent tab panel mounting, form submission, and quick-add modals.
- **Focused Tabs**:
  - `ShipmentBasicsTab.jsx`: Exporter & Consignee party selection, branch addresses, Loading & Destination ports, route exceptions, cargo measurements.
  - `InvoicesTab.jsx`: Commercial invoices array management, buyer conditions, charges & deductions, and real-time financial summaries.
  - `InvoiceItemEditor.jsx`: Single line item editor with HS/RITC code lookup, scheme code selection, conditional Duty Drawback fields, UOM, and IGST tax fields.
  - `OthersTab.jsx`: ISO container tracking, packing list serial ranges, e-Sanchit IRN supporting documents, and export licenses.
- **Reusable Common Components**:
  - `AsyncSelect.jsx`: Debounced asynchronous searchable combobox with loading spinner, empty states, and keyboard navigation.
  - `CollapsibleSection.jsx`: Accordion component keeping secondary/advanced fields accessible without cluttering the primary workflow.
  - `SectionHeader.jsx` & `FormActionsBar.jsx`: Standardized UI section headers and sticky bottom navigation.
  - `PartySelector.jsx`: Focused party + branch selector with address preview cards.
  - `PartyQuickAddModal.jsx` & `BranchQuickAddModal.jsx`: Modal dialogs to register new exporters, consignees, buyers, or branches on the fly.

#### 2. API-Ready Mock Services (No Hardcoded Component Arrays)
Direct imports of static code arrays into UI components have been completely eliminated. All data is served through asynchronous, Promise-based mock services:
- **`lookup-service.js`**: Simulates REST endpoints for reference codes with network latency (50–120ms):
  - Indian Loading Ports & International Destination Ports (`searchLoadingPorts`, `searchDestinationPorts`, `getPortByCode`)
  - State Codes (`getStates`), Currencies (`getCurrencies`), Scheme Codes (`searchSchemeCodes`)
  - Quantity / UOM Codes (`searchQuantityCodes`), e-Sanchit Document Codes (`searchDocumentCodes`)
  - Cargo types, Incoterms/contract types, payment types, seal types, container sizes, and IGST payment options.
- **`party-service.js`**: Asynchronous CRUD for Exporters, Consignees, Overseas Buyers, and Branch addresses.
- **`shipping-bill-service.js`**: Asynchronous Shipping Bill lifecycle management (list, getById, save, delete), Marks & Numbers retrieval, and ICEGATE flat file (`.sb`) generation and download.

#### 3. Domain Handling & Indian Customs (ICEGATE) Rules
- **Cross-Field Relationship Validation**: Net Weight is validated against Gross Weight (`netWeight <= grossWeight`) with immediate domain alerts.
- **Automated Financial Calculations**: Real-time line item totals (`quantity * unitPrice`) and invoice net amounts (goods subtotal + freight + insurance + packing - discount - deductions).
- **Conditional Incentive Fields**: Duty Drawback, RoDTEP, and RoSCTL input fields automatically appear only when the selected customs scheme supports export incentives.
- **Tax & IGST Handling**: Taxable value and IGST amount fields dynamically display when IGST payment status is set to `'P'` (Against payment), staying hidden when under LUT/Bond (`'LUT'`).
- **ICEGATE Flat File Generation**: Fully compliant `.sb` flat-file serialization containing `HREC`, `SHIPPING_BILL`, `INVOICE`, `ITEM`, `PACKING`, and `TREC` tables downloadable directly in the browser.

---

### Codebase Organization

```
src/
├── dashboard/
│   └── list-dashboard.jsx              # Refactored dashboard with stats, search, and flat-file export
├── shipping-bills/
│   ├── components/
│   │   ├── common/
│   │   │   ├── AsyncSelect.jsx         # Asynchronous searchable dropdown
│   │   │   ├── CollapsibleSection.jsx  # Accessible collapsible container
│   │   │   ├── FormActionsBar.jsx      # Sticky navigation actions bar
│   │   │   └── SectionHeader.jsx       # Standard section title & subtitle
│   │   ├── parties/
│   │   │   ├── PartySelector.jsx       # Party and operating branch selector
│   │   │   ├── PartyQuickAddModal.jsx  # Quick-add modal for new parties
│   │   │   └── BranchQuickAddModal.jsx # Quick-add modal for branch addresses
│   │   ├── tabs/
│   │   │   ├── ShipmentBasicsTab.jsx   # Tab 1: Exporter, Consignee, Ports, Weights
│   │   │   ├── InvoicesTab.jsx         # Tab 2: Commercial invoices & goods items
│   │   │   ├── InvoiceItemEditor.jsx   # Individual line item editor
│   │   │   └── OthersTab.jsx           # Tab 3: Containers, Packing, e-Sanchit IRN, Licenses
│   │   └── workflow/
│   │       └── WorkflowIndicator.jsx   # Visual export job workflow progress
│   ├── domain/
│   │   ├── shipping-bill-model.js      # Domain types, defaults, and calculations
│   │   ├── shipping-bill-validation.js # Schema validation rules & domain constraints
│   │   └── workflow-steps.js           # Workflow step definitions
│   ├── services/
│   │   ├── lookup-service.js           # Asynchronous reference data mock service
│   │   ├── party-service.js            # Asynchronous party management service
│   │   └── shipping-bill-service.js    # Asynchronous shipping bill CRUD & flat-file export
│   └── shipping-bill-form.jsx          # Main Shipping Bill form coordinator
```

---

### AI Usage & Approach

- **Tools Used**: Antigravity AI, Gemini Flash, and Headless Browser Automation Subagent.
- **How They Were Used**:
  1. *Codebase & Constraint Analysis*: Inspected the starter repository, `fe-zen-arch` workspace submodule, dependencies, and routing structure.
  2. *Architectural Decomposition*: Planned and executed the decomposition of the 1,762-line monolithic file into modular components and asynchronous services.
  3. *User Constraint Adaptation*: Respecting the user's explicit directive to use `.jsx/.js` files, configured `tsconfig.json` and Vite bundler to seamlessly support JSX/JS while maintaining strict quality.
  4. *Automated End-to-End Validation*: Dispatched the browser subagent to interactively load the app, create a complete shipping bill (`#3002`), test party selection, verify live financial calculations, test multi-tab navigation, and confirm ICEGATE flat file download.
- **Engineering Judgment**:
  - Strictly followed the rule: **no new dependencies added** to `package.json`.
  - Replaced hardcoded array imports with Promise-based asynchronous mock services with simulated latency and search filters, allowing seamless replacement with real HTTP APIs.
  - Implemented persistent tab rendering (`role="tabpanel" hidden={...}`) ensuring React Hook Form maintains field registrations and runs comprehensive cross-tab validations on submit.
- **Learnings & Validation**:
  - Verified that Vite builds cleanly for production (`pnpm build` completed with 0 errors).
  - Validated live interaction, error toasts, and domain calculation reactivity in the browser.
"# Shipping-Bill" 
