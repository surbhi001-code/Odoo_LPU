export default function PageHeader({ title, children }) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4 [&_h1]:text-[26px] max-[800px]:mb-3.5 max-[800px]:gap-[15px] max-[800px]:[&_h1]:text-[24px] max-[520px]:flex-wrap max-[520px]:items-start max-[520px]:[&_h1]:text-[24px] max-[520px]:[&_.page-actions]:w-full max-[520px]:[&_.page-actions]:mt-0 max-[520px]:[&_.button]:min-h-9">
      <h1>{title}</h1>
      <div className="page-actions flex items-center gap-3.5 flex-wrap">
        {children}
      </div>
    </header>
  )
}
