// JSONBin.io storage for centralized logging
// Free service: https://jsonbin.io
// No backend needed - direct API calls from frontend

import { getConfigApiKey, getConfigBinIds } from '../config/jsonbin'

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b'
const JSONBIN_BIN_ID_KEY = 'jsonbinBinId'
const JSONBIN_API_KEY_KEY = 'jsonbinApiKey'

// Initialize or get bin ID
// If apiKey is not provided, try to get from config
export const initializeBin = async (apiKey = null) => {
  try {
    // Use provided API key, or get from config, or from localStorage
    const finalApiKey = apiKey || getConfigApiKey() || localStorage.getItem(JSONBIN_API_KEY_KEY)
    
    if (!finalApiKey) {
      throw new Error('API key is required. Please setup JSONBin.io first or set VITE_JSONBIN_API_KEY in environment.')
    }
    
    // Check if bin ID already exists
    let binId = localStorage.getItem(JSONBIN_BIN_ID_KEY)
    
    // Coba ambil dari config (hardcoded) dulu
    if (!binId) {
      const configBinIds = getConfigBinIds()
      if (configBinIds.logsBinId) {
        binId = configBinIds.logsBinId
        localStorage.setItem(JSONBIN_BIN_ID_KEY, binId)
        console.log('✅ Using logs bin ID from config')
      }
    }
    
    if (!binId) {
      // Create new bin (hanya jika belum ada di config)
      const response = await fetch(JSONBIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': finalApiKey,
          'X-Bin-Name': 'Portal Indonesia - Access Logs'
        },
        body: JSON.stringify({ logs: [] })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create bin')
      }
      
      const data = await response.json()
      binId = data.metadata.id
      localStorage.setItem(JSONBIN_BIN_ID_KEY, binId)
      console.log('✅ Created new logs bin:', binId)
      console.log('📋 Copy bin ID ini dan hardcode di src/config/jsonbin.js: JSONBIN_LOGS_BIN_ID = "' + binId + '"')
    } else {
      // Save API key if not exists
      if (!localStorage.getItem(JSONBIN_API_KEY_KEY)) {
        localStorage.setItem(JSONBIN_API_KEY_KEY, finalApiKey)
      }
    }
    
    return binId
  } catch (error) {
    console.error('Error initializing bin:', error)
    throw error
  }
}

// Get API key from storage or config
export const getApiKey = () => {
  // FORCE: Selalu gunakan API key dari config (hardcoded)
  const configKey = getConfigApiKey()
  if (configKey) {
    // Save to localStorage untuk konsistensi
    localStorage.setItem(JSONBIN_API_KEY_KEY, configKey)
    return configKey
  }
  
  // Fallback ke localStorage (untuk backward compatibility)
  return localStorage.getItem(JSONBIN_API_KEY_KEY)
}

// Get bin ID from storage
export const getBinId = () => {
  return localStorage.getItem(JSONBIN_BIN_ID_KEY)
}

// Save logs to JSONBin.io
export const saveLogsToCloud = async (logs) => {
  try {
    const binId = getBinId()
    const apiKey = getApiKey()
    
    if (!binId || !apiKey) {
      throw new Error('Bin not initialized. Please set API key first.')
    }
    
    const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify({ logs })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save logs')
    }
    
    return true
  } catch (error) {
    console.error('Error saving logs to cloud:', error)
    throw error
  }
}

