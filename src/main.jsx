import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

// StrictMode intentionally omitted: GSAP/ScrollTrigger pin setup is not double-effect safe in dev.
createRoot(document.getElementById('root')).render(<App />)
