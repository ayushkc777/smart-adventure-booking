import { LockKeyhole } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation()
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
    const dashboardPath = currentUser.role === 'admin' ? '/admin' : '/user/dashboard'

    return (
      <section className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-16">
        <Card className="max-w-md p-8 text-center">
          <LockKeyhole aria-hidden="true" className="mx-auto text-rhododendron-700" size={48} />
          <h1 className="mt-5 text-3xl font-bold text-slate-950">Access denied</h1>
          <p className="mt-3 text-slate-600">
            Your account does not have permission to view this page.
          </p>
          <Button className="mt-6" to={dashboardPath} variant="accent">
            Go to dashboard
          </Button>
        </Card>
      </section>
    )
  }

  return children
}
