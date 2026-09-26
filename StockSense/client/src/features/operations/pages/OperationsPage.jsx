import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import { useWorkspace } from '../../../lib/workspaceContext'
import { statuses } from '../../../lib/inventory'
import OperationsTable from '../components/OperationsTable'
import DashboardOperation from '../../dashboard/DashboardOperation'
const descriptions = {
  Receipt: 'Receipts',
  Delivery: 'Delivery orders',
  Transfer: 'Internal transfers',
  Adjustment: 'Stock adjustments',
}
export default function OperationsPage({ type }) {
  const { state, reload } = useWorkspace()
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
      <PageHeader title={descriptions[type]}>
        <Button onClick={() => setCreate(true)}>
          <Plus size={17} />
          New {type.toLowerCase()}
        </Button>
      </PageHeader>
      <div
        className="mb-4 flex gap-5 overflow-x-auto border-b border-b-[#dce5df] [&_button]:flex [&_button]:items-center [&_button]:gap-2 [&_button]:whitespace-nowrap [&_button]:border-0 [&_button]:border-b-2 [&_button]:border-b-transparent [&_button]:bg-transparent [&_button]:px-0 [&_button]:pt-0 [&_button]:pb-2.5 [&_button]:text-[12px] [&_button]:font-medium [&_button]:text-[#708078] [&_button.selected]:border-b-[#5d8565] [&_button.selected]:font-semibold [&_button.selected]:text-[#315e3c] [&_button_span]:rounded-[5px] [&_button_span]:bg-[#e9f0e9] [&_button_span]:px-1.5 [&_button_span]:py-0.5 [&_button_span]:text-[9px] max-[800px]:gap-4"
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
      <section className="overflow-hidden rounded-xl border border-[#dfe7e2] bg-white shadow-[0_3px_10px_#153a2508]">
        <div className="[&_select]:appearance-auto [&_select]:border [&_select]:border-[#dce5df] [&_select]:rounded-[6px] [&_select]:py-[6px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[11px] [&_select]:font-medium [&_select]:text-[#53665a] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8.5 py-3 px-5 flex gap-2.5 items-center border-b border-[#edf1ee] max-[1050px]:flex-wrap max-[1050px]:[&_.search-input]:basis-full max-[520px]:p-3 max-[520px]:gap-2 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:flex-1 max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[10px]">
          <div className="search-input flex h-8.5 items-center gap-2.5 flex-1 rounded-md border border-[#dce5df] px-3 text-[#73847a] focus-within:border-[#7da086] focus-within:ring-2 focus-within:ring-[#e4ece6] [&_input]:border-0 [&_input]:text-[12px] [&_input]:text-[#354b3e] [&_input]:outline-none [&_input]:w-full [&_input]:min-w-27.5 [&_input]:py-1.5 [&_input]:px-0 [&_input::placeholder]:text-[#89988f]">
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
        <div className="py-2.5 px-5 border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#7d8c82] [&>span]:text-[9px] [&>span]:text-[#8b978f] max-[520px]:px-3 max-[520px]:[&>span]:hidden">
          {rows.length} operation{rows.length !== 1 ? 's' : ''}
          <span>Drafts don’t affect your stock</span>
        </div>
      </section>
      {create && (
        <DashboardOperation
          initialType={type}
          warehouses={state.warehouses}
          onChanged={reload}
          onClose={() => setCreate(false)}
        />
      )}
      {activeOperation && (
        <DashboardOperation
          key={activeOperation}
          id={activeOperation}
          warehouses={state.warehouses}
          onChanged={reload}
          onClose={closeOperation}
        />
      )}
    </>
  )
}
