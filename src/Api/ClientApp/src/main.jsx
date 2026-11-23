import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const WindowPreview = import.meta.env.DEV ? React.lazy(() => import('./WindowPreview')) : null
const Root = WindowPreview && window.location.pathname === '/window-preview' ? WindowPreview : App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={null}><Root /></React.Suspense>
  </React.StrictMode>,
)

