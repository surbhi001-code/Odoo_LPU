import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
export default function Modal({
  title,
  description,
  onClose,
  children,
  wide = false,
}) {
  const ref = useRef(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      aria-labelledby={titleId}
      className={`m-auto overflow-y-auto rounded-[14px] border border-[#e4eadf] bg-white p-0 text-[#31472e] shadow-[0_24px_90px_#0b2a3040] max-w-[calc(100vw_-_32px)] max-h-[calc(100dvh_-_44px)] backdrop:bg-[#10291f6b] backdrop:backdrop-blur-[3px] ${wide ? 'w-[710px]' : 'w-[530px]'}`}
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="p-5.5 max-[520px]:p-[18px]">
        <header className="mb-5 flex items-start justify-between gap-4 [&_h2]:text-[20px] [&_h2]:tracking-[-0.6px] [&_p]:mt-1 [&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:text-[#718174] max-[520px]:[&_h2]:text-[19px]">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            className="icon-button border-0 border-transparent inline-flex items-center justify-center w-[31px] h-[31px] rounded-[6px] bg-transparent text-[#819187] p-0 hover:bg-[#ecf2ed] hover:text-[#225c48]"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
