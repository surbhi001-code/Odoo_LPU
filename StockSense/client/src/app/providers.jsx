import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { WorkspaceContext } from '../lib/workspaceContext'

export default function Providers({ children }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const reload = useCallback(async () => {
    setError('')
    try {
      setState(await apiClient.getWorkspace())
    } catch (err) {
      setError(err.message)
    }
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 4500)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    const sync = (event) => {
      if (event.key === 'stocksense.workspace.v1') reload()
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [reload])
  const mutate = async (action, payload, message) => {
    const next = await apiClient.command(action, payload)
    setState(next)
    setToast(message || 'Changes saved')
    return next
  }
  return (
    <WorkspaceContext.Provider
      value={{ state, error, reload, mutate, notify: setToast }}
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
