import { useEffect, useRef } from 'react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useDrawerFocus(isOpen, setIsOpen) {
  const drawerRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const drawer = drawerRef.current
    const focusableElements = () => [...(drawer?.querySelectorAll(focusableSelector) ?? [])]

    document.body.style.overflow = 'hidden'
    focusableElements()[0]?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key !== 'Tab') return
      const elements = focusableElements()
      if (!elements.length) return
      const first = elements[0]
      const last = elements.at(-1)

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [isOpen, setIsOpen])

  return { drawerRef, triggerRef }
}
