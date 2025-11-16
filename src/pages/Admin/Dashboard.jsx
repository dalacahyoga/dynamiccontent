import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserAccessLogs, clearUserAccessLogs, exportLogs, importLogs } from '../../utils/tracker'
import { getActiveContent, setActiveContent, CONTENT_OPTIONS, getContentLabel } from '../../utils/contentManager'
import { initializeBin, syncLogs, isInitialized, getApiKey, getBinId } from '../../utils/jsonbinStorage'
import AdminNav from '../../components/AdminNav'
import LocationCell from '../../components/LocationCell'
import './Admin.css'

function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userLogs, setUserLogs] = useState([])
  const [activeContent, setActiveContentState] = useState(CONTENT_OPTIONS.NONE)
  const [activeTab, setActiveTab] = useState('content')
  const [jsonbinInitialized, setJsonbinInitialized] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Function to load logs from cloud
  const loadLogsFromCloud = async () => {
    if (!isInitialized()) return

    try {
      // Sync logs (merge local and cloud)
      await syncLogs()
      
      // Reload logs after sync
      const logs = getUserAccessLogs()
      setUserLogs(logs)
    } catch (error) {
      console.warn('Failed to load logs from cloud:', error)
      // Fallback to local storage
      const logs = getUserAccessLogs()
      setUserLogs(logs)
    }
  }

  useEffect(() => {
    document.title = 'Administrator Dashboard | Portal Indonesia'
    
    // Check authentication
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!loggedIn) {
      navigate('/administrator')
      return
    }

    setIsAuthenticated(true)

    // Load active content
    const content = getActiveContent()
    setActiveContentState(content)

    // Check JSONBin.io status
    const initialized = isInitialized()
    setJsonbinInitialized(initialized)
    if (initialized) {
      setApiKey(getApiKey())
      // Auto-fetch logs from cloud on load
      loadLogsFromCloud()
    } else {
      // Load from localStorage only if not using cloud
      const logs = getUserAccessLogs()
      setUserLogs(logs)
    }

    // Set up polling for auto-refresh (every 10 seconds)
    let pollInterval
    if (initialized) {
      pollInterval = setInterval(() => {
        loadLogsFromCloud()
      }, 10000) // Poll every 10 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [navigate])

  const handleClearLogs = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua log akses pengguna?')) {
      await clearUserAccessLogs()
      setUserLogs([])
      if (isInitialized()) {
        // Reload to sync empty state
        await loadLogsFromCloud()
      }
    }
  }

  const handleRefreshLogs = async () => {
    if (isInitialized()) {
      // If using cloud, sync first
      await loadLogsFromCloud()
    } else {
      // Otherwise just load from local
      const logs = getUserAccessLogs()
      setUserLogs(logs)
      const devices = getAllDevicesLogs()
      setDevicesSummary(devices)
    }
  }

  const handleExportLogs = () => {
    if (exportLogs()) {
      alert('Log berhasil diekspor!')
    } else {
      alert('Gagal mengekspor log')
    }
  }

  const handleImportLogs = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const result = await importLogs(file)
      alert(`Import berhasil! ${result.imported} log baru ditambahkan. Total: ${result.total} log`)
      handleRefreshLogs()
    } catch (error) {
      alert(`Gagal mengimpor log: ${error.message}`)
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSetupJsonbin = async () => {
    if (!apiKey.trim()) {
      alert('Masukkan API Key JSONBin.io')
      return
    }

    try {
      setSyncing(true)
      await initializeBin(apiKey.trim())
      setJsonbinInitialized(true)
      alert('JSONBin.io berhasil di-setup! Log akan otomatis tersinkronisasi dan muncul di semua device.')
      // Auto load logs after setup
      await loadLogsFromCloud()
      
      // Restart polling
      const pollInterval = setInterval(() => {
        loadLogsFromCloud()
      }, 10000)
      
      // Store interval ID for cleanup (optional, bisa di-handle di useEffect)
    } catch (error) {
      alert(`Gagal setup JSONBin.io: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleContentChange = (contentType) => {
    if (setActiveContent(contentType)) {
      setActiveContentState(contentType)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('contentChanged'))
      alert(`Konten berhasil diubah menjadi: ${getContentLabel(contentType)}`)
    } else {
      alert('Gagal mengubah konten')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminLoginTime')
    navigate('/administrator')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="admin-container">
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>📊 Administrator Dashboard</h1>
            <p>Portal Indonesia - Data Monitoring</p>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'content' && (
            <section className="data-section">
              <h2>⚙️ Pengaturan Konten Home</h2>
            <div className="data-card">
              <div className="content-selector">
                <p className="selector-label">Pilih konten yang akan ditampilkan di halaman home:</p>
                <div className="content-options">
                  <button
                    onClick={() => handleContentChange(CONTENT_OPTIONS.NONE)}
                    className={`content-option ${activeContent === CONTENT_OPTIONS.NONE ? 'active' : ''}`}
                  >
                    <div className="option-icon">🚫</div>
                    <div className="option-text">
                      <div className="option-title">Tidak Ada Konten</div>
                      <div className="option-desc">Halaman home kosong</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleContentChange(CONTENT_OPTIONS.TIMNAS)}
                    className={`content-option ${activeContent === CONTENT_OPTIONS.TIMNAS ? 'active' : ''}`}
                  >
                    <div className="option-icon">⚽</div>
                    <div className="option-text">
                      <div className="option-title">Timnas Indonesia</div>
                      <div className="option-desc">Konten tentang Timnas Indonesia</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleContentChange(CONTENT_OPTIONS.PULAU_SERIBU)}
                    className={`content-option ${activeContent === CONTENT_OPTIONS.PULAU_SERIBU ? 'active' : ''}`}
                  >
                    <div className="option-icon">🏝️</div>
                    <div className="option-text">
                      <div className="option-title">Pulau Seribu</div>
                      <div className="option-desc">Konten tentang Pulau Seribu</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleContentChange(CONTENT_OPTIONS.GUNUNG_KAWI)}
                    className={`content-option ${activeContent === CONTENT_OPTIONS.GUNUNG_KAWI ? 'active' : ''}`}
                  >
                    <div className="option-icon">⛰️</div>
                    <div className="option-text">
                      <div className="option-title">Gunung Kawi Sebatu</div>
                      <div className="option-desc">Pura Air yang Indah di Gianyar, Bali</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleContentChange(CONTENT_OPTIONS.MALAKA_PROJECT)}
                    className={`content-option ${activeContent === CONTENT_OPTIONS.MALAKA_PROJECT ? 'active' : ''}`}
                  >
                    <div className="option-icon">🏗️</div>
                    <div className="option-text">
                      <div className="option-title">Malaka Project</div>
                      <div className="option-desc">Inovasi dan Pembangunan Berkelanjutan</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleContentChange(CONTENT_OPTIONS.CEKING_TERRACE)}
                    className={`content-option ${activeContent === CONTENT_OPTIONS.CEKING_TERRACE ? 'active' : ''}`}
                  >
                    <div className="option-icon">🌾</div>
                    <div className="option-text">
                      <div className="option-title">Ceking Terrace</div>
                      <div className="option-desc">Keindahan Terasering Sawah di Ubud, Bali</div>
                    </div>
                  </button>
                </div>
                <div className="current-content-info">
                  <strong>Konten Aktif:</strong> {getContentLabel(activeContent)}
                </div>
              </div>
            </div>
            </section>
          )}

          {activeTab === 'visitors' && (
            <section className="data-section">
              {/* JSONBin.io Setup */}
              <div className="jsonbin-setup">
                <h3>☁️ Cloud Sync (JSONBin.io)</h3>
                {!jsonbinInitialized ? (
                  <div className="setup-card">
                    <div className="warning-box">
                      <strong>⚠️ PENTING:</strong> Tanpa setup JSONBin.io, log dari device lain (A, B, C) 
                      <strong> TIDAK AKAN muncul</strong> di dashboard ini. Hanya log dari device ini yang terlihat.
                    </div>
                    <p className="setup-info">
                      Setup JSONBin.io untuk sync log otomatis antar device. 
                      <strong> Gratis, tidak perlu backend!</strong>
                    </p>
                    <div className="setup-steps">
                      <ol>
                        <li>Daftar di <a href="https://jsonbin.io" target="_blank" rel="noopener noreferrer">jsonbin.io</a> (gratis)</li>
                        <li>Copy API Key dari dashboard</li>
                        <li>Paste di bawah dan klik Setup</li>
                      </ol>
                    </div>
                    <div className="api-key-input">
                      <input
                        type="text"
                        placeholder="Masukkan JSONBin.io API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="api-key-field"
                      />
                      <button 
                        onClick={handleSetupJsonbin} 
                        className="setup-button"
                        disabled={syncing}
                      >
                        {syncing ? 'Setting up...' : '🔧 Setup'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sync-card">
                    <div className="sync-status">
                      <span className="status-badge success">✓ Terhubung & Auto-Sync Aktif</span>
                      <span className="bin-id">Bin ID: {getBinId()?.substring(0, 20)}...</span>
                    </div>
                    <div className="auto-sync-info">
                      <p>✅ Log otomatis tersinkronisasi setiap 10 detik</p>
                      <p>✅ Log dari semua device otomatis muncul tanpa perlu manual sync</p>
                    </div>
                    <button 
                      onClick={handleRefreshLogs} 
                      className="sync-button"
                      disabled={syncing}
                    >
                      {syncing ? '🔄 Loading...' : '🔄 Refresh Sekarang'}
                    </button>
                  </div>
                )}
              </div>

              <div className="section-header">
                <h2>👥 Daftar User yang Mengakses Website</h2>
              <div className="section-actions">
                <button onClick={handleExportLogs} className="export-button">
                  📥 Export Log
                </button>
                <label className="import-button">
                  📤 Import Log
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportLogs}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </label>
                <button onClick={handleRefreshLogs} className="refresh-button">
                  🔄 Refresh
                </button>
                <button onClick={handleClearLogs} className="clear-button">
                  🗑️ Hapus Semua
                </button>
              </div>
            </div>
            <div className="data-card">
              {userLogs.length > 0 ? (
                <div className="table-container">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Device</th>
                        <th>Waktu Akses</th>
                        <th>Platform</th>
                        <th>Lokasi</th>
                        <th>Screen</th>
                        <th>Referrer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="table-cell-content">
                              <div className="table-primary">{log.deviceName || 'Unknown Device'}</div>
                              <div className="table-secondary">{log.deviceId ? log.deviceId.substring(0, 15) + '...' : 'N/A'}</div>
                            </div>
                          </td>
                          <td>
                            <div className="table-cell-content">
                              <div className="table-primary">{log.date}</div>
                              <div className="table-secondary">{log.timezone}</div>
                            </div>
                          </td>
                          <td>
                            <div className="table-cell-content">
                              <div className="table-primary">{log.platform}</div>
                              <div className="table-secondary">{log.online ? '🟢 Online' : '🔴 Offline'}</div>
                            </div>
                          </td>
                          <td>
                            <LocationCell location={log.location} />
                          </td>
                          <td>
                            <div className="table-cell-content">
                              <div className="table-primary">{log.screenWidth} × {log.screenHeight}</div>
                              <div className="table-secondary">Window: {log.windowWidth} × {log.windowHeight}</div>
                            </div>
                          </td>
                          <td>
                            <div className="table-cell-content">
                              <div className="table-primary small-text">
                                {log.referrer.length > 40 ? log.referrer.substring(0, 40) + '...' : log.referrer}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Belum ada data akses pengguna</p>
                  <p className="empty-hint">Data akan muncul setelah pengguna mengakses website</p>
                </div>
              )}
            </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

