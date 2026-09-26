import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import Field from '../../components/forms/Field'
import Button from '../../components/ui/Button'
import { useWorkspace } from '../../lib/workspaceContext'

export default function LocationsDialog({ warehouseId, onClose }) {
  const { state, mutate, canManage } = useWorkspace()
  const warehouse = state.warehouses.find((w) => w.id === warehouseId)
  const locations = state.locations.filter((l) => l.warehouseId === warehouseId)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await mutate(
        editing ? 'updateLocation' : 'createLocation',
        { id: editing, warehouseId, name, code },
        editing ? 'Location updated' : 'Location created',
      )
      setName('')
      setCode('')
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  async function remove() {
    setSaving(true)
    setError('')
    try {
      await mutate('deleteLocation', { id: deleting.id }, 'Location deleted')
      if (editing === deleting.id) {
        setEditing(null)
        setName('')
        setCode('')
      }
      setDeleting(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal
      title={`${warehouse.name} locations`}
      onClose={saving ? () => {} : onClose}
    >
      <div className="space-y-3">
        {!locations.length && (
          <p className="text-sm text-[#718174]">
            Add a storage location before receiving stock here.
          </p>
        )}
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between gap-3 border-b border-[#e7ece9] pb-3 text-sm"
          >
            <span>
              {location.name}
              <small className="block text-[#718174]">{location.code}</small>
            </span>
            {canManage && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={() => {
                    setEditing(location.id)
                    setName(location.name)
                    setCode(location.code || '')
                    setDeleting(null)
                    setError('')
                  }}
                >
                  Edit {location.name}
                </Button>
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={() => setDeleting(location)}
                >
                  Delete {location.name}
                </Button>
              </div>
            )}
          </div>
        ))}
        {deleting && (
          <div className="space-y-3 rounded-lg border border-[#f4ded2] bg-[#fff3ee] p-3 text-sm">
            <p>
              Delete {deleting.name}? The server will reject deletion if
              inventory records still reference it.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={saving}
                onClick={() => setDeleting(null)}
              >
                Keep location
              </Button>
              <Button variant="danger" disabled={saving} onClick={remove}>
                Confirm delete
              </Button>
            </div>
          </div>
        )}
        {canManage && (
          <form
            onSubmit={save}
            className="space-y-3 border-t border-[#e7ece9] pt-4"
          >
            <Field
              label="Location name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              label="Location code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex gap-2">
              <Button disabled={saving || !name.trim()}>
                {editing ? 'Save location' : 'Add location'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={() => {
                    setEditing(null)
                    setName('')
                    setCode('')
                    setError('')
                  }}
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
        )}
        {error && (
          <p role="alert" className="text-sm text-[#ad6148]">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
