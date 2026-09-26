import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Warehouse, MapPin, Pencil, Package } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Field from '../../components/forms/Field'
import { useWorkspace } from '../../lib/workspaceContext'
import { quantityAt } from '../../lib/inventory'
import LocationsDialog from './LocationsDialog'
function WarehouseForm({ warehouse, onClose }) {
  const { mutate } = useWorkspace()
  const [form, setForm] = useState(
    warehouse || { name: '', code: '', location: '' },
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await mutate(
        'saveWarehouse',
        form,
        warehouse ? 'Warehouse updated' : 'Warehouse created',
      )
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }
  return (
    <Modal
      title={warehouse ? 'Edit warehouse' : 'Add a warehouse'}
      description="Create a home for your products."
      onClose={saving ? () => {} : onClose}
    >
      <form onSubmit={submit}>
        <div className="flex flex-col gap-3.5">
          {[
            ['name', 'Warehouse name', 'e.g. Main warehouse'],
            ['code', 'Short code', 'e.g. WH-MAIN'],
            ['location', 'Address', 'e.g. Building A, Ground floor'],
          ].map(([key, label, placeholder]) => (
            <Field
              key={key}
              label={label}
              placeholder={placeholder}
              required
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>
        {error && (
          <p
            className="text-[11px] text-[#ad6148] py-[11px] px-[13px] bg-[#fff3ee] border border-[#f4ded2] rounded-[6px] mt-[17px] mx-0 mb-0 leading-[1.8]"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="border-t border-t-[#e7ece9] pt-4 mt-5 flex justify-end gap-2.5 max-[520px]:flex-wrap max-[520px]:[&_.button]:flex-1">
          <Button
            variant="secondary"
            type="button"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button disabled={saving}>
            {saving
              ? 'Saving…'
              : warehouse
                ? 'Save changes'
                : 'Create warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default function WarehousesPage() {
  const { state, canManage } = useWorkspace()
  const [editor, setEditor] = useState(null)
  const [locationWarehouse, setLocationWarehouse] = useState(null)
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const warehouses = state.warehouses.filter((warehouse) =>
    `${warehouse.name} ${warehouse.code} ${warehouse.location}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  function clearSearch() {
    const next = new URLSearchParams(params)
    next.delete('q')
    setParams(next, { replace: true })
  }
  return (
    <>
      <PageHeader title="Warehouses">
        <Button disabled={!canManage} onClick={() => setEditor({})}>
          <Plus size={17} />
          Add warehouse
        </Button>
      </PageHeader>
      {!canManage && (
        <p className="mb-4 rounded-lg border border-[#dfe7df] bg-white p-3 text-xs leading-6 text-[#68775f]">
          Warehouse Staff can view warehouses and locations. Ask an
          administrator for Inventory Manager access to add or edit them.
        </p>
      )}
      {query && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#dfe7df] bg-white px-4 py-2.5 text-xs text-[#65776a]">
          <span className="truncate">Search results for “{query}”</span>
          <button
            type="button"
            className="shrink-0 font-medium text-[#527740] hover:underline"
            onClick={clearSearch}
          >
            Clear search
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-3.5 text-[11px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2 max-[520px]:[&>.muted]:hidden">
        <h2>
          All warehouses{' '}
          <span className="font-sans inline-flex items-center justify-center text-[9px] min-w-[21px] h-5 py-0 px-1.5 bg-[#f0f4ef] border border-[#e7eee3] text-[#89997e] rounded-[5px] tracking-[0]">
            {warehouses.length}
          </span>
        </h2>
        <span className="muted text-[#66766c] font-medium">
          Stock availability by location
        </span>
      </div>
      {warehouses.length ? (
        <div className="grid grid-cols-3 gap-3.5 max-[1250px]:grid-cols-2 max-[800px]:gap-3 max-[520px]:grid-cols-1">
          {warehouses.map((w) => (
            <article
              className="overflow-hidden rounded-xl border border-[#dfe7e2] bg-white p-4.5 shadow-[0_3px_10px_#153a2508] transition hover:-translate-y-0.5 hover:border-[#9eb6a3] hover:shadow-[0_7px_18px_#173b2910] [&_.eyebrow]:block [&_h2]:mb-1.5 [&_h2]:text-[17px] [&_h2]:text-[#304b39] [&_p]:flex [&_p]:items-center [&_p]:gap-1.5 [&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:text-[#6e7e73]"
              key={w.id}
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="grid size-10 place-items-center rounded-[9px] border border-[#dce7d7] bg-[#edf4e9] text-[#668958]">
                  <Warehouse size={22} />
                </span>
                <button
                  className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48]"
                  aria-label={`Edit ${w.name}`}
                  disabled={!canManage}
                  onClick={() => setEditor(w)}
                >
                  <Pencil size={17} />
                </button>
              </div>
              <span className="eyebrow mb-1 text-[9px] font-[650] tracking-[1.45px] text-[#617865]">
                {w.code}
              </span>
              <h2>{w.name}</h2>
              <p>
                <MapPin size={15} />
                {w.location}
              </p>
              <div className="mt-3.5 flex items-center gap-2 border-t border-t-[#e7ece9] pt-3 text-[11px] text-[#6e7e73] [&_strong]:text-[#46724c]">
                <Package size={17} />
                <strong>
                  {state.products.filter((p) => quantityAt(p, w.id) > 0).length}
                </strong>{' '}
                products in stock
              </div>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setLocationWarehouse(w.id)}
                >
                  Locations (
                  {state.locations.filter((l) => l.warehouseId === w.id).length}
                  )
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
          <EmptyState
            icon={Warehouse}
            title={
              query ? 'No matching warehouses' : 'Make room for your inventory'
            }
            description={
              query
                ? 'Clear your search to see all warehouse locations.'
                : "Add your first warehouse or storage location. You'll be ready to receive, transfer, and track stock."
            }
          >
            <Button
              disabled={!query && !canManage}
              onClick={query ? clearSearch : () => setEditor({})}
            >
              <Plus size={17} />
              {query ? 'Clear search' : 'Create your first warehouse'}
            </Button>
          </EmptyState>
        </section>
      )}
      {editor && (
        <WarehouseForm
          warehouse={editor.id ? editor : null}
          onClose={() => setEditor(null)}
        />
      )}
      {locationWarehouse && (
        <LocationsDialog
          warehouseId={locationWarehouse}
          onClose={() => setLocationWarehouse(null)}
        />
      )}
    </>
  )
}
