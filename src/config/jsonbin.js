// JSONBin.io Configuration
// API Key FORCE - semua device OTOMATIS menggunakan ini, tidak perlu setup manual
export const JSONBIN_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'

// Config Bin ID (untuk share bin IDs antar device)
// Setelah device A setup, copy config bin ID dari dashboard dan paste di sini
const HARDCODED_CONFIG_BIN_ID = null // Paste config bin ID di sini setelah device A setup
export const JSONBIN_CONFIG_BIN_ID = import.meta.env.VITE_JSONBIN_CONFIG_BIN_ID || HARDCODED_CONFIG_BIN_ID || null

// Check if API key is available
export const hasApiKey = () => {
  return !!JSONBIN_API_KEY
}

// Get API key (from config or localStorage)
export const getConfigApiKey = () => {
  // First try environment variable / config
  if (JSONBIN_API_KEY) {
    return JSONBIN_API_KEY
  }
  
  // Fallback to localStorage (for backward compatibility)
  return localStorage.getItem('jsonbinApiKey')
}

// Get config bin ID (from config or localStorage)
export const getConfigBinId = () => {
  // First try config
  if (JSONBIN_CONFIG_BIN_ID) {
    return JSONBIN_CONFIG_BIN_ID
  }
  
  // Fallback to localStorage
  return localStorage.getItem('jsonbinConfigBinId')
}

// Get bin IDs from config (if available)
export const getConfigBinIds = () => {
  return {
    logsBinId: JSONBIN_LOGS_BIN_ID,
    contentBinId: JSONBIN_CONTENT_BIN_ID
  }
}

