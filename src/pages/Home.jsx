import React, { useEffect, useState, useRef } from 'react'
import { trackUserAccess } from '../utils/tracker'
import { getActiveContent, CONTENT_OPTIONS, getContentTitle, getContentFavicon, syncContentFromCloud } from '../utils/contentManager'
import { updateFavicon } from '../utils/faviconManager'
import { isInitialized, initializeBin, initializeContentBin } from '../utils/jsonbinStorage'
import { autoLoadSharedConfig } from '../utils/sharedConfig'
import { getConfigApiKey, hasApiKey } from '../config/jsonbin'
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
    
    // Auto-load shared config if available (from device A setup)
    autoLoadSharedConfig()
    
    // Auto-initialize JSONBin.io if API key is available in config
    // This allows device B, C, etc to automatically setup without manual intervention
    const autoSetup = async () => {
      if (hasApiKey() && !isInitialized()) {
        try {
          const apiKey = getConfigApiKey()
          if (apiKey) {
            // Auto-initialize bins (silently, in background)
            await initializeBin(apiKey).catch(err => console.warn('Auto-init logs bin failed:', err))
            await initializeContentBin(apiKey).catch(err => console.warn('Auto-init content bin failed:', err))
            console.log('✅ JSONBin.io auto-initialized from config')
          }
        } catch (error) {
          console.warn('Auto-setup JSONBin.io failed:', error)
        }
      }
    }
    
    autoSetup()
    
    // Get active content from localStorage
    const content = getActiveContent()
    setActiveContent(content)
    
    // Always try to sync content from cloud (works even without API key if bin ID exists)
    syncContentFromCloud().then(newContent => {
      if (newContent) {
        setActiveContent(newContent)
      }
    })
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
    
    // Auto-sync content from cloud every 5 seconds
    // Works even without API key if content bin ID exists
    const contentSyncInterval = setInterval(async () => {
      const newContent = await syncContentFromCloud()
      if (newContent && newContent !== activeContent) {
        setActiveContent(newContent)
      }
    }, 5000) // Sync every 5 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contentChanged', handleStorageChange)
      if (contentSyncInterval) {
        clearInterval(contentSyncInterval)
      }
    }
  }, [activeContent])

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

