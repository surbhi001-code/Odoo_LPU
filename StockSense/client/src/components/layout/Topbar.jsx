import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CircleHelp, LogOut, Menu, UserRound } from 'lucide-react'
import { useWorkspace } from '../../lib/workspaceContext'
import { stockStatus } from '../../lib/inventory'
import { endSession, useSession } from '../../features/auth/session'

const iconButton =
  'flex size-9 items-center justify-center rounded-lg text-[#829288] transition hover:bg-[#f0f5ee] hover:text-[#31583e]'

export default function Topbar({ onMenu, menuOpen }) {
  const navigate = useNavigate()
  const { state, notify } = useWorkspace()
  const session = useSession()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const alerts =
    state?.products.filter((p) => stockStatus(p) !== 'In stock').length || 0

  useEffect(() => {
    if (!profileOpen) return
    menuRef.current?.querySelector('[role="menuitem"]')?.focus()
    const dismiss = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [profileOpen])

  function navigateMenu(event) {
    if (event.key === 'Tab') {
      setProfileOpen(false)
      return
    }
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')]
    const index = items.indexOf(document.activeElement)
    const target = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key]
    if (target !== undefined) {
      event.preventDefault()
      items[target].focus()
    }
  }

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-end gap-3 border-b border-[#e7ece9] bg-white px-8.5 max-[1250px]:px-6 max-[800px]:h-[60px] max-[800px]:px-4">
      <button
        type="button"
        className={`${iconButton} mr-auto hidden max-[800px]:flex`}
        aria-label="Open navigation"
        aria-controls="sidebar-navigation"
        aria-expanded={menuOpen}
        onClick={onMenu}
      >
        <Menu size={21} />
      </button>
      <button
        type="button"
        className={iconButton}
        aria-label="Help"
        title="Help"
        onClick={() =>
          notify(
            'Start with a warehouse and products, then create a receipt. Use sidebar search to find products, operations, warehouses, or pages.',
          )
        }
      >
        <CircleHelp size={20} strokeWidth={1.7} />
      </button>
      <Link
        to="/products?stock=attention"
        className={`${iconButton} relative`}
        aria-label={`Notifications: ${alerts} stock alerts`}
        title="Stock notifications"
      >
        <Bell size={20} strokeWidth={1.7} />
        {alerts > 0 && (
          <span className="absolute top-1 right-1 size-1.5 rounded-full border border-white bg-[#dea34f]" />
        )}
      </Link>
      <div
        className="relative ml-1 border-l border-[#e9eee7] pl-4"
        ref={profileRef}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          aria-controls="profile-menu"
          title="My account"
          onClick={() => setProfileOpen(!profileOpen)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setProfileOpen(true)
            }
          }}
          className="flex size-9 items-center justify-center rounded-full border border-[#dce7d3] bg-[#edf4e6] text-[#66834e] transition hover:bg-[#e2edda]"
        >
          <UserRound size={19} strokeWidth={1.7} />
        </button>
        {profileOpen && (
          <div className="absolute top-12 right-0 z-30 w-60 rounded-xl border border-[#e1e8dc] bg-white p-1.5 shadow-[0_12px_35px_#153a251a]">
            <div className="border-b border-[#edf1e8] px-3 py-3">
              <p className="truncate text-xs font-semibold text-[#344e3a]">
                {session?.name || 'My account'}
              </p>
              <p className="mt-1 truncate text-[11px] text-[#8a9981]">
                {session?.email}
              </p>
            </div>
            <div
              id="profile-menu"
              ref={menuRef}
              role="menu"
              aria-label="Profile actions"
              onKeyDown={navigateMenu}
              className="pt-1"
            >
              <Link
                role="menuitem"
                tabIndex={-1}
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-xs text-[#647957] hover:bg-[#f3f7ee] focus:bg-[#f3f7ee]"
              >
                <UserRound size={16} />
                My profile
              </Link>
              <button
                role="menuitem"
                tabIndex={-1}
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  endSession()
                  navigate('/auth/login', { replace: true })
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-xs text-[#916c52] hover:bg-[#faf5ef] focus:bg-[#faf5ef]"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
