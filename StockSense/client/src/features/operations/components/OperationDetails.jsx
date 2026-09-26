import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import { useWorkspace } from '../../../lib/workspaceContext'
import { formatDate, today, warehouseName } from '../../../lib/inventory'
import { createOperation, updateOperation } from '../api'
export default function OperationDetails({
  id,
  onClose,
  workspace,
  allowValidation = true,
  onEdit,
}) {
  const context = useWorkspace()
  const { state, mutate } = workspace || context
  const operation = state.operations.find((o) => o.id === id)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [shelfId, setShelfId] = useState('')
  const next = {
    Draft: [
      'Waiting',
      operation.type === 'Delivery' ? 'Pick items' : 'Confirm operation',
    ],
    Waiting: [
      'Ready',
      operation.type === 'Delivery' ? 'Pack items' : 'Mark as ready',
    ],
    Ready: ['Done', 'Validate operation'],
  }[operation.status]
  const locations = state.locations?.length
    ? state.locations
    : (state.warehouses || []).flatMap((warehouse) =>
        (warehouse.Locations || []).map((location) => ({
          id: String(location.id),
          warehouseId: String(warehouse.id),
          name: `${warehouse.name} / ${location.name}`,
        })),
      )
  const receivedAt = locations.find(
    (location) => location.id === operation.destinationLocationId,
  )
  const shelfOptions = locations.filter(
    (location) =>
      receivedAt &&
      location.warehouseId === receivedAt.warehouseId &&
      location.id !== receivedAt.id,
  )
  async function transition(status) {
    setSaving(true)
    setError('')
    try {
      await updateOperation(mutate, id, status)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      title={operation.reference}
      description={`${operation.type} · Created ${formatDate(operation.createdAt)}`}
      onClose={saving ? () => {} : onClose}
      wide
    >
      <div className="flex items-center justify-between text-[11px] text-[#8b9b7d] mb-6 max-[520px]:text-[10px]">
        <Badge>{operation.status}</Badge>
        <span>Scheduled {formatDate(operation.scheduledDate)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-5 mx-0 mb-[25px] [&_small]:block [&_small]:text-[9px] [&_small]:text-[#9aaa8a] [&_small]:tracking-[1px] [&_strong]:text-[12px] [&_strong]:block [&_strong]:mt-[7px] [&_strong]:font-medium">
        <div>
          <small>WAREHOUSE</small>
          <strong>{warehouseName(state, operation.warehouseId)}</strong>
        </div>
        <div>
          <small>
            {operation.type === 'Transfer' ? 'DESTINATION' : 'PARTNER'}
          </small>
          <strong>
            {operation.type === 'Transfer'
              ? warehouseName(state, operation.destinationId)
              : operation.partner || 'Internal adjustment'}
          </strong>
        </div>
      </div>
      {workspace && (
        <p className="mb-4 text-xs text-[#718174]">
          Location:{' '}
          {operation.sourceLocation || operation.destinationLocation || '—'}
          {operation.type === 'Transfer'
            ? ` → ${operation.destinationLocation || '—'}`
            : ''}
        </p>
      )}
      <Table
        columns={[
          { key: 'name', label: 'PRODUCT' },
          { key: 'sku', label: 'SKU' },
          {
            key: 'quantity',
            label:
              operation.type === 'Adjustment' ? 'COUNTED QUANTITY' : 'QUANTITY',
          },
          { key: 'unit', label: 'UNIT' },
        ]}
        rows={operation.lines.map((line) => ({
          ...state.products.find((p) => p.id === line.productId),
          quantity: line.quantity,
        }))}
      />
      {operation.notes && (
        <p className="text-[12px] text-[#8a9a7b] bg-[#f9faf6] rounded-[6px] p-3.5 mt-5 whitespace-pre-wrap">
          {operation.notes}
        </p>
      )}
      <p className="info-box py-[13px] px-[15px] bg-[#f6f9f1] border border-[#e5eddc] text-[#82916f] rounded-[7px] text-[11px] leading-[1.8] mt-5 [&_a]:underline [&_a]:text-[#517a3d]">
        {operation.status === 'Done'
          ? 'This operation has been validated and recorded in move history.'
          : operation.status === 'Canceled'
            ? 'This operation was canceled. Stock was not changed.'
            : operation.type === 'Delivery'
              ? 'Pick items → Pack items → Validate. Stock decreases only after validation.'
              : 'Confirm → Mark ready → Validate. Validation applies all quantities to stock and creates movement records.'}
      </p>
      {error && (
        <p
          className="text-[11px] text-[#ad6148] py-[11px] px-[13px] bg-[#fff3ee] border border-[#f4ded2] rounded-[6px] mt-[17px] mx-0 mb-0 leading-[1.8]"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="border-t border-t-[#e7ece9] pt-[19px] mt-[25px] flex justify-end gap-2.5 max-[520px]:flex-wrap max-[520px]:[&_.button]:flex-1">
        {next ? (
          <>
            {onEdit && (
              <Button variant="secondary" disabled={saving} onClick={onEdit}>
                Edit operation
              </Button>
            )}
            <Button
              variant="danger"
              disabled={saving}
              onClick={() => transition('Canceled')}
            >
              Cancel operation
            </Button>
            <Button
              disabled={saving || (next[0] === 'Done' && !allowValidation)}
              onClick={() => transition(next[0])}
            >
              {saving ? 'Saving…' : next[1]}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      {next?.[0] === 'Done' && !allowValidation && (
        <p className="mt-3 text-xs text-[#718174]">
          An inventory manager must validate this operation.
        </p>
      )}
      {operation.type === 'Receipt' &&
        operation.status === 'Done' &&
        shelfOptions.length > 0 && (
          <form
            className="mt-4 space-y-3 border-t border-[#e7ece9] pt-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setSaving(true)
              setError('')
              try {
                await createOperation(mutate, {
                  type: 'Transfer',
                  partner: 'Putaway / shelving',
                  warehouseId: operation.destinationLocationId,
                  destinationId: shelfId,
                  scheduledDate: today(),
                  notes: `Shelved from ${operation.reference}`,
                  lines: operation.lines.map((line) => ({
                    productId: line.productId,
                    quantity: line.quantity,
                  })),
                })
                onClose()
              } catch (err) {
                setError(err.message)
              } finally {
                setSaving(false)
              }
            }}
          >
            <p className="text-xs text-[#718174]">
              Shelve received goods to another location in this warehouse. A
              draft internal transfer is created — validate it to move stock.
            </p>
            <select
              required
              aria-label="Shelve to location"
              value={shelfId}
              onChange={(event) => setShelfId(event.target.value)}
              className="h-8.5 w-full rounded-[6px] border border-[#dce5df] bg-white px-2.5 text-[11px] font-medium text-[#53665a]"
            >
              <option value="">Choose rack or storage location</option>
              {shelfOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <Button disabled={saving || !shelfId}>
              {saving ? 'Saving…' : 'Create shelving transfer'}
            </Button>
          </form>
        )}
    </Modal>
  )
}
