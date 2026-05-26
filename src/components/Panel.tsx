import { useState } from 'react'
import { Info } from 'lucide-react'

export function Panel({
  title,
  action,
  children,
  className = '',
  showInfo = false,
  infoTip,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  showInfo?: boolean
  infoTip?: string
}) {
  const [tipVisible, setTipVisible] = useState(false)

  return (
    <section className={`panel ${className}`}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            {showInfo ? (
              <div
                className="relative"
                onMouseEnter={() => setTipVisible(true)}
                onMouseLeave={() => setTipVisible(false)}
                onFocus={() => setTipVisible(true)}
                onBlur={() => setTipVisible(false)}
              >
                <Info
                  className="h-4 w-4 cursor-help text-slate-400 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded"
                  tabIndex={0}
                  aria-describedby={infoTip ? 'panel-tip' : undefined}
                />
                {infoTip && tipVisible && (
                  <div
                    id="panel-tip"
                    className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600 shadow-lg"
                    role="tooltip"
                  >
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
                    {infoTip}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}
