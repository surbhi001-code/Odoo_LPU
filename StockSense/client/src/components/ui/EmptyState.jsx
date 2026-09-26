import { PackageOpen } from 'lucide-react'
export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description,
  children,
  compact = false,
}) {
  return (
    <div
      className={`empty-state flex min-h-52 flex-col items-center justify-center px-5 py-7 whitespace-normal text-center [&_h3]:mb-1.5 [&_h3]:text-[14px] [&_h3]:font-[650] [&_h3]:tracking-[-0.15px] [&_h3]:text-[#4d654f] [&_p]:mb-3 [&_p]:max-w-87.5 [&_p]:text-[11px] [&_p]:leading-[1.65] [&_p]:text-[#7d8b82] [&_.text-link]:text-[11px] [&.compact]:min-h-[150px] [&.compact]:px-5 [&.compact]:py-4 max-[520px]:min-h-48 max-[520px]:px-4.5 max-[520px]:py-6 max-[520px]:[&_h3]:text-[13px] ${compact ? 'compact [&_.empty-icon]:h-[35px] [&_.empty-icon]:w-[35px] [&_.empty-icon]:rounded-[10px] [&_.empty-icon]:shadow-none [&_.empty-icon]:mt-0 [&_.empty-icon]:mx-0 [&_.empty-icon]:mb-2.5 [&_.empty-icon_svg]:w-[19px] [&_.empty-icon_svg]:h-[19px] [&_h3]:text-[12px] [&_p]:text-[10px] [&_p]:max-w-67.5 [&_p]:mb-0' : ''}`}
    >
      <div className="empty-icon mb-3.5 grid size-12 rotate-[-5deg] place-items-center rounded-[13px] border border-[#dfe8dc] bg-[#f6f9f4] text-[#8da082] shadow-[0_0_0_5px_#fafcf9] [&_svg]:rotate-[5deg]">
        <Icon size={25} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  )
}
