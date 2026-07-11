import { useContext } from 'react'
import { PlatformContext } from './platformContext'

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error('usePlatform must be used inside PlatformProvider')
  }
  return context
}
