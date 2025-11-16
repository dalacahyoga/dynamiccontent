// JSONBin.io Configuration
// This file allows all devices to automatically use the same API key
// without needing manual setup

// API Key sudah di-hardcode di sini
// Semua device (A, B, C, dst) akan otomatis menggunakan API key ini
const HARDCODED_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'

// Use environment variable first (if set), fallback to hardcoded
export const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || HARDCODED_API_KEY || null

// Bin IDs (optional - set setelah device A create bins)
// Copy bin IDs dari dashboard admin setelah setup, lalu paste di sini
// Ini memastikan semua device (B, C, dst) menggunakan bins yang sama dengan device A
const HARDCODED_LOGS_BIN_ID = null // Paste logs bin ID di sini setelah device A setup
const HARDCODED_CONTENT_BIN_ID = null // Paste content bin ID di sini setelah device A setup

// Use environment variable first (if set), fallback to hardcoded
export const JSONBIN_LOGS_BIN_ID = import.meta.env.VITE_JSONBIN_LOGS_BIN_ID || HARDCODED_LOGS_BIN_ID || null
export const JSONBIN_CONTENT_BIN_ID = import.meta.env.VITE_JSONBIN_CONTENT_BIN_ID || HARDCODED_CONTENT_BIN_ID || null

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

// Get bin IDs from config (if available)
export const getConfigBinIds = () => {
  return {
    logsBinId: JSONBIN_LOGS_BIN_ID,
    contentBinId: JSONBIN_CONTENT_BIN_ID
  }
}

