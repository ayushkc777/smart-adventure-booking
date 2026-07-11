import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ExperienceProvider } from './context/ExperienceContext.jsx'
import { PlatformProvider } from './context/PlatformContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlatformProvider>
          <ExperienceProvider>
            <App />
          </ExperienceProvider>
        </PlatformProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
