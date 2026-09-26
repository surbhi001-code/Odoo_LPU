import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Package, Pencil, MapPin } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useWorkspace } from '../../lib/workspaceContext'
import { totalStock, stockStatus, quantityAt } from '../../lib/inventory'
import ProductForm from './ProductForm'
export default function ProductsPage() {
  const { state } = useWorkspace()
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
  return (
    <>
      <PageHeader
        eyebrow="YOUR INVENTORY"
        title="Products"
        description="Know what you have, and where it belongs."
      >
        <Button onClick={() => setEditor({})}>
          <Plus size={17} />
          Add product
        </Button>
      </PageHeader>
      <div className="flex items-center bg-white border border-[#e7ece9] rounded-[9px] p-[21px] mb-[23px] gap-7.5 [&>div]:flex [&>div]:items-center [&>div]:gap-2.5 [&>div]:text-[#819479] [&>div]:text-[11px] [&_strong]:text-[17px] [&_strong]:text-[#44603b] [&_strong]:mr-1 max-[1050px]:gap-5 max-[1050px]:flex-wrap max-[520px]:grid max-[520px]:grid-cols-2 max-[520px]:gap-[19px] max-[520px]:p-[17px] max-[520px]:[&>div]:text-[10px] max-[520px]:[&>div]:gap-[7px] max-[520px]:[&_strong]:text-[15px]">
        <div>
          <Package size={20} />
          <span>
            <strong>{state.products.length}</strong> total products
          </span>
        </div>
        <div>
          <span className="green bg-current text-[#688958] h-[7px] w-[7px] rounded-full [&.green]:text-[#91b481] [&.amber]:text-[#d3a358] [&.red]:text-[#cf8b7b]" />
          <span>
            <strong>
              {
                state.products.filter((p) => stockStatus(p) === 'In stock')
                  .length
              }
            </strong>{' '}
            in stock
          </span>
        </div>
        <div>
          <span className="amber bg-current text-[#c29751] h-[7px] w-[7px] rounded-full [&.green]:text-[#91b481] [&.amber]:text-[#d3a358] [&.red]:text-[#cf8b7b]" />
          <span>
            <strong>
              {
                state.products.filter((p) => stockStatus(p) === 'Low stock')
                  .length
              }
            </strong>{' '}
            low stock
          </span>
        </div>
        <div>
          <span className="red h-[7px] w-[7px] rounded-full bg-current [&.green]:text-[#91b481] [&.amber]:text-[#d3a358] [&.red]:text-[#cf8b7b]" />
          <span>
            <strong>
              {
                state.products.filter((p) => stockStatus(p) === 'Out of stock')
                  .length
              }
            </strong>{' '}
            out of stock
          </span>
        </div>
      </div>
      <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
        <div className="[&_select]:appearance-auto [&_select]:border [&_select]:border-[#e4eae2] [&_select]:rounded-[5px] [&_select]:py-[7px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[10px] [&_select]:text-[#7c8c78] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8 py-4.5 px-[21px] flex gap-3 items-center max-[1050px]:flex-wrap max-[1050px]:[&_.search-input]:basis-full max-[520px]:p-[15px] max-[520px]:gap-2.5 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:flex-1 max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[9px]">
          <div className="search-input flex items-center gap-[9px] flex-1 text-[#98a48e] [&_input]:border-0 [&_input]:border-transparent [&_input]:text-[11px] [&_input]:w-full [&_input]:min-w-27.5 [&_input]:py-1.5 [&_input]:px-0 [&_input::placeholder]:text-[#a0aa97]">
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
                <Button
                  variant="secondary"
                  onClick={() => setParams({})}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setEditor({})}>
                  <Plus size={16} />
                  Add your first product
                </Button>
              )}
            </EmptyState>
          }
        />
        <div className="py-3 px-[21px] border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#a0ab98] [&>span]:text-[8px] [&>span]:text-[#a8b19f] max-[520px]:py-3 max-[520px]:px-[15px] max-[520px]:[&>span]:hidden">
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
          description="Stock availability by warehouse"
          onClose={() => setLocations(null)}
        >
          {state.warehouses.length ? (
            <div className="[&>div]:flex [&>div]:justify-between [&>div]:py-4 [&>div]:px-0 [&>div]:border-b [&>div]:border-b-[#e7ece9] [&>div]:text-[12px] [&>div]:gap-5 [&_small]:block [&_small]:text-[#8b9b7a] [&_small]:mt-[5px]">
              {state.warehouses.map((w) => (
                <div key={w.id}>
                  <span>
                    <strong>{w.name}</strong>
                    <small>{w.location}</small>
                  </span>
                  <b>
                    {quantityAt(locations, w.id)} {locations.unit}
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No warehouses yet"
              description="Create a warehouse to start tracking stock by location."
            />
          )}
        </Modal>
      )}
    </>
  )
}
