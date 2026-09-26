import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Package,
  Pencil,
  MapPin,
  CircleCheck,
  TriangleAlert,
  CircleX,
  ArrowUpRight,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useWorkspace } from '../../lib/workspaceContext'
import { totalStock, stockStatus } from '../../lib/inventory'
import ProductForm from './ProductForm'
export default function ProductsPage() {
  const { state, canManage } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const setCategory = (value) => setParam('category', value)
  const [editor, setEditor] = useState(null)
  const [locations, setLocations] = useState(null)
  const query = params.get('q') || ''
  const stock = params.get('stock') || ''
  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const rows = state.products.filter(
    (p) =>
      `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()) &&
      (!category || p.category === category) &&
      (!stock ||
        (stock === 'attention'
          ? stockStatus(p) !== 'In stock'
          : stockStatus(p) === stock)),
  )
  const filtered = Boolean(query || category || stock)
  const categories = new Set(state.products.map((p) => p.category)).size
  const productStats = [
    {
      label: 'Total products',
      value: state.products.length,
      detail: `${categories} categor${categories === 1 ? 'y' : 'ies'}`,
      icon: Package,
      tone: 'bg-[#eaf3e9] text-[#497451]',
      line: 'bg-[#6f9875]',
      filter: '',
    },
    {
      label: 'In stock',
      value: state.products.filter((p) => stockStatus(p) === 'In stock').length,
      detail: 'Available and healthy',
      icon: CircleCheck,
      tone: 'bg-[#e8f4e9] text-[#397047]',
      line: 'bg-[#559265]',
      filter: 'In stock',
    },
    {
      label: 'Low stock',
      value: state.products.filter((p) => stockStatus(p) === 'Low stock')
        .length,
      detail: 'Review reorder levels',
      icon: TriangleAlert,
      tone: 'bg-[#fff1da] text-[#9a651c]',
      line: 'bg-[#d49a43]',
      filter: 'Low stock',
    },
    {
      label: 'Out of stock',
      value: state.products.filter((p) => stockStatus(p) === 'Out of stock')
        .length,
      detail: 'Restock required',
      icon: CircleX,
      tone: 'bg-[#f9e8e2] text-[#9a4f3c]',
      line: 'bg-[#c97560]',
      filter: 'Out of stock',
    },
  ]
  return (
    <>
      <PageHeader title="Products">
        <Button disabled={!canManage} onClick={() => setEditor({})}>
          <Plus size={17} />
          Add product
        </Button>
      </PageHeader>
      {!canManage && (
        <p className="mb-4 rounded-lg border border-[#dfe7df] bg-white p-3 text-xs leading-6 text-[#68775f]">
          Warehouse Staff can view products and stock. Ask an administrator for
          Inventory Manager access to add or edit products.
        </p>
      )}
      <div className="mb-4 grid grid-cols-4 gap-2.5 max-[1050px]:grid-cols-2 max-[520px]:gap-2">
        {productStats.map((item) => {
          const Icon = item.icon
          const active = stock === item.filter || (!stock && !item.filter)
          return (
            <button
              type="button"
              key={item.label}
              onClick={() => setParam('stock', item.filter)}
              className={`group relative min-h-[96px] overflow-hidden rounded-[10px] border bg-white p-3.5 text-left shadow-[0_3px_10px_#173b290d] transition hover:-translate-y-0.5 hover:border-[#9bb49f] hover:shadow-[0_7px_18px_#173b2912] max-[520px]:min-h-[92px] max-[520px]:p-3 ${
                active
                  ? 'border-[#a9c1ae] ring-2 ring-[#dfeae1]'
                  : 'border-[#dfe7e2]'
              }`}
            >
              <span className={`absolute inset-x-0 top-0 h-0.5 ${item.line}`} />
              <span className="flex items-start justify-between gap-2">
                <span
                  className={`grid size-7.5 place-items-center rounded-lg ${item.tone}`}
                >
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-[#96a49b] transition group-hover:text-[#476b51]"
                />
              </span>
              <span className="mt-2 flex items-end gap-2">
                <strong className="text-[24px] leading-none font-[750] tracking-[-1px] text-[#233f31]">
                  {item.value.toLocaleString()}
                </strong>
                <span className="pb-0.5 text-[11px] font-semibold text-[#4c6254]">
                  {item.label}
                </span>
              </span>
              <span className="mt-1 block text-[9px] font-medium text-[#718077]">
                {item.detail}
              </span>
            </button>
          )
        })}
      </div>
      <section className="overflow-hidden rounded-xl border border-[#dfe7e2] bg-white shadow-[0_3px_10px_#153a2508] [&_table]:text-[12px] [&_th]:py-2.5 [&_th]:text-[9px] [&_th]:font-semibold [&_th]:text-[#617268] [&_td]:py-3 [&_td]:text-[#53645a]">
        <div className="[&_select]:appearance-auto [&_select]:border [&_select]:border-[#dce5df] [&_select]:rounded-[6px] [&_select]:py-[6px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[11px] [&_select]:font-medium [&_select]:text-[#53665a] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8.5 py-3 px-5 flex gap-2.5 items-center border-b border-[#edf1ee] max-[1050px]:flex-wrap max-[1050px]:[&_.search-input]:basis-full max-[520px]:p-3 max-[520px]:gap-2 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:flex-1 max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[10px]">
          <div className="search-input flex h-9 items-center gap-2.5 flex-1 rounded-md border border-[#dce5df] px-3 text-[#73847a] focus-within:border-[#7da086] focus-within:ring-2 focus-within:ring-[#e4ece6] [&_input]:border-0 [&_input]:border-transparent [&_input]:text-[12px] [&_input]:text-[#354b3e] [&_input]:outline-none [&_input]:w-full [&_input]:min-w-27.5 [&_input]:py-1.5 [&_input]:px-0 [&_input::placeholder]:text-[#89988f]">
            <Search size={17} />
            <input
              aria-label="Search products"
              placeholder="Search by product name or SKU..."
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {[...new Set(state.products.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Filter by stock status"
            value={stock}
            onChange={(e) => setParam('stock', e.target.value)}
          >
            <option value="">All stock statuses</option>
            <option value="attention">Needs attention</option>
            {['In stock', 'Low stock', 'Out of stock'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <Table
          rows={rows}
          columns={[
            {
              key: 'name',
              label: 'PRODUCT',
              render: (p) => (
                <div className="flex items-center gap-2.5 [&_small]:block [&_small]:mt-[5px] [&_small]:text-[#a0ac94] [&_small]:text-[9px]">
                  <span className="h-8 w-8 border border-[#e8eedf] grid place-items-center rounded-[7px] text-[#94ad7b] bg-[#f8faf4]">
                    <Package size={18} />
                  </span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.sku}</small>
                  </div>
                </div>
              ),
            },
            { key: 'category', label: 'CATEGORY' },
            {
              key: 'stock',
              label: 'ON HAND',
              render: (p) => (
                <>
                  <strong>{totalStock(p).toLocaleString()}</strong>{' '}
                  <span className="muted text-[#84908b] font-normal">
                    {p.unit}
                  </span>
                </>
              ),
            },
            { key: 'reorderLevel', label: 'REORDER AT' },
            {
              key: 'status',
              label: 'STATUS',
              render: (p) => <Badge>{stockStatus(p)}</Badge>,
            },
            {
              key: 'actions',
              label: 'ACTIONS',
              render: (p) => (
                <div className="flex gap-1.5 [&_.icon-button]:w-[27px] [&_.icon-button]:h-[27px]">
                  <button
                    className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48]"
                    aria-label={`Stock locations for ${p.name}`}
                    onClick={() => setLocations(p)}
                  >
                    <MapPin size={17} />
                  </button>
                  <button
                    className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48]"
                    disabled={!canManage}
                    aria-label={`Edit ${p.name}`}
                    onClick={() => setEditor(p)}
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              ),
            },
          ]}
          empty={
            <EmptyState
              title={
                filtered ? 'No matching products' : 'Your inventory starts here'
              }
              description={
                filtered
                  ? 'Try another search or clear your filters.'
                  : 'Add your first product to track quantities, locations, and reordering levels.'
              }
            >
              {filtered ? (
                <Button variant="secondary" onClick={() => setParams({})}>
                  Clear filters
                </Button>
              ) : (
                <Button disabled={!canManage} onClick={() => setEditor({})}>
                  <Plus size={16} />
                  Add your first product
                </Button>
              )}
            </EmptyState>
          }
        />
        <div className="py-2.5 px-5 border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#7d8c82] [&>span]:text-[9px] [&>span]:text-[#8b978f] max-[520px]:py-2.5 max-[520px]:px-3 max-[520px]:[&>span]:hidden">
          {rows.length} product{rows.length !== 1 ? 's' : ''}
          <span>Stock updates when operations are validated</span>
        </div>
      </section>
      {editor && (
        <ProductForm
          product={editor.id ? editor : null}
          onClose={() => setEditor(null)}
        />
      )}
      {locations && (
        <Modal
          title={locations.name}
          description="Stock availability by warehouse and location"
          onClose={() => setLocations(null)}
        >
          {state.locations.length ? (
            <div className="[&>div]:flex [&>div]:justify-between [&>div]:py-4 [&>div]:px-0 [&>div]:border-b [&>div]:border-b-[#e7ece9] [&>div]:text-[12px] [&>div]:gap-5 [&_small]:block [&_small]:text-[#8b9b7a] [&_small]:mt-[5px]">
              {state.locations.map((w) => (
                <div key={w.id}>
                  <span>
                    <strong>{w.warehouseName}</strong>
                    <small>{w.name}</small>
                  </span>
                  <b>
                    {locations.locationStock[w.id] || 0} {locations.unit}
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No storage locations yet"
              description="Create a warehouse to start tracking stock by location."
            />
          )}
        </Modal>
      )}
    </>
  )
}
