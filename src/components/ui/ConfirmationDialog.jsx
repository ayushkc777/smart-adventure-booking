import { useEffect, useId, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export function ConfirmationDialog({ confirmLabel = 'Confirm', message, onCancel, onConfirm, title }) {
  const descriptionId = useId()
  const titleId = useId()
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancelRef.current()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 px-4 py-8">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        role="alertdialog"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle aria-hidden="true" size={22} />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-950" id={titleId}>{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600" id={descriptionId}>{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} variant="secondary">Cancel</Button>
          <Button autoFocus onClick={onConfirm} variant="danger">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
