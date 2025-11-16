// Geocoding utilities for location names
// Using OpenStreetMap Nominatim API (free, no API key needed)

const CACHE_KEY = 'locationCache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Get location cache
const getLocationCache = () => {
  try {
    const cache = localStorage.getItem(CACHE_KEY)
    return cache ? JSON.parse(cache) : {}
  } catch {
    return {}
  }
}

// Save to cache
const saveToCache = (key, value) => {
  try {
    const cache = getLocationCache()
    cache[key] = {
      value,
      timestamp: Date.now()
    }
    // Keep only last 100 entries
    const entries = Object.entries(cache)
    if (entries.length > 100) {
      const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
      const newCache = Object.fromEntries(sorted.slice(0, 100))
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    }
  } catch {
    // Ignore cache errors
  }
}

// Get from cache
const getFromCache = (key) => {
  try {
    const cache = getLocationCache()
    const cached = cache[key]
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.value
    }
  } catch {
    // Ignore cache errors
  }
  return null
}

// Reverse geocoding: Convert lat/long to location name
export const getLocationName = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    return 'Tidak tersedia'
  }

  // Check cache first
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`
  const cached = getFromCache(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Portal Indonesia Website' // Required by Nominatim
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()
    
    // Extract location name
    let locationName = 'Unknown Location'
    
    if (data.address) {
      const addr = data.address
      // Try to get meaningful location name
      if (addr.city || addr.town || addr.village) {
        locationName = addr.city || addr.town || addr.village
        if (addr.state || addr.region) {
          locationName += `, ${addr.state || addr.region}`
        }
      } else if (addr.state || addr.region) {
        locationName = addr.state || addr.region
      } else if (addr.country) {
        locationName = addr.country
      } else {
        locationName = data.display_name?.split(',')[0] || 'Unknown Location'
      }
    } else if (data.display_name) {
      locationName = data.display_name.split(',')[0]
    }

    // Save to cache
    saveToCache(cacheKey, locationName)
    
    return locationName
  } catch (error) {
    console.warn('Geocoding error:', error)
    // Return formatted coordinates as fallback
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
}

// Get Google Maps link
export const getGoogleMapsLink = (latitude, longitude) => {
  if (!latitude || !longitude) {
    return null
  }
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

