// JSONBin.io storage for centralized logging
// Free service: https://jsonbin.io
// No backend needed - direct API calls from frontend

import { getConfigApiKey, getConfigBinId } from '../config/jsonbin'

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b'
const JSONBIN_BIN_ID_KEY = 'jsonbinBinId'
const JSONBIN_API_KEY_KEY = 'jsonbinApiKey'
const CONFIG_BIN_ID_KEY = 'jsonbinConfigBinId' // Bin untuk menyimpan bin IDs (logs & content)

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
    
    // Jika belum ada, coba ambil dari config bin (untuk device B, C, dst)
    if (!binId) {
      binId = await getBinIdFromConfigBin(finalApiKey, 'logs')
      if (binId) {
        localStorage.setItem(JSONBIN_BIN_ID_KEY, binId)
        console.log('✅ Using logs bin ID from config bin')
      }
    }
    
    if (!binId) {
      // Create new bin
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
      
      // Simpan bin ID ke config bin agar device lain bisa pakai
      await saveBinIdToConfigBin(finalApiKey, 'logs', binId)
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

// ========== CONFIG BIN (untuk share bin IDs antar device) ==========

// Initialize atau get config bin (untuk menyimpan bin IDs)
export const getOrCreateConfigBin = async (apiKey) => {
  // Coba ambil dari config (hardcoded) dulu
  let configBinId = getConfigBinId()
  
  // Jika belum ada di config, coba dari localStorage
  if (!configBinId) {
    configBinId = localStorage.getItem(CONFIG_BIN_ID_KEY)
  }
  
  // Jika masih belum ada, create baru
  if (!configBinId) {
    const response = await fetch(JSONBIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
        'X-Bin-Name': 'Portal Indonesia - Config (Bin IDs)'
      },
      body: JSON.stringify({ logsBinId: null, contentBinId: null })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create config bin')
    }
    
    const data = await response.json()
    configBinId = data.metadata.id
    localStorage.setItem(CONFIG_BIN_ID_KEY, configBinId)
    console.log('✅ Created new config bin:', configBinId)
    console.log('📋 Copy config bin ID ini dan hardcode di src/config/jsonbin.js agar semua device menggunakan config bin yang sama')
  } else {
    // Simpan ke localStorage untuk konsistensi
    localStorage.setItem(CONFIG_BIN_ID_KEY, configBinId)
  }
  
  return configBinId
}

// Simpan bin ID ke config bin
const saveBinIdToConfigBin = async (apiKey, type, binId) => {
  try {
    const configBinId = await getOrCreateConfigBin(apiKey)
    
    // Read current config
    const getResponse = await fetch(`${JSONBIN_API_URL}/${configBinId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': apiKey
      }
    })
    
    let config = { logsBinId: null, contentBinId: null }
    if (getResponse.ok) {
      const data = await getResponse.json()
      config = data.record || config
    }
    
    // Update config
    if (type === 'logs') {
      config.logsBinId = binId
    } else if (type === 'content') {
      config.contentBinId = binId
    }
    
    // Save config
    await fetch(`${JSONBIN_API_URL}/${configBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(config)
    })
  } catch (error) {
    console.warn('Failed to save bin ID to config bin:', error)
  }
}

// Ambil bin ID dari config bin
const getBinIdFromConfigBin = async (apiKey, type) => {
  try {
    // Coba ambil config bin ID dari config (hardcoded) atau localStorage
    let configBinId = getConfigBinId() || localStorage.getItem(CONFIG_BIN_ID_KEY)
    
    // Jika belum ada, coba create config bin
    if (!configBinId) {
      configBinId = await getOrCreateConfigBin(apiKey)
    }
    
    if (!configBinId) {
      return null
    }
    
    const response = await fetch(`${JSONBIN_API_URL}/${configBinId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': apiKey
      }
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    const config = data.record || {}
    
    if (type === 'logs') {
      return config.logsBinId || null
    } else if (type === 'content') {
      return config.contentBinId || null
    }
    
    return null
  } catch (error) {
    console.warn('Failed to get bin ID from config bin:', error)
    return null
  }
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
    
    // Jika belum ada, coba ambil dari config bin (untuk device B, C, dst)
    if (!binId) {
      binId = await getBinIdFromConfigBin(finalApiKey, 'content')
      if (binId) {
        localStorage.setItem(CONTENT_BIN_ID_KEY, binId)
        console.log('✅ Using content bin ID from config bin')
      }
    }
    
    if (!binId) {
      // Get current content from localStorage
      const currentContent = localStorage.getItem('activeContent') || 'none'
      
      // Create new bin for content settings
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
      
      // Simpan bin ID ke config bin agar device lain bisa pakai
      await saveBinIdToConfigBin(finalApiKey, 'content', binId)
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

