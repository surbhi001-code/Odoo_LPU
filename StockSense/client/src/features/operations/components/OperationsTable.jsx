import { ArrowUpRight, ClipboardList } from 'lucide-react'
import Table from '../../../components/ui/Table'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'
import { formatDate, warehouseName } from '../../../lib/inventory'
export default function OperationsTable({
  rows,
  state,
  onSelect,
  filtered = false,
  onCreate,
}) {
  return (
    <Table
      rows={rows}
      columns={[
        {
          key: 'reference',
          label: 'REFERENCE',
          render: (o) => (
            <button
              className="text-link inline-flex items-center gap-1.5 border-0 border-transparent bg-transparent p-0 text-[11px] font-semibold text-[#4d7956] hover:text-[#254f2d] hover:underline"
              onClick={() => onSelect(o.id)}
            >
              {o.reference}
              <ArrowUpRight size={13} />
            </button>
          ),
        },
        { key: 'type', label: 'TYPE', render: (o) => <Badge>{o.type}</Badge> },
        {
          key: 'warehouse',
          label: 'WAREHOUSE',
          render: (o) => warehouseName(state, o.warehouseId),
        },
        {
          key: 'partner',
          label: 'PARTNER / DESTINATION',
          render: (o) =>
            o.type === 'Transfer'
              ? warehouseName(state, o.destinationId)
              : o.partner || 'Internal',
        },
        {
          key: 'scheduledDate',
          label: 'SCHEDULED',
          render: (o) => formatDate(o.scheduledDate),
        },
        {
          key: 'status',
          label: 'STATUS',
          render: (o) => <Badge>{o.status}</Badge>,
        },
      ]}
      empty={
        <EmptyState
          icon={ClipboardList}
          title={
            filtered
              ? 'No matching operations'
              : 'A clean slate for your operations'
          }
          description={
            filtered
              ? 'Try a different filter to find your operation.'
              : 'Your receipts, deliveries, and stock movements will appear here.'
          }
        >
          {!filtered && onCreate && (
            <button
              className="text-link inline-flex items-center gap-1.5 border-0 border-transparent bg-transparent p-0 text-[11px] font-semibold text-[#4d7956] hover:text-[#254f2d] hover:underline"
              onClick={onCreate}
            >
              Create your first operation <ArrowUpRight size={15} />
            </button>
          )}
        </EmptyState>
      }
    />
  )
}
