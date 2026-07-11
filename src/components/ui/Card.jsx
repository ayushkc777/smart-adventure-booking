import { cn } from '../../utils/cn'

export function Card({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white shadow-[var(--shadow-premium)] transition duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
