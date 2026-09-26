import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      initialStock: 0,
      reorderLevel: 5,
      warehouseId: '',
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
        <div className="grid grid-cols-2 gap-y-[19px] gap-x-4 max-[520px]:grid-cols-1">
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
            required
            list="categories"
            {...field('category')}
          />
          <datalist id="categories">
            {[...new Set(state.products.map((p) => p.category))].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Field label="Unit of measure" {...field('unit')}>
            {units.map((unit) => (
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
          {!product && (
            <>
              <Field
                label="Initial stock"
                type="number"
                min="0"
                step="any"
                required
                {...field('initialStock')}
              />
              <Field
                label="Opening stock warehouse"
                required={Number(form.initialStock) > 0}
                {...field('warehouseId')}
              >
                <option value="">Select a warehouse</option>
                {state.warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Field>
            </>
          )}
        </div>
        {!product && !state.warehouses.length && (
          <p className="info-box py-[13px] px-[15px] bg-[#f6f9f1] border border-[#e5eddc] text-[#82916f] rounded-[7px] text-[11px] leading-[1.8] mt-5 [&_a]:underline [&_a]:text-[#517a3d]">
            You can create a product with zero stock now.{' '}
            <Link to="/warehouses" onClick={onClose}>
              Add a warehouse
            </Link>{' '}
            before entering initial stock.
          </p>
        )}
        {product && (
          <p className="info-box py-[13px] px-[15px] bg-[#f6f9f1] border border-[#e5eddc] text-[#82916f] rounded-[7px] text-[11px] leading-[1.8] mt-5 [&_a]:underline [&_a]:text-[#517a3d]">
            Use a receipt or stock adjustment to change quantities. Every stock
            change is recorded in move history.
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
        <div className="border-t border-t-[#e7ece9] pt-[19px] mt-[25px] flex justify-end gap-2.5 max-[520px]:flex-wrap max-[520px]:[&_.button]:flex-1">
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
