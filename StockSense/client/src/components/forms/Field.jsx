import { useId } from 'react'

const controlClasses =
  'min-h-9.5 w-full rounded-md border border-[#dbe5dd] bg-white px-[11px] py-2 text-xs text-[#354b3e] placeholder:text-[#98a59c] focus:border-[#7da086] max-[520px]:text-base'

export default function Field({
  label,
  hint,
  children,
  className = '',
  ...props
}) {
  const id = useId()
  return (
    <label
      className="field flex flex-col gap-1.5 text-[11px] font-semibold"
      htmlFor={id}
    >
      <span className="text-[#53685a]">
        {label}
        {props.required && (
          <span className="font-normal text-[#b49a74]"> *</span>
        )}
      </span>
      {children ? (
        <select id={id} className={`${controlClasses} ${className}`} {...props}>
          {children}
        </select>
      ) : (
        <input
          id={id}
          className={`${controlClasses} ${className}`}
          {...props}
        />
      )}
      {hint && (
        <small className="text-[10px] leading-[1.6] font-normal text-[#99a58b]">
          {hint}
        </small>
      )}
    </label>
  )
}
