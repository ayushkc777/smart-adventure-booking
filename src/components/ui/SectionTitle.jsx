import { cn } from '../../utils/cn'

export function SectionTitle({ action, description, eyebrow, title, tone = 'light' }) {
  const isDark = tone === 'dark'

  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={cn(
              'mb-3 text-xs font-bold uppercase tracking-[0.18em]',
              isDark ? 'text-rhododendron-300' : 'text-rhododendron-700',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            'max-w-4xl text-3xl font-bold leading-tight md:text-4xl',
            isDark ? 'text-white' : 'text-slate-950',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'mt-4 max-w-3xl text-sm leading-7 md:text-base',
              isDark ? 'text-slate-200' : 'text-slate-600',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
