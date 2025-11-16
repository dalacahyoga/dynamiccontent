import React, { useEffect, useState, useRef } from 'react'
import { trackUserAccess } from '../utils/tracker'
import { getActiveContent, CONTENT_OPTIONS, getContentTitle, getContentFavicon } from '../utils/contentManager'
import { updateFavicon } from '../utils/faviconManager'
import TimnasContent from '../components/contents/TimnasContent'
import PulauSeribuContent from '../components/contents/PulauSeribuContent'
import GunungKawiContent from '../components/contents/GunungKawiContent'
import MalakaProjectContent from '../components/contents/MalakaProjectContent'
import CekingTerraceContent from '../components/contents/CekingTerraceContent'
import '../App.css'
import './Home.css'

function Home() {
  const [activeContent, setActiveContent] = useState(CONTENT_OPTIONS.NONE)
  const hasTracked = useRef(false)

  // Update title and favicon when content changes
  useEffect(() => {
    const title = getContentTitle(activeContent)
    const faviconEmoji = getContentFavicon(activeContent)
    
    document.title = title
    updateFavicon(faviconEmoji)
  }, [activeContent])

  useEffect(() => {
    // Only track once per component mount (prevents React StrictMode double render)
    if (!hasTracked.current) {
      trackUserAccess()
      hasTracked.current = true
    }
    
    // Get active content from localStorage
    const content = getActiveContent()
    setActiveContent(content)
  }, [])

  // Listen for storage changes to update content dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      const content = getActiveContent()
      setActiveContent(content)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom event from admin panel
    window.addEventListener('contentChanged', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contentChanged', handleStorageChange)
    }
  }, [])

  // Render content based on active content type
  const renderContent = () => {
    switch (activeContent) {
      case CONTENT_OPTIONS.TIMNAS:
        return <TimnasContent />
      case CONTENT_OPTIONS.PULAU_SERIBU:
        return <PulauSeribuContent />
      case CONTENT_OPTIONS.GUNUNG_KAWI:
        return <GunungKawiContent />
      case CONTENT_OPTIONS.MALAKA_PROJECT:
        return <MalakaProjectContent />
      case CONTENT_OPTIONS.CEKING_TERRACE:
        return <CekingTerraceContent />
      case CONTENT_OPTIONS.BOTH:
        return (
          <>
            <TimnasContent />
            <PulauSeribuContent />
          </>
        )
      case CONTENT_OPTIONS.NONE:
      default:
        return (
          <>
            <header className="header">
              <div className="container">
                <h1 className="title">🇮🇩 Indonesia</h1>
                <p className="subtitle">Keindahan dan Kebanggaan Nusantara</p>
              </div>
            </header>

            <main className="main">
              <div className="container">
                <section className="hero">
                  <div className="hero-content">
                    <h2>Selamat Datang di Portal Indonesia</h2>
                    <p>
                      Konten belum dipilih. Silakan login sebagai administrator untuk mengatur konten yang ditampilkan.
                    </p>
                  </div>
                </section>
              </div>
            </main>

            <footer className="footer">
              <div className="container">
                <p>&copy; 2024 Portal Indonesia. Semua hak dilindungi.</p>
              </div>
            </footer>
          </>
        )
    }
  }

  return (
    <div className="app">
      {renderContent()}
    </div>
  )
}

export default Home

