import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { WorkspaceContext } from '../lib/workspaceContext'
import { useSession } from '../features/auth/session'

export default function Providers({ children }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const session = useSession()
  const activeRequest = useRef(null)
  const [loadedFor, setLoadedFor] = useState(null)
  const reload = useCallback(async () => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    if (!session) return
    setError('')
    try {
      const next = await apiClient.getWorkspace(controller.signal)
      if (controller.signal.aborted) return
      setState(next)
      setLoadedFor(session)
      return next
    } catch (err) {
      if (controller.signal.aborted) return
      setError(
        err.status === 401
          ? 'Your session has expired. Please sign in again.'
          : err.message,
      )
      setLoadedFor(session)
    }
  }, [session])
  useEffect(() => {
    reload()
    return () => activeRequest.current?.abort()
  }, [reload])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 4500)
    return () => clearTimeout(timer)
  }, [toast])
  const mutate = async (action, payload, message) => {
    await apiClient.command(action, payload)
    // A refresh failure must not make a successful write look unsaved.
    const next = await reload()
    setToast(message || 'Changes saved')
    return next
  }
  return (
    <WorkspaceContext.Provider
      value={{
        state: loadedFor === session && session ? state : null,
        error: loadedFor === session ? error : '',
        reload,
        mutate,
        notify: setToast,
        canManage: ['admin', 'inventory_manager'].includes(session?.role),
      }}
    >
      {children}
      {toast && (
        <div
          className="fixed bottom-6 left-[calc(50%_+_120px)] -translate-x-1/2 bg-white shadow-[0_6px_35px_#1d3e2526] border border-[#d7e6cd] py-[13px] px-4 flex items-center gap-2.5 rounded-[8px] text-[12px] z-80 max-w-[calc(100vw_-_32px)] min-w-60 [&_button]:bg-transparent [&_button]:border-0 [&_button]:border-transparent [&_button]:text-[21px] [&_button]:text-[#a0ac97] [&_button]:py-0 [&_button]:pr-0 [&_button]:pl-3 [&_button]:ml-auto max-[1250px]:left-[calc(50%_+_107px)] max-[800px]:left-1/2 max-[520px]:text-[11px] max-[520px]:min-w-70"
          role="status"
        >
          <span className="w-[23px] h-[23px] grid place-items-center bg-[#e4f0d9] text-[#699a46] rounded-full shrink-0">
            ✓
          </span>
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast('')}
          >
            ×
          </button>
        </div>
      )}
    </WorkspaceContext.Provider>
  )
}
