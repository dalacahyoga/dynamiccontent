// JSONBin.io storage for centralized logging
// Free service: https://jsonbin.io
// No backend needed - direct API calls from frontend

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b'
const JSONBIN_BIN_ID_KEY = 'jsonbinBinId'
const JSONBIN_API_KEY_KEY = 'jsonbinApiKey'

// Initialize or get bin ID
export const initializeBin = async (apiKey) => {
  try {
    // Check if bin ID already exists
    let binId = localStorage.getItem(JSONBIN_BIN_ID_KEY)
    
    if (!binId) {
      // Create new bin
      const response = await fetch(JSONBIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey,
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
      localStorage.setItem(JSONBIN_API_KEY_KEY, apiKey)
    } else {
      // Save API key if not exists
      if (!localStorage.getItem(JSONBIN_API_KEY_KEY)) {
        localStorage.setItem(JSONBIN_API_KEY_KEY, apiKey)
      }
    }
    
    return binId
  } catch (error) {
    console.error('Error initializing bin:', error)
    throw error
  }
}

// Get API key from storage
export const getApiKey = () => {
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

