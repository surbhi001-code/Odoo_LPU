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
        <div className="flex flex-col gap-4.5">
          {[
            ['name', 'Warehouse name', 'e.g. Main warehouse'],
            ['code', 'Short code', 'e.g. WH-MAIN'],
            ['location', 'Location / address', 'e.g. Building A, Ground floor'],
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
        <div className="border-t border-t-[#e7ece9] pt-[19px] mt-[25px] flex justify-end gap-2.5 max-[520px]:flex-wrap max-[520px]:[&_.button]:flex-1">
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
  const { state } = useWorkspace()
  const [editor, setEditor] = useState(null)
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
      <PageHeader
        eyebrow="A PLACE FOR EVERYTHING"
        title="Warehouses"
        description="Manage your storage locations in one connected workspace."
      >
        <Button onClick={() => setEditor({})}>
          <Plus size={17} />
          Add warehouse
        </Button>
      </PageHeader>
      {query && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-[#e4ebdc] bg-white px-4 py-3 text-xs text-[#7d9270]">
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
      <div className="flex justify-between items-center mb-5 text-[11px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] max-[520px]:[&>.muted]:hidden">
        <h2>
          All warehouses{' '}
          <span className="font-sans inline-flex items-center justify-center text-[9px] min-w-[21px] h-5 py-0 px-1.5 bg-[#f0f4ef] border border-[#e7eee3] text-[#89997e] rounded-[5px] tracking-[0]">
            {warehouses.length}
          </span>
        </h2>
        <span className="muted text-[#84908b] font-normal">
          Stock availability by location
        </span>
      </div>
      {warehouses.length ? (
        <div className="grid grid-cols-3 gap-5 max-[1250px]:grid-cols-2 max-[800px]:gap-3.5 max-[520px]:grid-cols-1">
          {warehouses.map((w) => (
            <article
              className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502] p-[23px] [&_.eyebrow]:block [&_h2]:text-[18px] [&_h2]:mb-[11px] [&_p]:flex [&_p]:items-center [&_p]:gap-[7px] [&_p]:text-[11px] [&_p]:text-[#97a188] [&_p]:leading-[1.7]"
              key={w.id}
            >
              <div className="flex items-center justify-between mb-5.5">
                <span className="h-11.5 w-11.5 grid place-items-center text-[#83a270] bg-[#f0f5e9] border border-[#e1ead6] rounded-[10px]">
                  <Warehouse size={25} />
                </span>
                <button
                  className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48]"
                  aria-label={`Edit ${w.name}`}
                  onClick={() => setEditor(w)}
                >
                  <Pencil size={17} />
                </button>
              </div>
              <span className="eyebrow text-[9px] font-[650] tracking-[1.55px] text-[#7f9587] mb-[7px]">
                {w.code}
              </span>
              <h2>{w.name}</h2>
              <p>
                <MapPin size={15} />
                {w.location}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#98a589] border-t border-t-[#e7ece9] pt-[19px] mt-5.5 [&_strong]:text-[#597d48]">
                <Package size={17} />
                <strong>
                  {state.products.filter((p) => quantityAt(p, w.id) > 0).length}
                </strong>{' '}
                products in stock
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
            <Button onClick={query ? clearSearch : () => setEditor({})}>
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
    </>
  )
}
