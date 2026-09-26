import { useState } from 'react'
import Button from '../../components/ui/Button'
import Field from '../../components/forms/Field'
import { httpRequest } from '../../lib/httpClient'
import { useWorkspace } from '../../lib/workspaceContext'
import { roleLabels } from './roles'

export default function TeamAccess() {
  const { notify } = useWorkspace()
  const [email, setEmail] = useState('')
  const [account, setAccount] = useState(null)
  const [role, setRole] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function findAccount(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setAccount(null)
    try {
      const user = await httpRequest(
        `/auth/users?email=${encodeURIComponent(email.trim())}`,
      )
      setAccount(user)
      setRole(user.role)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  async function saveRole(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await httpRequest(`/auth/users/${account.id}/role`, {
        method: 'PATCH',
        body: { role },
      })
      setAccount(user)
      setRole(user.role)
      notify(`Access updated for ${user.email}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="mt-5 max-w-185 space-y-4 rounded-xl border border-[#dfe7e2] bg-white p-5">
      <h2 className="text-lg font-semibold">Team access</h2>
      <p className="text-xs leading-6 text-[#68775f]">
        New accounts start as Warehouse Staff. Grant Inventory Manager access
        only to trusted team members.
      </p>
      <form onSubmit={findAccount} className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <Field
            label="Team member email"
            type="email"
            required
            disabled={busy}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setAccount(null)
              setError('')
            }}
          />
        </div>
        <Button disabled={busy}>Find account</Button>
      </form>
      {account && (
        <form
          onSubmit={saveRole}
          className="space-y-3 border-t border-[#e7ece9] pt-4"
        >
          <p className="break-words text-sm font-semibold">
            {account.name} · {account.email}
          </p>
          <p className="text-xs text-[#68775f]">
            Current role: {roleLabels[account.role]}
          </p>
          {account.role === 'admin' ? (
            <p className="text-xs">
              Administrator roles cannot be changed here.
            </p>
          ) : (
            <>
              <Field
                label="Assign role"
                value={role}
                disabled={busy}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="warehouse_staff">Warehouse Staff</option>
                <option value="inventory_manager">Inventory Manager</option>
              </Field>
              <Button disabled={busy || role === account.role}>
                Save role
              </Button>
            </>
          )}
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-[#ad6148]">
          {error}
        </p>
      )}
    </section>
  )
}
