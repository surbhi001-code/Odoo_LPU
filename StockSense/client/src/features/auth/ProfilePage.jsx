import { useNavigate } from 'react-router-dom'
import { UserRound, Download, LogOut } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import { useWorkspace } from '../../lib/workspaceContext'
import { endSession, useSession } from './session'
import ProfileForm from './ProfileForm'
import TeamAccess from './TeamAccess'
import { roleLabels, roleDescriptions } from './roles'
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
      <PageHeader title="My profile" />
      <section className="max-w-185 overflow-hidden rounded-xl border border-[#dfe7e2] bg-white p-5.5 shadow-[0_3px_10px_#153a2508] max-[520px]:p-4.5">
        <div className="flex items-center gap-4 [&_p]:mt-1 [&_p]:text-[12px] [&_p]:text-[#65766b] max-[520px]:[&_h2]:text-[16px]">
          <span className="grid size-13 place-items-center rounded-full bg-[#e7f0e1] text-[#617f50]">
            <UserRound size={28} />
          </span>
          <div>
            <h2>{session.name}</h2>
            <p>{session.email}</p>
            <p className="font-semibold">
              {roleLabels[session.role] || 'Account'}
            </p>
          </div>
        </div>
        <ProfileForm />
        <p className="mt-4 text-xs leading-6 text-[#68775f]">
          {roleDescriptions[session.role]}
        </p>
        <div className="info-box mt-4 rounded-lg border border-[#dfe8d9] bg-[#f4f8f1] px-3.5 py-2.5 text-[11px] leading-[1.65] text-[#68775f] [&_a]:text-[#426c36] [&_a]:underline">
          Your account is authenticated by the server. Sign out when you finish
          using a shared device.
        </div>
        <div className="mt-4.5 border-t border-t-[#e7ece9] pt-4.5 [&_p]:mx-0 [&_p]:mt-1.5 [&_p]:mb-3.5 [&_p]:text-[12px] [&_p]:leading-[1.65] [&_p]:text-[#68786d]">
          <h3>Your workspace data</h3>
          <p>
            Export the server data currently loaded in your workspace as JSON.
          </p>
          <Button variant="secondary" onClick={exportWorkspace}>
            <Download size={16} />
            Export workspace JSON
          </Button>
        </div>
        <div className="mt-4.5 border-t border-t-[#e7ece9] pt-4.5 [&_p]:mx-0 [&_p]:mt-1.5 [&_p]:mb-3.5 [&_p]:text-[12px] [&_p]:leading-[1.65] [&_p]:text-[#68786d]">
          <h3>Your session</h3>
          <p>
            Sign out to return to the login screen. Your inventory data remains
            saved on the server.
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
      {session.role === 'admin' && <TeamAccess />}
    </>
  )
}
