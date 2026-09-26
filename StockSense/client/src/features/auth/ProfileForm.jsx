import { useEffect, useState } from 'react'
import Field from '../../components/forms/Field'
import Button from '../../components/ui/Button'
import { httpRequest } from '../../lib/httpClient'
import { startSession } from './session'
import { useWorkspace } from '../../lib/workspaceContext'

export default function ProfileForm() {
  const { notify } = useWorkspace()
  const [form, setForm] = useState(null)
  const [originalEmail, setOriginalEmail] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    httpRequest('/auth/me', { signal: controller.signal })
      .then((user) => {
        if (controller.signal.aborted) return
        setForm({ ...user, currentPassword: '' })
        setOriginalEmail(user.email)
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message)
      })
    return () => controller.abort()
  }, [attempt])
  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const user = await httpRequest('/auth/me', {
        method: 'PATCH',
        body: {
          name: form.name,
          email: form.email,
          ...(form.email.trim().toLowerCase() !== originalEmail.toLowerCase()
            ? { currentPassword: form.currentPassword }
            : {}),
        },
      })
      setForm({ ...user, currentPassword: '' })
      setOriginalEmail(user.email)
      startSession(user)
      notify('Profile updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  if (!form)
    return (
      <div className="mt-5 space-y-3">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <Button
              onClick={() => {
                setError('')
                setAttempt((value) => value + 1)
              }}
            >
              Retry profile
            </Button>
          </>
        ) : (
          <p role="status">Loading profile...</p>
        )}
      </div>
    )
  return (
    <form
      onSubmit={save}
      className="mt-5 space-y-4 border-t border-[#e7ece9] pt-4"
    >
      <Field
        label="Full name"
        required
        maxLength={255}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Field
        label="Email address"
        type="email"
        required
        maxLength={255}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {form.email.trim().toLowerCase() !== originalEmail.toLowerCase() && (
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={form.currentPassword}
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
          hint="Confirm your password to change your email."
        />
      )}
      <p className="text-xs text-[#718174]">
        Role: {form.role.replaceAll('_', ' ')}
      </p>
      {error && (
        <p role="alert" className="text-sm text-[#ad6148]">
          {error}
        </p>
      )}
      <Button disabled={saving || !form.name.trim()}>
        {saving ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  )
}
