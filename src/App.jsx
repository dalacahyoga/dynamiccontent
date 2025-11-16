import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import TimnasIndonesia from './pages/TimnasIndonesia'
import PulauSeribu from './pages/PulauSeribu'
import Login from './pages/Admin/Login'
import Dashboard from './pages/Admin/Dashboard'
import { shouldShowInNavigation } from './utils/contentManager'
import './App.css'

function App() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/administrator')
  const [showTimnas, setShowTimnas] = useState(false)
  const [showPulauSeribu, setShowPulauSeribu] = useState(false)

  useEffect(() => {
    setShowTimnas(shouldShowInNavigation('timnas'))
    setShowPulauSeribu(shouldShowInNavigation('pulau-seribu'))

    const handleStorageChange = () => {
      setShowTimnas(shouldShowInNavigation('timnas'))
      setShowPulauSeribu(shouldShowInNavigation('pulau-seribu'))
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('contentChanged', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contentChanged', handleStorageChange)
    }
  }, [])

  return (
    <>
      {!isAdminPage && location.pathname !== '/' && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        {showTimnas ? (
          <Route path="/timnas-indonesia" element={<TimnasIndonesia />} />
        ) : (
          <Route path="/timnas-indonesia" element={<Navigate to="/" replace />} />
        )}
        {showPulauSeribu ? (
          <Route path="/pulau-seribu" element={<PulauSeribu />} />
        ) : (
          <Route path="/pulau-seribu" element={<Navigate to="/" replace />} />
        )}
        <Route path="/administrator" element={<Login />} />
        <Route path="/administrator/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
