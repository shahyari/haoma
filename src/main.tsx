import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applySettings, loadSettings } from './settings/settings'

// Apply display settings before the first paint to avoid a flash.
applySettings(loadSettings(), window.matchMedia('(prefers-color-scheme: dark)').matches)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
