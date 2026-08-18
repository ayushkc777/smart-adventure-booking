export function FormStatus({ children, error = false, className = '' }) {
  if (!children) return null

  return (
    <p
      aria-live={error ? 'assertive' : 'polite'}
      className={`rounded-xl px-3 py-2 text-sm font-semibold ${
        error ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
      } ${className}`}
      role={error ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
