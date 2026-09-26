import { useNavigate } from 'react-router-dom'
import { UserRound, Download, LogOut } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import { useWorkspace } from '../../lib/workspaceContext'
import { endSession, useSession } from './session'
export default function ProfilePage() {
  const { state } = useWorkspace()
  const session = useSession()
  const navigate = useNavigate()
  function exportWorkspace() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'stocksense-workspace.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR SPACE"
        title="My profile"
        description="Your workspace and account, in one place."
      />
      <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502] max-w-185 p-7.5 max-[520px]:p-5.5">
        <div className="flex items-center gap-[17px] [&_p]:text-[12px] [&_p]:text-[#91a17f] [&_p]:mt-[7px] max-[520px]:[&_h2]:text-[16px]">
          <span className="h-15 w-15 grid place-items-center bg-[#e8f0de] text-[#7e9a66] rounded-full">
            <UserRound size={32} />
          </span>
          <div>
            <h2>{session.name}</h2>
            <p>{session.email}</p>
          </div>
        </div>
        <div className="info-box py-[13px] px-[15px] bg-[#f6f9f1] border border-[#e5eddc] text-[#82916f] rounded-[7px] text-[11px] leading-[1.8] mt-5 [&_a]:underline [&_a]:text-[#517a3d]">
          This is a local frontend session. Your password is not stored or
          verified. Account authentication and password reset will be connected
          with the backend.
        </div>
        <div className="border-t border-t-[#e7ece9] pt-[23px] mt-[23px] [&_p]:text-[12px] [&_p]:text-[#93a080] [&_p]:leading-[1.9] [&_p]:mt-[9px] [&_p]:mx-0 [&_p]:mb-[17px]">
          <h3>Your workspace data</h3>
          <p>
            Changes are saved in this browser. Export your JSON to keep a copy.
            Clearing browser storage removes local changes.
          </p>
          <Button variant="secondary" onClick={exportWorkspace}>
            <Download size={16} />
            Export workspace JSON
          </Button>
        </div>
        <div className="border-t border-t-[#e7ece9] pt-[23px] mt-[23px] [&_p]:text-[12px] [&_p]:text-[#93a080] [&_p]:leading-[1.9] [&_p]:mt-[9px] [&_p]:mx-0 [&_p]:mb-[17px]">
          <h3>Your session</h3>
          <p>
            Sign out to return to the login screen. Your inventory data stays
            saved in this browser.
          </p>
          <button
            type="button"
            onClick={() => {
              endSession()
              navigate('/auth/login', { replace: true })
            }}
            className="button border border-[#286047] rounded-[6px] min-h-[37px] py-[9px] px-[15px] inline-flex items-center justify-center gap-2 text-[11px] font-semibold leading-[1.4] whitespace-nowrap transition duration-150 active:translate-y-px bg-[#286047] text-white shadow-[0_2px_3px_#26492d0c] hover:bg-[#184b35]"
          >
            <LogOut size={16} />
            Sign out of workspace
          </button>
        </div>
      </section>
    </>
  )
}
