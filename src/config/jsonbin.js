// JSONBin.io Configuration
// API Key FORCE - semua device OTOMATIS menggunakan ini
export const JSONBIN_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'

// Bin IDs - Setelah Device A setup, copy bin IDs dari dashboard dan paste di sini
// Semua device akan otomatis menggunakan bin IDs yang sama
export const JSONBIN_LOGS_BIN_ID = "6919c440ae596e708f5cae43"
export const JSONBIN_CONTENT_BIN_ID = "6919c5b6ae596e708f5cb026"

// Check if API key is available
export const hasApiKey = () => {
  return !!JSONBIN_API_KEY
}

// Get API key (from config or localStorage)
export const getConfigApiKey = () => {
  if (JSONBIN_API_KEY) {
    return JSONBIN_API_KEY
  }
  return localStorage.getItem('jsonbinApiKey')
}

// Get bin IDs (from config first, then localStorage)
export const getConfigBinIds = () => {
  return {
    logsBinId: JSONBIN_LOGS_BIN_ID || localStorage.getItem('jsonbinBinId'),
    contentBinId: JSONBIN_CONTENT_BIN_ID || localStorage.getItem('jsonbinContentBinId')
  }
}


