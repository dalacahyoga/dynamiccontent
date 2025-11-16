import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { shouldShowInNavigation } from '../utils/contentManager'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
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
    <nav className="navigation">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            🇮🇩 Indonesia
          </Link>
          <div className="nav-links">
            {showTimnas && (
              <Link 
                to="/timnas-indonesia" 
                className={location.pathname === '/timnas-indonesia' ? 'nav-link active' : 'nav-link'}
              >
                Timnas Indonesia
              </Link>
            )}
            {showPulauSeribu && (
              <Link 
                to="/pulau-seribu" 
                className={location.pathname === '/pulau-seribu' ? 'nav-link active' : 'nav-link'}
              >
                Pulau Seribu
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

