import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Button from '../ui/Button'
import { useWorkspace } from '../../lib/workspaceContext'
export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { state, error, reload } = useWorkspace()
  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="ml-60 min-h-screen flex flex-col max-[1250px]:ml-[215px] max-[800px]:ml-0">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main
          id="main-content"
          className="pt-[31px] px-8.5 pb-5.5 flex-1 w-full max-w-425 m-auto min-[1600px]:pt-10 max-[1250px]:pt-[27px] max-[1250px]:px-6 max-[1250px]:pb-5.5 max-[800px]:py-[25px] max-[800px]:px-5 max-[520px]:py-6 max-[520px]:px-[15px]"
        >
          {error ? (
            <div
              className="py-22.5 px-6 text-center text-[#819576] flex items-center flex-col gap-4.5 [&_p]:text-[13px] [&_p]:max-w-137.5 [&_p]:leading-[1.8]"
              role="alert"
            >
              <AlertCircle size={30} />
              <h2>We couldn’t load your workspace</h2>
              <p>{error}</p>
              <Button onClick={reload}>Try again</Button>
            </div>
          ) : !state ? (
            <div
              className="py-22.5 px-6 text-center text-[#819576] flex items-center flex-col gap-4.5"
              role="status"
            >
              <span className="w-[25px] h-[25px] border-[2px] border-[#e1eadb] border-t-[#61894a] rounded-full animate-spin" />
              Loading your workspace…
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="flex justify-between gap-[15px] pt-0 px-8.5 pb-5 text-[8px] text-[#a5afa0] [&_i]:not-italic [&_i]:my-0 [&_i]:mx-[7px] max-[1250px]:px-6 max-[800px]:pt-0 max-[800px]:px-5 max-[800px]:pb-5 max-[520px]:pt-0 max-[520px]:px-[15px] max-[520px]:pb-4.5 max-[520px]:text-[8px] max-[520px]:[&>span:last-child]:hidden">
          <span>
            StockSense <i>·</i> A place for everything.
          </span>
          <span>Inventory management, simplified.</span>
        </footer>
      </div>
    </div>
  )
}
