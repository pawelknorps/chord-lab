import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import './circle-chords-0.1.0/src/i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
