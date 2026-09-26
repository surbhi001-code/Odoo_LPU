import { useState } from 'react'
import { Search, History, Download } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useWorkspace } from '../../lib/workspaceContext'
import { formatDate, operationTypes } from '../../lib/inventory'
export default function MovementsPage() {
  const { state } = useWorkspace()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const name = (id) => state.warehouses.find((w) => w.id === id)?.name || id
  const rows = state.movements
    .map((m) => ({
      ...m,
      product: state.products.find((p) => p.id === m.productId),
    }))
    .filter(
      (m) =>
        `${m.reference} ${m.product?.name} ${m.product?.sku}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!type || m.type === type) &&
        (!warehouse || m.from === warehouse || m.to === warehouse),
    )
  function exportJson() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'stocksense-movements.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <PageHeader
        eyebrow="THE COMPLETE PICTURE"
        title="Move history"
        description="A traceable record of every stock movement."
      >
        <Button
          variant="secondary"
          onClick={exportJson}
          disabled={!rows.length}
        >
          <Download size={16} />
          Export JSON
        </Button>
      </PageHeader>
      <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
        <div className="[&_select]:appearance-auto [&_select]:border [&_select]:border-[#e4eae2] [&_select]:rounded-[5px] [&_select]:py-[7px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[10px] [&_select]:text-[#7c8c78] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8 py-4.5 px-[21px] flex gap-3 items-center max-[1050px]:flex-wrap max-[1050px]:[&_.search-input]:basis-full max-[520px]:p-[15px] max-[520px]:gap-2.5 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:flex-1 max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[9px]">
          <div className="search-input flex items-center gap-[9px] flex-1 text-[#98a48e] [&_input]:border-0 [&_input]:border-transparent [&_input]:text-[11px] [&_input]:w-full [&_input]:min-w-27.5 [&_input]:py-1.5 [&_input]:px-0 [&_input::placeholder]:text-[#a0aa97]">
            <Search size={17} />
            <input
              aria-label="Search move history"
              placeholder="Search product, SKU, or reference..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter movement type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All movement types</option>
            {operationTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            aria-label="Filter movement warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
          >
            <option value="">All warehouses</option>
            {state.warehouses.map((w) => (
              <option value={w.id} key={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <Table
          rows={rows}
          columns={[
            {
              key: 'createdAt',
              label: 'DATE',
              render: (m) => formatDate(m.createdAt),
            },
            { key: 'reference', label: 'REFERENCE' },
            {
              key: 'product',
              label: 'PRODUCT',
              render: (m) => (
                <div className="[&_small]:block [&_small]:mt-[5px] [&_small]:text-[#a0ac94] [&_small]:text-[9px]">
                  <strong>{m.product?.name}</strong>
                  <small>{m.product?.sku}</small>
                </div>
              ),
            },
            {
              key: 'type',
              label: 'TYPE',
              render: (m) => <Badge>{m.type}</Badge>,
            },
            { key: 'from', label: 'FROM', render: (m) => name(m.from) },
            { key: 'to', label: 'TO', render: (m) => name(m.to) },
            {
              key: 'quantity',
              label: 'QUANTITY',
              render: (m) => (
                <strong>
                  {m.quantity}{' '}
                  <span className="muted text-[#84908b] font-normal">
                    {m.product?.unit}
                  </span>
                </strong>
              ),
            },
          ]}
          empty={
            <EmptyState
              icon={History}
              title={
                query || type || warehouse
                  ? 'No matching movements'
                  : 'Every movement has a story'
              }
              description={
                query || type || warehouse
                  ? 'Adjust your search or filters to see more results.'
                  : 'Receive goods, deliver an order, transfer stock, or make an adjustment to begin your ledger.'
              }
            />
          }
        />
        <div className="py-3 px-[21px] border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#a0ab98] [&>span]:text-[8px] [&>span]:text-[#a8b19f] max-[520px]:py-3 max-[520px]:px-[15px] max-[520px]:[&>span]:hidden">
          {rows.length} movement{rows.length !== 1 ? 's' : ''}
          <span>Only validated operations change stock</span>
        </div>
      </section>
    </>
  )
}
