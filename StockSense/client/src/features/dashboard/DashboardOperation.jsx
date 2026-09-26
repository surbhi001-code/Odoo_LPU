import { useEffect, useState } from 'react'
import { useSession } from '../auth/session'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import OperationForm from '../operations/components/OperationForm'
import OperationDetails from '../operations/components/OperationDetails'
import { getOperationWorkspace, mutateOperation } from './api'

export default function DashboardOperation({
  id,
  initialType,
  warehouses,
  onClose,
  onChanged,
}) {
  const session = useSession()
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    getOperationWorkspace(warehouses, id, controller.signal, editing).then(
      (data) => {
        if (!controller.signal.aborted) setState(data)
      },
      (err) => {
        if (!controller.signal.aborted) setError(err.message)
      },
    )
    return () => controller.abort()
  }, [id, warehouses, attempt, editing])
  async function mutate(action, payload) {
    await mutateOperation(action, payload)
    // Keep a successful mutation successful even if the following refresh fails.
    onChanged()
    onClose()
  }
  if (!state)
    return (
      <Modal
        title={id ? 'Operation details' : 'New operation'}
        onClose={onClose}
      >
        {error ? (
          <div role="alert" className="space-y-3 text-sm">
            <p>{error}</p>
            <Button
              onClick={() => {
                setError('')
                setAttempt((value) => value + 1)
              }}
            >
              Try again
            </Button>
          </div>
        ) : (
          <p role="status">Loading operation…</p>
        )}
      </Modal>
    )
  const workspace = { state, mutate }
  return id && !editing ? (
    <OperationDetails
      id={id}
      workspace={workspace}
      allowValidation={['admin', 'inventory_manager'].includes(session?.role)}
      onClose={onClose}
      onEdit={() => {
        setState(null)
        setError('')
        setEditing(true)
      }}
    />
  ) : (
    <OperationForm
      initialType={initialType}
      operation={editing ? state.operations[0] : undefined}
      workspace={workspace}
      locationMode
      onClose={onClose}
    />
  )
}
