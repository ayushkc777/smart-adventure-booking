import { cn } from '../../utils/cn'

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

function initialsFor(name = '') {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'NA'

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ className, name, photo, size = 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-himalaya-100 font-bold text-himalaya-900 ring-1 ring-himalaya-200',
        sizes[size],
        className,
      )}
    >
      {photo ? (
        <img alt={`${name} profile`} className="h-full w-full object-cover" src={photo} />
      ) : (
        initialsFor(name)
      )}
    </span>
  )
}
