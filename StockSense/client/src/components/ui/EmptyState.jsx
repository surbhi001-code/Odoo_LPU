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
      className={`empty-state flex items-center justify-center flex-col min-h-61 py-[35px] px-5 whitespace-normal text-center [&_h3]:text-[13px] [&_h3]:font-[650] [&_h3]:text-[#607456] [&_h3]:mb-[7px] [&_h3]:tracking-[-0.15px] [&_p]:text-[10px] [&_p]:text-[#98a28f] [&_p]:max-w-87.5 [&_p]:leading-[1.8] [&_p]:mb-3.5 [&_.text-link]:text-[10px] [&.compact]:min-h-[173px] [&.compact]:pt-[15px] [&.compact]:px-5 [&.compact]:pb-5 min-[1600px]:min-h-67.5 max-[520px]:py-7.5 max-[520px]:px-4.5 max-[520px]:min-h-60 max-[520px]:[&_h3]:text-[12px] max-[520px]:[&_p]:text-[10px] ${compact ? 'compact [&_.empty-icon]:h-[35px] [&_.empty-icon]:w-[35px] [&_.empty-icon]:rounded-[10px] [&_.empty-icon]:shadow-none [&_.empty-icon]:mt-0 [&_.empty-icon]:mx-0 [&_.empty-icon]:mb-[13px] [&_.empty-icon_svg]:w-[19px] [&_.empty-icon_svg]:h-[19px] [&_h3]:text-[11px] [&_p]:text-[9px] [&_p]:max-w-67.5 [&_p]:mb-0 min-[1600px]:[&.empty-state]:min-h-47.5' : ''}`}
    >
      <div className="empty-icon h-[53px] w-[53px] grid place-items-center border border-[#e7ede1] rounded-[15px] bg-[#f8faf5] text-[#a4b398] shadow-[0_0_0_6px_#fcfdfb] mt-0 mx-0 mb-4.5 rotate-[-5deg] [&_svg]:rotate-[5deg]">
        <Icon size={25} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  )
}
