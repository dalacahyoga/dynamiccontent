import { getDeviceId, getDeviceInfo } from './deviceManager'

// Utility function to track user access
export const trackUserAccess = () => {
  try {
    const deviceInfo = getDeviceInfo()
    
    // Get user information
    const userData = {
      id: generateId(),
      deviceId: deviceInfo.id,
      deviceName: getDeviceName(deviceInfo),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('id-ID'),
      path: window.location.pathname,
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'Direct access',
      online: navigator.onLine,
    }

    // Try to get location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userData.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          saveUserAccess(userData).catch(err => console.warn('Failed to save access:', err))
        },
        () => {
          // Location not available or denied
          saveUserAccess(userData).catch(err => console.warn('Failed to save access:', err))
        },
        { timeout: 5000 }
      )
    } else {
      saveUserAccess(userData).catch(err => console.warn('Failed to save access:', err))
    }
  } catch (error) {
    console.error('Error tracking user access:', error)
  }
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const getDeviceName = (deviceInfo) => {
  // Generate readable device name
  const platform = deviceInfo.platform || 'Unknown'
  const screen = `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`
  return `${platform} (${screen})`
}

const saveUserAccess = async (userData) => {
  try {
    // Get existing user access data from localStorage
    const existingData = localStorage.getItem('userAccessLogs')
    let userLogs = existingData ? JSON.parse(existingData) : []

    // Prevent duplicate logs: Check if there's a recent log from the same device
    // within the last 2 seconds (to handle React StrictMode double render)
    const now = new Date(userData.timestamp).getTime()
    const recentDuplicate = userLogs.find(log => {
      const logTime = new Date(log.timestamp).getTime()
      const timeDiff = Math.abs(now - logTime)
      return (
        log.deviceId === userData.deviceId &&
        log.path === userData.path &&
        timeDiff < 2000 // 2 seconds
      )
    })

    // Skip if duplicate found
    if (recentDuplicate) {
      console.log('Duplicate log detected, skipping...')
      return
    }

    // Add new user access
    userLogs.unshift(userData) // Add to beginning of array

    // Keep only last 500 entries to prevent localStorage from getting too large
    if (userLogs.length > 500) {
      userLogs = userLogs.slice(0, 500)
    }

    // Save back to localStorage
    localStorage.setItem('userAccessLogs', JSON.stringify(userLogs))

    // Auto-sync to cloud if initialized
    try {
      const { isInitialized, saveLogsToCloud } = await import('./jsonbinStorage')
      if (isInitialized()) {
        // Sync in background (don't wait for it)
        saveLogsToCloud(userLogs).catch(err => {
          console.warn('Failed to sync to cloud:', err)
        })
      }
    } catch (error) {
      // JSONBin not available, continue silently
    }
  } catch (error) {
    console.error('Error saving user access:', error)
  }
}

export const getUserAccessLogs = () => {
  try {
    const data = localStorage.getItem('userAccessLogs')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error getting user access logs:', error)
    return []
  }
}

export const getAllDevicesLogs = () => {
  try {
    // Get all logs from centralized storage
    const data = localStorage.getItem('userAccessLogs')
    const logs = data ? JSON.parse(data) : []
    
    // Group by device
    const devices = {}
    logs.forEach(log => {
      const deviceId = log.deviceId || 'unknown'
      if (!devices[deviceId]) {
        devices[deviceId] = {
          deviceId: deviceId,
          deviceName: log.deviceName || 'Unknown Device',
          logs: [],
          firstSeen: log.timestamp,
          lastSeen: log.timestamp,
          totalAccess: 0
        }
      }
      devices[deviceId].logs.push(log)
      devices[deviceId].totalAccess++
      if (new Date(log.timestamp) < new Date(devices[deviceId].firstSeen)) {
        devices[deviceId].firstSeen = log.timestamp
      }
      if (new Date(log.timestamp) > new Date(devices[deviceId].lastSeen)) {
        devices[deviceId].lastSeen = log.timestamp
      }
    })
    
    return Object.values(devices)
  } catch (error) {
    console.error('Error getting devices logs:', error)
    return []
  }
}

export const exportLogs = () => {
  try {
    const logs = getUserAccessLogs()
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Error exporting logs:', error)
    return false
  }
}

export const importLogs = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedLogs = JSON.parse(e.target.result)
          const existingLogs = getUserAccessLogs()
          
          // Merge logs, avoiding duplicates
          const existingIds = new Set(existingLogs.map(log => log.id))
          const newLogs = importedLogs.filter(log => !existingIds.has(log.id))
          
          // Combine and sort by timestamp
          const mergedLogs = [...existingLogs, ...newLogs].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp)
          })
          
          // Keep only last 500 entries
          const finalLogs = mergedLogs.slice(0, 500)
          
          localStorage.setItem('userAccessLogs', JSON.stringify(finalLogs))
          resolve({ imported: newLogs.length, total: finalLogs.length })
        } catch (error) {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    } catch (error) {
      reject(error)
    }
  })
}

export const clearUserAccessLogs = async () => {
  try {
    localStorage.removeItem('userAccessLogs')
    
    // Also clear from cloud if initialized
    try {
      const { isInitialized, saveLogsToCloud } = await import('./jsonbinStorage')
      if (isInitialized()) {
        await saveLogsToCloud([])
      }
    } catch (error) {
      // JSONBin not available or not initialized, continue
      console.warn('Failed to clear logs from cloud:', error)
    }
    
    return true
  } catch (error) {
    console.error('Error clearing user access logs:', error)
    return false
  }
}

