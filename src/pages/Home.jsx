import React, { useEffect, useState, useRef } from 'react'
import { trackUserAccess } from '../utils/tracker'
import { getActiveContent, CONTENT_OPTIONS, getContentTitle, getContentFavicon, syncContentFromCloud } from '../utils/contentManager'
import { updateFavicon } from '../utils/faviconManager'
import PulauPariContent from '../components/contents/PulauPariContent'
import GunungKawiContent from '../components/contents/GunungKawiContent'
import CekingTerraceContent from '../components/contents/CekingTerraceContent'
import WelcomeContent from '../components/contents/WelcomeContent'
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

    // Get active content from cache
    const content = getActiveContent()
    setActiveContent(content)

    // Sync the latest active content from Supabase (shared across devices)
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
      case CONTENT_OPTIONS.PULAU_PARI:
        return <PulauPariContent />
      case CONTENT_OPTIONS.GUNUNG_KAWI:
        return <GunungKawiContent />
      case CONTENT_OPTIONS.CEKING_TERRACE:
        return <CekingTerraceContent />
      case CONTENT_OPTIONS.NONE:
      default:
        return <WelcomeContent />
    }
  }

  return (
    <div className="app">
      {renderContent()}
    </div>
  )
}

export default Home

