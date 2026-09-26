import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Field from '../../../components/forms/Field'
import { useWorkspace } from '../../../lib/workspaceContext'
import { operationTypes, today } from '../../../lib/inventory'
import { createOperation } from '../api'
export default function OperationForm({
  initialType = 'Receipt',
  onClose,
  workspace,
  locationMode = false,
  operation,
}) {
  const context = useWorkspace()
  const { state, mutate } = workspace || context
  const [form, setForm] = useState(
    operation
      ? {
          id: operation.id,
          type: operation.type,
          partner: operation.partner || '',
          warehouseId:
            operation.type === 'Receipt'
              ? operation.destinationLocationId
              : operation.sourceLocationId,
          destinationId: operation.destinationLocationId,
          scheduledDate: operation.scheduledDate || today(),
          notes: operation.notes || '',
          lines: operation.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        }
      : {
          type: initialType,
          partner: '',
          warehouseId: '',
          destinationId: '',
          scheduledDate: today(),
          notes: '',
          lines: [{ productId: '', quantity: 1 }],
        },
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  })
  const setLine = (index, key, value) =>
    setForm({
      ...form,
      lines: form.lines.map((line, i) =>
        i === index ? { ...line, [key]: value } : line,
      ),
    })
  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        lines: form.lines.map((l) => ({ ...l, quantity: Number(l.quantity) })),
      }
      if (operation) await mutate('editOperation', payload)
      else await createOperation(mutate, payload)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }
  return (
    <Modal
      title={operation ? `Edit ${operation.reference}` : 'New operation'}
      description={
        operation
          ? 'Saving product lines or locations returns the operation to draft for review.'
          : 'Start with a draft. Stock changes only after validation.'
      }
      onClose={saving ? () => {} : onClose}
      wide
    >
      {!state.products.length || !state.warehouses.length ? (
        <div className="[&_p]:leading-[1.8] [&_p]:text-[13px] [&_p]:text-[#809271] [&_p]:mb-5.5">
          <p>
            {locationMode
              ? 'Add at least one product and warehouse location on the server before creating an operation.'
              : 'Add at least one product and warehouse before creating an operation.'}
          </p>
          <div className="page-actions flex items-center gap-3.5 flex-wrap">
            <Link
              to="/warehouses"
              onClick={onClose}
              className="button border border-[#dfe6e0] rounded-[6px] min-h-[37px] py-[9px] px-[15px] inline-flex items-center justify-center gap-2 text-[11px] font-semibold leading-[1.4] whitespace-nowrap transition duration-150 active:translate-y-px bg-white text-[#526759] hover:bg-[#f4f7f3]"
            >
              Add warehouse
            </Link>
            <Link
              to="/products"
              onClick={onClose}
              className="button border border-[#286047] rounded-[6px] min-h-[37px] py-[9px] px-[15px] inline-flex items-center justify-center gap-2 text-[11px] font-semibold leading-[1.4] whitespace-nowrap transition duration-150 active:translate-y-px bg-[#286047] text-white shadow-[0_2px_3px_#26492d0c] hover:bg-[#184b35]"
            >
              Add product
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[520px]:grid-cols-1">
            <Field
              label="Operation type"
              disabled={Boolean(operation)}
              {...field('type')}
            >
              {operationTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Field>
            <Field
              label="Scheduled date"
              type="date"
              required
              {...field('scheduledDate')}
            />
            {['Receipt', 'Delivery'].includes(form.type) && (
              <Field
                label={form.type === 'Receipt' ? 'Supplier' : 'Customer'}
                placeholder={
                  form.type === 'Receipt' ? 'Supplier name' : 'Customer name'
                }
                required
                {...field('partner')}
              />
            )}
            <Field
              label={
                locationMode
                  ? form.type === 'Transfer'
                    ? 'Source location'
                    : 'Location'
                  : form.type === 'Transfer'
                    ? 'Source warehouse'
                    : 'Warehouse'
              }
              required
              {...field('warehouseId')}
            >
              <option value="">
                {locationMode ? 'Select location' : 'Select warehouse'}
              </option>
              {state.warehouses.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.name}
                </option>
              ))}
            </Field>
            {form.type === 'Transfer' && (
              <Field
                label={
                  locationMode
                    ? 'Destination location'
                    : 'Destination warehouse'
                }
                required
                {...field('destinationId')}
              >
                <option value="">Select destination</option>
                {state.warehouses
                  .filter((w) => w.id !== form.warehouseId)
                  .map((w) => (
                    <option value={w.id} key={w.id}>
                      {w.name}
                    </option>
                  ))}
              </Field>
            )}
          </div>
          <div className="my-5 [&_h3]:mb-3">
            <h3>
              {form.type === 'Adjustment'
                ? 'Physical inventory count'
                : 'Products'}
            </h3>
            {form.lines.map((line, index) => (
              <div
                className="mb-3 grid grid-cols-[1fr_135px_30px] items-end gap-3 [&>.icon-button]:mb-1 max-[520px]:grid-cols-[1fr_85px_25px] max-[520px]:gap-2 max-[520px]:[&_.field]:text-[10px] max-[520px]:[&_select]:p-2 max-[520px]:[&_select]:text-[10px] max-[520px]:[&_.field_input]:text-[14px] max-[520px]:[&_.field_input]:p-2"
                key={index}
              >
                <Field
                  label={`Product ${index + 1}`}
                  required
                  value={line.productId}
                  onChange={(e) => setLine(index, 'productId', e.target.value)}
                >
                  <option value="">Select product</option>
                  {state.products.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name} · {p.sku} ({p.unit})
                    </option>
                  ))}
                </Field>
                <Field
                  label={
                    form.type === 'Adjustment' ? 'Counted quantity' : 'Quantity'
                  }
                  type="number"
                  min={form.type === 'Adjustment' ? '0' : '0.01'}
                  max="999999999999.99"
                  step="0.01"
                  required
                  value={line.quantity}
                  onChange={(e) => setLine(index, 'quantity', e.target.value)}
                />
                <button
                  type="button"
                  className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48]"
                  aria-label={`Remove product ${index + 1}`}
                  disabled={form.lines.length === 1}
                  onClick={() =>
                    setForm({
                      ...form,
                      lines: form.lines.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setForm({
                  ...form,
                  lines: [...form.lines, { productId: '', quantity: 1 }],
                })
              }
            >
              <Plus size={16} />
              Add another product
            </Button>
          </div>
          {
            <label className="field flex flex-col gap-1.5 text-[11px] font-semibold [&>span]:text-[#53685a] [&_b]:text-[#b49a74] [&_b]:font-normal [&_textarea]:min-h-10 [&_textarea]:w-full [&_textarea]:rounded-[6px] [&_textarea]:border [&_textarea]:border-[#dbe5dd] [&_textarea]:bg-white [&_textarea]:px-[11px] [&_textarea]:py-2 [&_textarea]:text-[12px] [&_textarea::placeholder]:text-[#98a59c] max-[520px]:[&_textarea]:text-[16px]">
              <span>
                Notes{' '}
                <span className="muted text-[#84908b] font-normal">
                  (optional)
                </span>
              </span>
              <textarea
                rows="3"
                maxLength={10000}
                placeholder="Add context for your team..."
                {...field('notes')}
              />
            </label>
          }
          {form.type === 'Adjustment' && (
            <p className="info-box py-[13px] px-[15px] bg-[#f6f9f1] border border-[#e5eddc] text-[#82916f] rounded-[7px] text-[11px] leading-[1.8] mt-5 [&_a]:underline [&_a]:text-[#517a3d]">
              Enter the actual quantity counted, not the difference. Validation
              updates this location to the counted quantity.
            </p>
          )}
          {error && (
            <p
              className="text-[11px] text-[#ad6148] py-[11px] px-[13px] bg-[#fff3ee] border border-[#f4ded2] rounded-[6px] mt-[17px] mx-0 mb-0 leading-[1.8]"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2.5 border-t border-t-[#e7ece9] pt-4 max-[520px]:flex-wrap max-[520px]:[&_.button]:flex-1">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button disabled={saving}>
              {saving
                ? 'Saving…'
                : operation
                  ? 'Save changes'
                  : 'Save as draft'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
