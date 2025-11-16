// JSONBin.io Configuration
// This file allows all devices to automatically use the same API key
// without needing manual setup

// Option 1: Use environment variable (recommended for production)
// Set VITE_JSONBIN_API_KEY in your build environment
// For Netlify: Go to Site settings > Environment variables > Add VITE_JSONBIN_API_KEY

// Option 2: Hardcode API key here (for development/testing)
// WARNING: This will expose API key in the code. Use environment variables for production!
// Uncomment the line below and set your API key if you don't want to use environment variables
const HARDCODED_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'

// Use environment variable first, fallback to hardcoded
export const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || HARDCODED_API_KEY || null

// Bin IDs from environment (optional - if device A already created bins)
export const JSONBIN_LOGS_BIN_ID = import.meta.env.VITE_JSONBIN_LOGS_BIN_ID || null
export const JSONBIN_CONTENT_BIN_ID = import.meta.env.VITE_JSONBIN_CONTENT_BIN_ID || null

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

