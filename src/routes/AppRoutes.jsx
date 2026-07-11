import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { AdminLayout } from '../components/layout/AdminLayout'
import { Layout } from '../components/layout/Layout'

function lazyNamed(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })))
}

const About = lazyNamed(() => import('../pages/About'), 'About')
const Activities = lazyNamed(() => import('../pages/Activities'), 'Activities')
const ActivityDetails = lazyNamed(() => import('../pages/ActivityDetails'), 'ActivityDetails')
const AdminDashboard = lazyNamed(() => import('../pages/AdminDashboard'), 'AdminDashboard')
const Booking = lazyNamed(() => import('../pages/Booking'), 'Booking')
const BookingSuccess = lazyNamed(() => import('../pages/BookingSuccess'), 'BookingSuccess')
const Compare = lazyNamed(() => import('../pages/Compare'), 'Compare')
const Contact = lazyNamed(() => import('../pages/Contact'), 'Contact')
const Home = lazyNamed(() => import('../pages/Home'), 'Home')
const CancellationPolicy = lazyNamed(
  () => import('../pages/LegalPages'),
  'CancellationPolicy',
)
const PrivacyPolicy = lazyNamed(() => import('../pages/LegalPages'), 'PrivacyPolicy')
const Terms = lazyNamed(() => import('../pages/LegalPages'), 'Terms')
const Login = lazyNamed(() => import('../pages/Login'), 'Login')
const NotFound = lazyNamed(() => import('../pages/NotFound'), 'NotFound')
const OperatorProfile = lazyNamed(() => import('../pages/OperatorProfile'), 'OperatorProfile')
const Register = lazyNamed(() => import('../pages/Register'), 'Register')
const Safety = lazyNamed(() => import('../pages/Safety'), 'Safety')
const TravelGuide = lazyNamed(() => import('../pages/TravelGuide'), 'TravelGuide')
const UserBookings = lazyNamed(() => import('../pages/UserBookings'), 'UserBookings')
const UserDashboard = lazyNamed(() => import('../pages/UserDashboard'), 'UserDashboard')
const UserProfile = lazyNamed(() => import('../pages/UserProfile'), 'UserProfile')

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route element={<Activities />} path="activities" />
          <Route element={<ActivityDetails />} path="activities/:id" />
          <Route element={<Compare />} path="compare" />
          <Route element={<OperatorProfile />} path="operators/:id" />
          <Route
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Booking />
              </ProtectedRoute>
            }
            path="booking/:id"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <BookingSuccess />
              </ProtectedRoute>
            }
            path="booking-success"
          />
          <Route element={<Login />} path="login" />
          <Route element={<Register />} path="register" />
          <Route
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
            path="user/dashboard"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserBookings />
              </ProtectedRoute>
            }
            path="user/bookings"
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserProfile />
              </ProtectedRoute>
            }
            path="user/profile"
          />
          <Route element={<About />} path="about" />
          <Route element={<Safety />} path="safety" />
          <Route element={<TravelGuide />} path="travel-guide" />
          <Route element={<Contact />} path="contact" />
          <Route element={<PrivacyPolicy />} path="privacy-policy" />
          <Route element={<Terms />} path="terms" />
          <Route element={<CancellationPolicy />} path="cancellation-policy" />
          <Route element={<NotFound />} path="not-found" />
          <Route element={<Navigate replace to="/not-found" />} path="*" />
        </Route>
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
          path="admin"
        >
          <Route index element={<AdminDashboard section="dashboard" />} />
          <Route element={<AdminDashboard section="activities" />} path="activities" />
          <Route element={<AdminDashboard section="operators" />} path="operators" />
          <Route element={<AdminDashboard section="prices" />} path="prices" />
          <Route element={<AdminDashboard section="bookings" />} path="bookings" />
          <Route element={<AdminDashboard section="reviews" />} path="reviews" />
          <Route element={<AdminDashboard section="users" />} path="users" />
          <Route element={<AdminDashboard section="support" />} path="support" />
          <Route element={<AdminDashboard section="analytics" />} path="analytics" />
          <Route element={<AdminDashboard section="settings" />} path="settings" />
          <Route element={<Navigate replace to="/admin" />} path="*" />
        </Route>
      </Routes>
    </Suspense>
  )
}

function RouteLoading() {
  return (
    <div
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-slate-50 px-4 text-sm font-semibold text-slate-600"
      role="status"
    >
      Loading...
    </div>
  )
}
