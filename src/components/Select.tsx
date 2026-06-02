import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface SelectProps<T extends string> {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
  format?: (value: T) => string
  compact?: boolean
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  format,
  compact = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayValue = format ? format(value) : value === 'all' ? '全部' : value

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={clsx('relative', compact ? 'min-w-[130px]' : 'min-w-[150px]')}>
      <span
        className={clsx(
          'block text-xs font-semibold text-slate-500',
          compact ? 'mb-1' : 'mb-2',
        )}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          'flex w-full items-center justify-between rounded border bg-white text-left text-sm text-slate-700 outline-none transition',
          'hover:border-emerald-300 hover:shadow-sm',
          open
            ? 'border-emerald-400 shadow-md ring-1 ring-emerald-100'
            : 'border-slate-200',
          compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
        )}
      >
        <span className="truncate pr-2">{displayValue}</span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          {options.map((option) => {
            const label = format ? format(option) : option === 'all' ? '全部' : option
            const isActive = option === value
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={clsx(
                  'block w-full px-3 py-2 text-left text-sm transition',
                  isActive
                    ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