// Get logs from JSONBin.io
export const getLogsFromCloud = async () => {
  try {
    const binId = getBinId()
    const apiKey = getApiKey()
    
    if (!binId || !apiKey) {
      return { logs: [] }
    }
    
    const response = await fetch(`${JSONBIN_API_URL}/${binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': apiKey
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return { logs: [] }
      }
      throw new Error('Failed to fetch logs')
    }
    
    const data = await response.json()
    return data.record || { logs: [] }
  } catch (error) {
    console.error('Error fetching logs from cloud:', error)
    return { logs: [] }
  }
}

// Merge local and cloud logs
export const syncLogs = async () => {
  try {
    const localLogs = JSON.parse(localStorage.getItem('userAccessLogs') || '[]')
    const cloudData = await getLogsFromCloud()
    const cloudLogs = cloudData.logs || []
    
    // Create map of existing log IDs
    const existingIds = new Set(localLogs.map(log => log.id))
    
    // Add new logs from cloud that don't exist locally
    const newCloudLogs = cloudLogs.filter(log => !existingIds.has(log.id))
    
    // Combine and sort by timestamp
    const mergedLogs = [...localLogs, ...newCloudLogs].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
    
    // Keep only last 500 entries
    const finalLogs = mergedLogs.slice(0, 500)
    
    // Save merged logs locally
    localStorage.setItem('userAccessLogs', JSON.stringify(finalLogs))
    
    // Upload merged logs to cloud
    await saveLogsToCloud(finalLogs)
    
    return {
      local: localLogs.length,
      cloud: cloudLogs.length,
      merged: finalLogs.length,
      newFromCloud: newCloudLogs.length
    }
  } catch (error) {
    console.error('Error syncing logs:', error)
    throw error
  }
}

// Check if bin is initialized
export const isInitialized = () => {
  return !!(getBinId() && getApiKey())
}

// ========== CONTENT SETTINGS SYNC ==========

const CONTENT_BIN_ID_KEY = 'jsonbinContentBinId'

// Initialize content settings bin
// If apiKey is not provided, try to get from config
export const initializeContentBin = async (apiKey = null) => {
  try {
    // Use provided API key, or get from config, or from localStorage
    const finalApiKey = apiKey || getConfigApiKey() || localStorage.getItem(JSONBIN_API_KEY_KEY)
    
    if (!finalApiKey) {
      throw new Error('API key is required. Please setup JSONBin.io first or set VITE_JSONBIN_API_KEY in environment.')
    }
    
    let binId = localStorage.getItem(CONTENT_BIN_ID_KEY)
    
    // Coba ambil dari config (hardcoded) dulu
    if (!binId) {
      const configBinIds = getConfigBinIds()
      if (configBinIds.contentBinId) {
        binId = configBinIds.contentBinId
        localStorage.setItem(CONTENT_BIN_ID_KEY, binId)
        console.log('✅ Using content bin ID from config')
      }
    }
    
    if (!binId) {
      // Get current content from localStorage
      const currentContent = localStorage.getItem('activeContent') || 'none'
      
      // Create new bin for content settings (hanya jika belum ada di config)
      const response = await fetch(JSONBIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': finalApiKey,
          'X-Bin-Name': 'Portal Indonesia - Content Settings'
        },
        body: JSON.stringify({ activeContent: currentContent })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create content bin')
      }
      
      const data = await response.json()
      binId = data.metadata.id
      localStorage.setItem(CONTENT_BIN_ID_KEY, binId)
      console.log('✅ Created new content bin:', binId)
      console.log('📋 Copy bin ID ini dan hardcode di src/config/jsonbin.js: JSONBIN_CONTENT_BIN_ID = "' + binId + '"')
    }
    
    return binId
  } catch (error) {
    console.error('Error initializing content bin:', error)
    throw error
  }
}

// Get content settings from cloud
// Try to read without API key first (if bin is public), then with API key if available
export const getContentFromCloud = async () => {
  try {
    const binId = localStorage.getItem(CONTENT_BIN_ID_KEY)
    const apiKey = getApiKey()
    
    if (!binId) {
      return null
    }
    
    // Try to read without API key first (for public bins)
    let response = await fetch(`${JSONBIN_API_URL}/${binId}/latest`, {
      method: 'GET'
    })
    
    // If unauthorized and we have API key, try with API key
    if (!response.ok && response.status === 401 && apiKey) {
      response = await fetch(`${JSONBIN_API_URL}/${binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': apiKey
        }
      })
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      // If still unauthorized without API key, return null (bin is private and no API key)
      if (response.status === 401) {
        console.warn('Content bin is private and no API key available. Content sync will not work for visitors.')
        return null
      }
      throw new Error('Failed to fetch content settings')
    }
    
    const data = await response.json()
    return data.record?.activeContent || null
  } catch (error) {
    console.error('Error fetching content from cloud:', error)
    return null
  }
}

// Save content settings to cloud
export const saveContentToCloud = async (activeContent) => {
  try {
    const binId = localStorage.getItem(CONTENT_BIN_ID_KEY)
    const apiKey = getApiKey()
    
    if (!binId || !apiKey) {
      // Try to initialize if not exists
      if (apiKey) {
        await initializeContentBin(apiKey)
        return await saveContentToCloud(activeContent) // Retry
      }
      return false
    }
    
    const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify({ activeContent })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save content settings')
    }
    
    return true
  } catch (error) {
    console.error('Error saving content to cloud:', error)
    return false
  }
}

