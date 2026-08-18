import { useId } from 'react'

export function ResponsiveTable({ children, label }) {
  const hintId = useId()

  return (
    <div>
      <p className="border-b border-slate-200 bg-himalaya-50 px-4 py-2 text-xs font-semibold text-himalaya-900 sm:hidden" id={hintId}>
        Scroll horizontally to view every column. The first column stays visible for context.
      </p>
      <div
        aria-describedby={hintId}
        aria-label={`${label} table`}
        className="admin-table-scroll overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-himalaya-700"
        role="region"
        tabIndex="0"
      >
        {children}
      </div>
    </div>
  )
}
