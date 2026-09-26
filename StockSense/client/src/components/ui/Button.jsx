const variants = {
  primary:
    'bg-[#286047] text-white border-[#286047] shadow-[0_2px_3px_#26492d0c] hover:bg-[#184b35]',
  secondary: 'bg-white border-[#dfe6e0] text-[#526759] hover:bg-[#f4f7f3]',
  ghost: 'border-transparent bg-transparent text-[#225c48] hover:bg-[#f0f6ee]',
  danger: 'bg-[#fff4f1] text-[#a14b39] border-[#f1ddd5]',
}
export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      className={`button border rounded-[6px] min-h-[37px] py-[9px] px-[15px] inline-flex items-center justify-center gap-2 text-[11px] font-semibold leading-[1.4] whitespace-nowrap transition duration-150 active:translate-y-px ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
