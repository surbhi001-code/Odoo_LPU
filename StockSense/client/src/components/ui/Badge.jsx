const tones = {
  green: 'bg-[#edf5e8] text-[#6a9259]',
  blue: 'bg-[#ecf3fb] text-[#719bbd]',
  purple: 'bg-[#f1edf9] text-[#9d84be]',
  amber: 'bg-[#fdf4e6] text-[#bc9857]',
  gray: 'bg-[#f0f3ed] text-[#8d9c7f]',
  red: 'bg-[#fcf0eb] text-[#c1816a]',
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
      className={`inline-flex gap-[5px] items-center py-1 px-[7px] rounded-[5px] text-[9px] font-medium whitespace-nowrap [&_i]:w-1 [&_i]:h-1 [&_i]:rounded-full [&_i]:bg-current ${tones[colors[children] || 'gray']}`}
    >
      <i />
      {children}
    </span>
  )
}
