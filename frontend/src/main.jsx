import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/Common/ErrorBoundary.jsx'
import { LoadingScreen } from './components/Common/LoadingScreen.jsx' // Verify path

// Logic: Use lazy import to isolate App.jsx crashes
const App = lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{ color: 'white' }}>Loading App (Suspense)...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
