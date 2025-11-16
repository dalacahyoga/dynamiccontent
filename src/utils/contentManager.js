// Content management utilities
export const CONTENT_OPTIONS = {
  NONE: 'none',
  TIMNAS: 'timnas',
  PULAU_SERIBU: 'pulau-seribu',
  GUNUNG_KAWI: 'gunung-kawi',
  MALAKA_PROJECT: 'malaka-project',
  CEKING_TERRACE: 'ceking-terrace',
  // BOTH option removed - only single content selection allowed
  BOTH: 'both' // Kept for backward compatibility, but not used in UI
}

export const getActiveContent = () => {
  try {
    const content = localStorage.getItem('activeContent')
    // Auto-convert old BOTH option to NONE
    if (content === CONTENT_OPTIONS.BOTH) {
      localStorage.setItem('activeContent', CONTENT_OPTIONS.NONE)
      return CONTENT_OPTIONS.NONE
    }
    return content || CONTENT_OPTIONS.NONE
  } catch (error) {
    console.error('Error getting active content:', error)
    return CONTENT_OPTIONS.NONE
  }
}

// Sync content from cloud (for auto-update across devices)
// Works even if JSONBin.io is not fully initialized (just needs bin ID)
export const syncContentFromCloud = async () => {
  try {
    const { getContentFromCloud, getBinId } = await import('./jsonbinStorage')
    
    // Check if content bin ID exists (even without API key, we can try to read)
    const contentBinId = localStorage.getItem('jsonbinContentBinId')
    const logsBinId = getBinId()
    
    // If no bin ID at all, can't sync
    if (!contentBinId && !logsBinId) {
      return null
    }
    
    const cloudContent = await getContentFromCloud()
    if (cloudContent) {
      const currentContent = getActiveContent()
      if (cloudContent !== currentContent) {
        // Update localStorage if cloud has different content
        localStorage.setItem('activeContent', cloudContent)
        return cloudContent
      }
    }
    
    return null
  } catch (error) {
    console.warn('Error syncing content from cloud:', error)
    return null
  }
}

export const setActiveContent = async (content) => {
  try {
    // Prevent setting BOTH option (only allow single content)
    if (content === CONTENT_OPTIONS.BOTH) {
      console.warn('BOTH option is no longer supported. Please select a single content.')
      return false
    }
    
    // Save to localStorage
    localStorage.setItem('activeContent', content)
    
    // Sync to cloud if JSONBin.io is initialized
    try {
      const { isInitialized, saveContentToCloud } = await import('./jsonbinStorage')
      if (isInitialized()) {
        // Sync in background (don't wait for it)
        saveContentToCloud(content).catch(err => {
          console.warn('Failed to sync content to cloud:', err)
        })
      }
    } catch (error) {
      // JSONBin not available, continue silently
    }
    
    return true
  } catch (error) {
    console.error('Error setting active content:', error)
    return false
  }
}

export const isContentActive = (contentType) => {
  const active = getActiveContent()
  if (active === CONTENT_OPTIONS.BOTH) {
    return true
  }
  if (active === CONTENT_OPTIONS.TIMNAS && contentType === 'timnas') {
    return true
  }
  if (active === CONTENT_OPTIONS.PULAU_SERIBU && contentType === 'pulau-seribu') {
    return true
  }
  if (active === CONTENT_OPTIONS.GUNUNG_KAWI && contentType === 'gunung-kawi') {
    return true
  }
  if (active === CONTENT_OPTIONS.MALAKA_PROJECT && contentType === 'malaka-project') {
    return true
  }
  if (active === CONTENT_OPTIONS.CEKING_TERRACE && contentType === 'ceking-terrace') {
    return true
  }
  return false
}

export const shouldShowInNavigation = (contentType) => {
  const active = getActiveContent()
  if (active === CONTENT_OPTIONS.NONE) {
    return false
  }
  // BOTH option removed - only single content allowed
  // if (active === CONTENT_OPTIONS.BOTH) {
  //   return true
  // }
  if (active === CONTENT_OPTIONS.TIMNAS && contentType === 'timnas') {
    return true
  }
  if (active === CONTENT_OPTIONS.PULAU_SERIBU && contentType === 'pulau-seribu') {
    return true
  }
  if (active === CONTENT_OPTIONS.GUNUNG_KAWI && contentType === 'gunung-kawi') {
    return true
  }
  if (active === CONTENT_OPTIONS.MALAKA_PROJECT && contentType === 'malaka-project') {
    return true
  }
  if (active === CONTENT_OPTIONS.CEKING_TERRACE && contentType === 'ceking-terrace') {
    return true
  }
  return false
}

export const getContentLabel = (contentType) => {
  switch (contentType) {
    case CONTENT_OPTIONS.NONE:
      return 'Tidak Ada Konten'
    case CONTENT_OPTIONS.TIMNAS:
      return 'Timnas Indonesia'
    case CONTENT_OPTIONS.PULAU_SERIBU:
      return 'Pulau Seribu'
    case CONTENT_OPTIONS.GUNUNG_KAWI:
      return 'Gunung Kawi Sebatu'
    case CONTENT_OPTIONS.MALAKA_PROJECT:
      return 'Malaka Project'
    case CONTENT_OPTIONS.CEKING_TERRACE:
      return 'Ceking Terrace'
    case CONTENT_OPTIONS.BOTH:
      // Fallback for old data - auto convert to NONE
      return 'Tidak Ada Konten (diubah dari pilihan lama)'
    default:
      return 'Tidak Diketahui'
  }
}

// Get page title based on content
export const getContentTitle = (contentType) => {
  switch (contentType) {
    case CONTENT_OPTIONS.NONE:
      return 'Portal Indonesia - Keindahan dan Kebanggaan Nusantara'
    case CONTENT_OPTIONS.TIMNAS:
      return 'Timnas Indonesia - Garuda Muda'
    case CONTENT_OPTIONS.PULAU_SERIBU:
      return 'Pulau Seribu - Surga Tropis di Utara Jakarta'
    case CONTENT_OPTIONS.GUNUNG_KAWI:
      return 'Gunung Kawi Sebatu - Pura Air di Gianyar, Bali'
    case CONTENT_OPTIONS.MALAKA_PROJECT:
      return 'Malaka Project - Inovasi dan Pembangunan Berkelanjutan'
    case CONTENT_OPTIONS.CEKING_TERRACE:
      return 'Ceking Terrace - Keindahan Terasering Ubud, Bali'
    case CONTENT_OPTIONS.BOTH:
      return 'Portal Indonesia - Keindahan dan Kebanggaan Nusantara'
    default:
      return 'Portal Indonesia - Keindahan dan Kebanggaan Nusantara'
  }
}

// Get favicon emoji based on content
export const getContentFavicon = (contentType) => {
  switch (contentType) {
    case CONTENT_OPTIONS.NONE:
      return '🇮🇩'
    case CONTENT_OPTIONS.TIMNAS:
      return '⚽'
    case CONTENT_OPTIONS.PULAU_SERIBU:
      return '🏝️'
    case CONTENT_OPTIONS.GUNUNG_KAWI:
      return '⛰️'
    case CONTENT_OPTIONS.MALAKA_PROJECT:
      return '🏗️'
    case CONTENT_OPTIONS.CEKING_TERRACE:
      return '🌾'
    case CONTENT_OPTIONS.BOTH:
      return '🇮🇩'
    default:
      return '🇮🇩'
  }
}
