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
        title="Move history"
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
      <section className="overflow-hidden rounded-xl border border-[#dfe7e2] bg-white shadow-[0_3px_10px_#153a2508]">
        <div className="[&_select]:appearance-auto [&_select]:border [&_select]:border-[#dce5df] [&_select]:rounded-[6px] [&_select]:py-[6px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[11px] [&_select]:font-medium [&_select]:text-[#53665a] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8.5 py-3 px-5 flex gap-2.5 items-center border-b border-[#edf1ee] max-[1050px]:flex-wrap max-[1050px]:[&_.search-input]:basis-full max-[520px]:p-3 max-[520px]:gap-2 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:flex-1 max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[10px]">
          <div className="search-input flex h-8.5 items-center gap-2.5 flex-1 rounded-md border border-[#dce5df] px-3 text-[#73847a] focus-within:border-[#7da086] focus-within:ring-2 focus-within:ring-[#e4ece6] [&_input]:border-0 [&_input]:text-[12px] [&_input]:text-[#354b3e] [&_input]:outline-none [&_input]:w-full [&_input]:min-w-27.5 [&_input]:py-1.5 [&_input]:px-0 [&_input::placeholder]:text-[#89988f]">
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
        <div className="py-2.5 px-5 border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#7d8c82] [&>span]:text-[9px] [&>span]:text-[#8b978f] max-[520px]:px-3 max-[520px]:[&>span]:hidden">
          {rows.length} movement{rows.length !== 1 ? 's' : ''}
          <span>Only validated operations change stock</span>
        </div>
      </section>
    </>
  )
}
