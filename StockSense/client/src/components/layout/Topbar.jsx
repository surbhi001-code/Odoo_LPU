import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Menu, ChevronRight, Bell, CircleHelp } from 'lucide-react'
import { useWorkspace } from '../../lib/workspaceContext'
import { stockStatus } from '../../lib/inventory'
import { apiClient } from '../../lib/apiClient'
const labels = {
  products: 'Products',
  operations: 'Operations',
  receipts: 'Receipts',
  deliveries: 'Delivery orders',
  transfers: 'Internal transfers',
  adjustments: 'Stock adjustments',
  warehouses: 'Warehouses',
  movements: 'Move history',
  profile: 'My profile',
}
export default function Topbar({ onMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, notify } = useWorkspace()
  const [search, setSearch] = useState('')
  const alerts =
    state?.products.filter((p) => stockStatus(p) !== 'In stock').length || 0
  return (
    <header className="h-18.5 py-0 px-8.5 border-b border-b-[#e7ece9] flex items-center justify-between bg-white gap-4.5 max-[1250px]:py-0 max-[1250px]:px-6 max-[1050px]:h-[65px] max-[800px]:py-0 max-[800px]:px-5 max-[520px]:h-[61px] max-[520px]:py-0 max-[520px]:px-[15px]">
      <div className="flex items-center gap-[13px] text-[11px] whitespace-nowrap [&>svg]:text-[#a7b1aa] [&_strong]:font-[550] max-[1050px]:gap-2 max-[520px]:text-[10px] max-[520px]:gap-[7px] max-[520px]:[&>svg]:hidden">
        <button
          className="icon-button border-0 border-transparent hidden items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48] max-[800px]:inline-flex"
          aria-label="Open navigation"
          onClick={onMenu}
        >
          <Menu size={21} />
        </button>
        <span className="text-[#8c9690] max-[520px]:hidden">Workspace</span>
        <ChevronRight size={14} />
        <strong>
          {labels[location.pathname.split('/').filter(Boolean).at(-1)] ||
            'Overview'}
        </strong>
      </div>
      <div className="flex items-center gap-4.5 max-[1250px]:gap-3 max-[800px]:gap-3.5 max-[520px]:gap-2">
        <form
          className="flex items-center gap-[9px] text-[#9aa49e] [&_input]:border-0 [&_input]:border-transparent [&_input]:w-45 [&_input]:text-[11px] [&_input]:py-[9px] [&_input]:px-0 [&_input]:bg-transparent [&_input::placeholder]:text-[#96a099] [&_kbd]:font-sans [&_kbd]:border [&_kbd]:border-[#e7ece9] [&_kbd]:rounded-[4px] [&_kbd]:py-0.5 [&_kbd]:px-[5px] [&_kbd]:text-[11px] max-[1250px]:[&_input]:w-[145px] max-[1050px]:[&_input]:w-[125px] max-[1050px]:[&_kbd]:hidden max-[800px]:hidden"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            navigate(`/products?q=${encodeURIComponent(search)}`)
            setSearch('')
          }}
        >
          <Search size={17} />
          <input
            aria-label="Search products or SKUs"
            placeholder="Search products, SKUs..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <kbd>↵</kbd>
        </form>
        <span className="text-[9px] text-[#5f7b6d] border-l border-l-[#e7ece9] pl-5 whitespace-nowrap [&_i]:inline-block [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:bg-[#709b77] [&_i]:rounded-full [&_i]:mr-1.5 max-[1250px]:hidden max-[800px]:block max-[800px]:border-0 max-[800px]:border-transparent max-[800px]:p-0 max-[800px]:text-[9px] max-[520px]:text-[8px]">
          <i />
          {apiClient.mode === 'json' ? 'Local workspace' : 'API connected'}
        </span>
        <button
          className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48] max-[800px]:hidden"
          aria-label="About this workspace"
          onClick={() =>
            notify(
              'Create a warehouse, add products, then receive or deliver stock. This preview saves data in your browser.',
            )
          }
        >
          <CircleHelp size={19} />
        </button>
        <Link
          className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48] relative"
          to="/products?stock=attention"
          aria-label={`${alerts} stock alerts`}
        >
          <Bell size={20} />
          {alerts > 0 && (
            <span className="absolute right-[5px] top-1 w-1.5 h-1.5 bg-[#e4a349] rounded-full border border-white" />
          )}
        </Link>
        <Link
          to="/auth/login"
          className="inline-flex min-h-8 items-center rounded-md border border-[#dfe6e0] px-3 text-[11px] font-semibold whitespace-nowrap text-[#286047] hover:bg-[#f0f6ee]"
        >
          Sign in
        </Link>
      </div>
    </header>
  )
}
