import { AppErrorBoundary } from './components/errors/AppErrorBoundary'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  )
}

export default App
