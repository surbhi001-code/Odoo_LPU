export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="flex justify-between items-center gap-4.5 mb-6.5 [&_p]:text-[12px] [&_p]:text-[#85918a] [&_p]:mt-1.5 [&_p]:leading-[1.7] max-[800px]:gap-[15px] max-[800px]:mb-5.5 max-[800px]:[&_h1]:text-[25px] max-[800px]:[&_p]:text-[11px] max-[800px]:[&_p]:max-w-67.5 max-[800px]:[&_.eyebrow]:text-[8px] max-[520px]:items-start max-[520px]:flex-wrap max-[520px]:[&_h1]:text-[26px] max-[520px]:[&_p]:max-w-full max-[520px]:[&_.page-actions]:w-full max-[520px]:[&_.page-actions]:mt-0 max-[520px]:[&_.button]:min-h-9">
      <div>
        {eyebrow && (
          <div className="eyebrow text-[9px] font-[650] tracking-[1.55px] text-[#7f9587] mb-[7px]">
            {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-actions flex items-center gap-3.5 flex-wrap">
        {children}
      </div>
    </header>
  )
}
