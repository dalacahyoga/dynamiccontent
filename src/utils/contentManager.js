// Content management utilities.
// The active content selection is shared across all visitors via the Supabase
// `content` table (single row, id = 1, data = { active: '<option>' }), with a
// localStorage cache so the site renders synchronously before the network call.
import { supabase, supabaseEnabled } from '../config/supabase'

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

const CACHE_KEY = 'activeContent'

export const getActiveContent = () => {
  try {
    const content = localStorage.getItem(CACHE_KEY)
    // Auto-convert old BOTH option to NONE
    if (content === CONTENT_OPTIONS.BOTH) {
      localStorage.setItem(CACHE_KEY, CONTENT_OPTIONS.NONE)
      return CONTENT_OPTIONS.NONE
    }
    return content || CONTENT_OPTIONS.NONE
  } catch (error) {
    console.error('Error getting active content:', error)
    return CONTENT_OPTIONS.NONE
  }
}

// Pull the latest active content from Supabase into the local cache. Returns the
// new value when it differs from the cached one, otherwise null. Safe to call
// when Supabase is not configured (resolves to null).
export const syncContentFromCloud = async () => {
  if (!supabaseEnabled) return null
  try {
    const { data, error } = await supabase
      .from('content').select('data').eq('id', 1).maybeSingle()
    if (error || !data?.data) return null
    const cloud = data.data.active
    if (!cloud) return null
    const current = getActiveContent()
    if (cloud !== current) {
      localStorage.setItem(CACHE_KEY, cloud)
      return cloud
    }
    return null
  } catch (error) {
    console.warn('Error syncing content from cloud:', error)
    return null
  }
}

// Preload content into the cache BEFORE the app renders (called from main.jsx).
export const preloadContent = async () => {
  await syncContentFromCloud()
}

export const setActiveContent = async (content) => {
  try {
    // Prevent setting BOTH option (only allow single content)
    if (content === CONTENT_OPTIONS.BOTH) {
      console.warn('BOTH option is no longer supported. Please select a single content.')
      return false
    }

    // Save to cache immediately so the UI updates instantly
    localStorage.setItem(CACHE_KEY, content)

    // Share across all visitors via Supabase
    if (supabaseEnabled) {
      const { error } = await supabase
        .from('content')
        .upsert({ id: 1, data: { active: content }, updated_at: new Date().toISOString() })
      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Error setting active content:', error)
    return false
  }
}

export const isContentActive = (contentType) => {
  const active = getActiveContent()
  if (active === CONTENT_OPTIONS.BOTH) return true
  return active === contentType
}

export const shouldShowInNavigation = (contentType) => {
  const active = getActiveContent()
  if (active === CONTENT_OPTIONS.NONE) return false
  return active === contentType
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
