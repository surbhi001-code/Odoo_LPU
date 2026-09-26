import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
} from 'lucide-react'

export const navigationGroups = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard },
      { to: '/products', label: 'Products', icon: Package },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { to: '/operations/receipts', label: 'Receipts', icon: ArrowDownToLine },
      {
        to: '/operations/deliveries',
        label: 'Delivery orders',
        icon: ArrowUpFromLine,
      },
      {
        to: '/operations/transfers',
        label: 'Internal transfers',
        icon: ArrowLeftRight,
      },
      {
        to: '/operations/adjustments',
        label: 'Stock adjustments',
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { to: '/movements', label: 'Move history', icon: History },
      { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
    ],
  },
]

export const operationPaths = {
  Receipt: '/operations/receipts',
  Delivery: '/operations/deliveries',
  Transfer: '/operations/transfers',
  Adjustment: '/operations/adjustments',
}
