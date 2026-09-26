const tones = {
  green: 'border-[#b8d2b8] bg-[#e2f0e2] text-[#2f6b3b]',
  blue: 'border-[#bfd2e2] bg-[#e5eff7] text-[#3f6f92]',
  purple: 'border-[#d0c5e2] bg-[#ece7f5] text-[#6f5792]',
  amber: 'border-[#e5c995] bg-[#fbedd2] text-[#8a5b16]',
  gray: 'border-[#cfd8cb] bg-[#e9eee6] text-[#5f7059]',
  red: 'border-[#e4b9aa] bg-[#f7e5df] text-[#944b38]',
}
const colors = {
  Done: 'green',
  Ready: 'blue',
  Waiting: 'amber',
  Draft: 'gray',
  Canceled: 'gray',
  'In stock': 'green',
  'Low stock': 'amber',
  'Out of stock': 'red',
  Receipt: 'green',
  Delivery: 'blue',
  Transfer: 'purple',
  Adjustment: 'amber',
}
export default function Badge({ children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-[10px] leading-none font-semibold [&_i]:size-1.5 [&_i]:rounded-full [&_i]:bg-current ${tones[colors[children] || 'gray']}`}
    >
      <i />
      {children}
    </span>
  )
}
