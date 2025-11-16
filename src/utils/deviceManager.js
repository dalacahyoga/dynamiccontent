// Device identification and management
export const getDeviceId = () => {
  try {
    let deviceId = localStorage.getItem('deviceId')
    
    if (!deviceId) {
      // Generate unique device ID
      deviceId = generateDeviceId()
      localStorage.setItem('deviceId', deviceId)
    }
    
    return deviceId
  } catch (error) {
    console.error('Error getting device ID:', error)
    return generateDeviceId()
  }
}

const generateDeviceId = () => {
  // Generate unique ID based on timestamp, random, and user agent
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  const userAgent = navigator.userAgent.substring(0, 10).replace(/\W/g, '')
  
  return `device_${timestamp}_${random}_${userAgent}`
}

export const getDeviceInfo = () => {
  return {
    id: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timestamp: new Date().toISOString()
  }
}

