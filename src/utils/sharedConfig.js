// Shared configuration for JSONBin.io
// This allows all devices to use the same API key and bin IDs
// Note: In production, consider using environment variables or a more secure method

const SHARED_CONFIG_KEY = 'sharedJsonbinConfig'

// Save shared config (API key and bin IDs) to localStorage
// This can be called after admin setup to share config with all devices
export const saveSharedConfig = (apiKey, logsBinId, contentBinId) => {
  try {
    const config = {
      apiKey,
      logsBinId,
      contentBinId,
      timestamp: Date.now()
    }
    localStorage.setItem(SHARED_CONFIG_KEY, JSON.stringify(config))
    
    // Also save to individual keys for backward compatibility
    if (apiKey) {
      localStorage.setItem('jsonbinApiKey', apiKey)
    }
    if (logsBinId) {
      localStorage.setItem('jsonbinBinId', logsBinId)
    }
    if (contentBinId) {
      localStorage.setItem('jsonbinContentBinId', contentBinId)
    }
    
    return true
  } catch (error) {
    console.error('Error saving shared config:', error)
    return false
  }
}

// Load shared config from localStorage
export const loadSharedConfig = () => {
  try {
    const configStr = localStorage.getItem(SHARED_CONFIG_KEY)
    if (!configStr) {
      return null
    }
    
    const config = JSON.parse(configStr)
    
    // Also update individual keys
    if (config.apiKey) {
      localStorage.setItem('jsonbinApiKey', config.apiKey)
    }
    if (config.logsBinId) {
      localStorage.setItem('jsonbinBinId', config.logsBinId)
    }
    if (config.contentBinId) {
      localStorage.setItem('jsonbinContentBinId', config.contentBinId)
    }
    
    return config
  } catch (error) {
    console.error('Error loading shared config:', error)
    return null
  }
}

// Auto-load shared config on page load
// This allows device B to automatically get config if it was set by device A
export const autoLoadSharedConfig = () => {
  return loadSharedConfig()
}

