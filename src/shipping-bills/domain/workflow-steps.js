import { routes } from '@/shared/route-paths'

export const workflowSteps = [
  {
    id: 'shipping-bill',
    title: 'Shipping bill',
    description: 'Current step',
    route: routes.toShippingBillEdit,
    status: 'current'
  },
  {
    id: 'document-review',
    title: 'Document review',
    description: 'Pending generation',
    status: 'upcoming'
  },
  {
    id: 'customs-filing',
    title: 'Customs filing',
    description: 'ICEGATE submission',
    status: 'upcoming'
  },
  {
    id: 'shipment-tracking',
    title: 'Shipment tracking',
    description: 'Port & vessel updates',
    status: 'upcoming'
  }
]
