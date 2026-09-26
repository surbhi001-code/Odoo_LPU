import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import { useWorkspace } from '../../../lib/workspaceContext'
import { statuses } from '../../../lib/inventory'
import OperationsTable from '../components/OperationsTable'
import OperationForm from '../components/OperationForm'
import OperationDetails from '../components/OperationDetails'
const descriptions = {
  Receipt: [
    'Receipts',
    'Welcome incoming goods and keep your stock up to date.',
  ],
  Delivery: [
    'Delivery orders',
    'From your warehouse to your customers, keep every order moving.',
  ],
  Transfer: [
    'Internal transfers',
    'Move inventory between warehouses without losing track.',
  ],
  Adjustment: [
    'Stock adjustments',
    'Keep recorded stock aligned with what’s on your shelves.',
  ],
}
export default function OperationsPage({ type }) {
  const { state } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [create, setCreate] = useState(false)
  const [selected, setSelected] = useState(null)
  const activeOperation =
    state.operations.find(
      (operation) =>
        operation.id === params.get('operation') && operation.type === type,
    )?.id || selected
  function closeOperation() {
    setSelected(null)
    if (params.has('operation')) {
      const next = new URLSearchParams(params)
      next.delete('operation')
      setParams(next, { replace: true })
    }
  }
  const all = state.operations.filter((o) => o.type === type)
  const rows = all.filter(
    (o) =>
      `${o.reference} ${o.partner}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || o.status === status) &&
      (!warehouse ||
        o.warehouseId === warehouse ||
        o.destinationId === warehouse),
  )
  return (
    <>
      <PageHeader
        eyebrow="OPERATIONS"
        title={descriptions[type][0]}
        description={descriptions[type][1]}
      >
        <Button onClick={() => setCreate(true)}>
          <Plus size={17} />
          New {type.toLowerCase()}
        </Button>
      </PageHeader>
      <div
        className="flex gap-6 border-b border-b-[#e0e7da] mb-5.5 overflow-x-auto [&_button]:flex [&_button]:items-center [&_button]:gap-2 [&_button]:text-[11px] [&_button]:whitespace-nowrap [&_button]:border-0 [&_button]:border-transparent [&_button]:border-b-[2px] [&_button]:border-b-transparent [&_button]:bg-transparent [&_button]:pt-0 [&_button]:px-0 [&_button]:pb-3.5 [&_button]:text-[#96a088] [&_button.selected]:text-[#416738] [&_button.selected]:border-b-[#6f9258] [&_button_span]:text-[9px] [&_button_span]:py-[3px] [&_button_span]:px-1.5 [&_button_span]:bg-[#eef3e8] [&_button_span]:rounded-[4px] max-[800px]:gap-5.5"
        aria-label="Filter by operation status"
      >
        {['', ...statuses].map((s) => (
          <button
            key={s}
            className={status === s ? 'selected' : ''}
            onClick={() => setStatus(s)}
          >
            {s || 'All operations'}
            <span>
              {s ? all.filter((o) => o.status === s).length : all.length}
            </span>
          </button>
        ))}
      </div>
      <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
        <div className="[&_select]:appearance-auto [&_select]:border [&_select]:border-[#e4eae2] [&_select]:rounded-[5px] [&_select]:py-[7px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[10px] [&_select]:text-[#7c8c78] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8 py-4.5 px-[21px] flex gap-3 items-center max-[1050px]:flex-wrap max-[1050px]:[&_.search-input]:basis-full max-[520px]:p-[15px] max-[520px]:gap-2.5 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:flex-1 max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[9px]">
          <div className="search-input flex items-center gap-[9px] flex-1 text-[#98a48e] [&_input]:border-0 [&_input]:border-transparent [&_input]:text-[11px] [&_input]:w-full [&_input]:min-w-27.5 [&_input]:py-1.5 [&_input]:px-0 [&_input::placeholder]:text-[#a0aa97]">
            <Search size={17} />
            <input
              aria-label="Search operations"
              placeholder="Search reference or partner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by warehouse"
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
        <OperationsTable
          rows={rows}
          state={state}
          onSelect={setSelected}
          filtered={Boolean(query || status || warehouse)}
          onCreate={() => setCreate(true)}
        />
        <div className="py-3 px-[21px] border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#a0ab98] [&>span]:text-[8px] [&>span]:text-[#a8b19f] max-[520px]:py-3 max-[520px]:px-[15px] max-[520px]:[&>span]:hidden">
          {rows.length} operation{rows.length !== 1 ? 's' : ''}
          <span>Drafts don’t affect your stock</span>
        </div>
      </section>
      {create && (
        <OperationForm initialType={type} onClose={() => setCreate(false)} />
      )}
      {activeOperation && (
        <OperationDetails id={activeOperation} onClose={closeOperation} />
      )}
    </>
  )
}
