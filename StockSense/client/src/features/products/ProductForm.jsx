import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Field from '../../components/forms/Field'
import { useWorkspace } from '../../lib/workspaceContext'
import { units } from '../../lib/inventory'
import { saveProduct } from './api'
export default function ProductForm({ product, onClose }) {
  const { state, mutate } = useWorkspace()
  const [form, setForm] = useState(
    product || {
      name: '',
      sku: '',
      category: '',
      unit: 'Units',
      reorderLevel: 5,
      reorderQuantity: '',
      initialStock: 0,
      locationId: '',
    },
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  })
  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveProduct(mutate, form)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }
  return (
    <Modal
      title={product ? 'Edit product' : 'Add a product'}
      description="Give every item a place in your inventory."
      onClose={saving ? () => {} : onClose}
    >
      <form onSubmit={submit}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[520px]:grid-cols-1">
          <Field
            label="Product name"
            placeholder="e.g. Steel rods"
            required
            {...field('name')}
          />
          <Field
            label="SKU / Code"
            placeholder="e.g. STL-001"
            required
            {...field('sku')}
          />
          <Field
            label="Category"
            placeholder="e.g. Raw materials"
            list="categories"
            {...field('category')}
          />
          <datalist id="categories">
            {state.categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <Field label="Unit of measure" {...field('unit')}>
            {[...new Set([form.unit, ...units])].map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </Field>
          <Field
            label="Reorder level"
            type="number"
            min="0"
            step="any"
            required
            hint="Alert when stock reaches this quantity."
            {...field('reorderLevel')}
          />
          <Field
            label="Reorder quantity"
            type="number"
            min="0"
            step="any"
            {...field('reorderQuantity')}
          />
        </div>
        {!product && (
          <div className="mt-4 grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
            <Field
              label="Opening stock"
              type="number"
              min="0"
              max="999999999999.99"
              step="0.01"
              required
              {...field('initialStock')}
            />
            <Field
              label="Opening stock location"
              required={Number(form.initialStock) > 0}
              {...field('locationId')}
            >
              <option value="">Select a location</option>
              {state.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.warehouseName} / {location.name}
                </option>
              ))}
            </Field>
          </div>
        )}
        <p className="mt-5 rounded-lg border border-[#e5eddc] bg-[#f6f9f1] p-3 text-xs leading-6 text-[#718174]">
          {product
            ? 'Use a receipt or stock adjustment to change quantities.'
            : 'Opening stock creates a validated receipt at the selected location.'}{' '}
          Every stock change is recorded in move history.
        </p>
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
            {saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
