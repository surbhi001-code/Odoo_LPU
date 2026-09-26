import { NavLink, Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { navigationGroups } from './navigation'

export default function Sidebar({ open, onClose, onSearch }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-39 bg-[#0f291e88] min-[801px]:hidden"
          onClick={onClose}
        />
      )}
      <aside
        id="sidebar-navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto bg-[#143b32] px-[17px] pt-7 pb-5 text-[#d8e5df] max-[1250px]:w-[215px] max-[1250px]:px-[13px] max-[800px]:w-60 max-[800px]:transition-[translate,visibility] max-[800px]:duration-200 ${open ? 'max-[800px]:visible max-[800px]:translate-x-0' : 'max-[800px]:invisible max-[800px]:-translate-x-full'}`}
      >
        <Link
          to="/"
          onClick={onClose}
          className="mx-2 mb-8 flex items-center gap-2.5 text-[23px] font-extrabold tracking-[-0.7px] text-white"
        >
          <img
            src={`${import.meta.env.BASE_URL}stocksense.svg`}
            alt=""
            className="size-9"
          />
          <span>
            Stock<span className="font-medium">Sense</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="absolute top-2 right-2 hidden size-7 items-center justify-center rounded-md text-[#aac7ad] hover:bg-white/10 max-[800px]:flex"
        >
          <X size={17} />
        </button>

        <button
          type="button"
          onClick={() => {
            onClose()
            onSearch()
          }}
          aria-label="Open global search"
          aria-keyshortcuts="Control+k Meta+k"
          className="mb-7 flex min-h-10 items-center gap-2.5 rounded-lg border border-[#426154] bg-[#204538] px-3 text-left text-[#b7cbbd] transition hover:border-[#7b9d72] hover:bg-[#294e3e] focus-visible:outline-[#c6ee8a]"
        >
          <Search size={16} strokeWidth={1.7} />
          <span className="min-w-0 flex-1 truncate text-[11px]">Search anything...</span>
          <kbd className="rounded border border-[#52705c] px-1 py-0.5 font-sans text-[9px] text-[#92ae9a]">
            Ctrl K
          </kbd>
        </button>

        <nav aria-label="Main navigation">
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mx-[13px] mb-2.5 text-[9px] font-semibold tracking-[1.65px] text-[#89a698]">
                {group.label}
              </p>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  end={to === '/'}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `mb-1 flex min-h-[42px] items-center gap-3 rounded-lg px-[13px] py-2.5 text-xs transition ${isActive ? 'bg-[#c6ee8a] font-semibold text-[#25442e] shadow-[0_3px_9px_#0d2c3120]' : 'font-normal text-[#b2c7bc] hover:bg-[#254b3f] hover:text-white'}`
                  }
                >
                  <Icon size={18} strokeWidth={1.7} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
