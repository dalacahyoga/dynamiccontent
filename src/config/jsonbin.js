// JSONBin.io Configuration
// API Key FORCE - semua device OTOMATIS menggunakan ini, tidak perlu setup manual
export const JSONBIN_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'

// Master Config Bin ID - Bin khusus untuk menyimpan config bin ID
// Semua device akan otomatis menggunakan bin dengan nama ini
// Setelah Device A setup, bin ini akan otomatis dibuat dan digunakan oleh semua device
export const MASTER_CONFIG_BIN_NAME = 'Portal Indonesia - Master Config'

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


