import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Design2 from './marketing/Design2.tsx'
import DemoPage from './marketing/DemoPage.tsx'
import Hub from './Hub.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/pulse" element={<Design2 />} />
        <Route path="/pulse/demo" element={<DemoPage />} />
        <Route path="/pulse/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
