import { useId } from 'react'

const controlClasses =
  'min-h-10 w-full rounded-md border border-[#dfe7d8] bg-white px-[11px] py-2.5 text-xs placeholder:text-[#aab4a1] max-[520px]:text-base'

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
      className="field flex flex-col gap-2 text-[11px] font-medium"
      htmlFor={id}
    >
      <span className="text-[#697c60]">
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
