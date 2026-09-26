import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  ChevronRight,
  X,
  Layers3,
  UserRound,
} from 'lucide-react'
const groups = [
  {
    label: 'WORKSPACE',
    items: [
      ['/', 'Overview', LayoutDashboard],
      ['/products', 'Products', Package],
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      ['/operations/receipts', 'Receipts', ArrowDownToLine],
      ['/operations/deliveries', 'Delivery orders', ArrowUpFromLine],
      ['/operations/transfers', 'Internal transfers', ArrowLeftRight],
      ['/operations/adjustments', 'Stock adjustments', SlidersHorizontal],
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      ['/movements', 'Move history', History],
      ['/warehouses', 'Warehouses', Warehouse],
    ],
  },
]
export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`hidden max-[800px]:[&.visible]:block max-[800px]:[&.visible]:fixed max-[800px]:[&.visible]:top-0 max-[800px]:[&.visible]:right-0 max-[800px]:[&.visible]:bottom-0 max-[800px]:[&.visible]:left-0 max-[800px]:[&.visible]:bg-[#0f291e88] max-[800px]:[&.visible]:z-39 ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside
        className={`overflow-y-auto w-60 bg-[#143b32] text-[#d8e5df] fixed top-0 right-auto bottom-0 left-0 z-40 flex flex-col pt-[29px] px-[17px] pb-0 max-[1250px]:w-[215px] max-[1250px]:px-[13px] max-[800px]:-translate-x-full max-[800px]:transition-transform max-[800px]:duration-200 max-[800px]:w-60 max-[800px]:[&.open]:translate-x-0 ${open ? 'open' : ''}`}
      >
        <Link
          className="brand flex items-center gap-2.5 font-sans text-[23px] font-extrabold tracking-[-0.7px] text-white mt-0 mx-[9px] mb-7.5 [&_img]:w-9 [&_img]:h-9 [&_small]:block [&_small]:font-sans [&_small]:text-[7.8px] [&_small]:font-medium [&_small]:tracking-[2.15px] [&_small]:text-[#a3b9ac] [&_small]:mt-1"
          to="/"
          onClick={onClose}
        >
          <img src={`${import.meta.env.BASE_URL}stocksense.svg`} alt="" />
          <span>
            Stock<span className="font-medium">Sense</span>
            <small>INVENTORY, IN SYNC.</small>
          </span>
        </Link>
        <button
          className="icon-button border-0 border-transparent hidden items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48] max-[800px]:flex max-[800px]:absolute max-[800px]:right-2.5 max-[800px]:top-[11px] max-[800px]:text-[#aac7ad]"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2.5 border border-[#436157] rounded-[8px] py-[13px] px-2.5 text-[11px] text-[#e2eee7] mb-[23px] [&_small]:block [&_small]:text-[#92afa1] [&_small]:text-[10px] [&_small]:mt-[5px]">
          <span className="bg-[#2c5245] w-7.5 h-8 grid place-items-center rounded-[7px] text-[#d0e2cd]">
            <Layers3 size={18} />
          </span>
          <div>
            Inventory workspace<small>Your central stock hub</small>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c6ee8a] ml-auto" />
        </div>
        <nav aria-label="Main navigation">
          {groups.map((group) => (
            <div
              className="mb-[25px] [&>p]:text-[9px] [&>p]:tracking-[1.65px] [&>p]:text-[#89a698] [&>p]:mt-0 [&>p]:mx-[13px] [&>p]:mb-2.5 [&>p]:font-semibold"
              key={group.label}
            >
              <p>{group.label}</p>
              {group.items.map(([path, label, Icon]) => (
                <NavLink
                  end={path === '/'}
                  to={path}
                  key={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 min-h-10.5 py-2.5 px-[13px] rounded-[7px] text-[12px] font-[450] text-[#b2c7bc] mb-1 transition duration-150 hover:bg-[#254b3f] hover:text-white [&.active]:bg-[#c6ee8a] [&.active]:text-[#25442e] [&.active]:font-bold [&.active]:shadow-[0_3px_9px_#0d2c3120] ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} strokeWidth={1.7} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="border border-[#3c5f50] rounded-[8px] py-3.5 px-[11px] text-[9.5px] text-[#cbdcce] mt-2 mx-0 mb-4.5 [&_small]:block [&_small]:mt-[7px] [&_small]:mr-0 [&_small]:mb-0 [&_small]:ml-3 [&_small]:text-[#8aa999] [&_small]:text-[9px]">
            <span className="live-dot w-1.5 h-1.5 bg-[#82af70] rounded-full inline-block mr-1.5" />{' '}
            Built for a clearer stockroom
            <small>Every product. Every movement.</small>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-[11px] border-t border-t-[#365448] py-[19px] px-0.5 text-[12px] font-semibold [&_small]:block [&_small]:mt-[5px] [&_small]:text-[#92ac9d] [&_small]:text-[10px] [&_small]:font-normal [&>svg]:ml-auto [&>svg]:text-[#a2baa9]"
            onClick={onClose}
          >
            <div className="h-8.5 w-8.5 rounded-full bg-[#406151] grid place-items-center text-[#d3e2bd]">
              <UserRound size={19} />
            </div>
            <div>
              My workspace<small>Local preview</small>
            </div>
            <ChevronRight size={16} />
          </Link>
        </div>
      </aside>
    </>
  )
}
