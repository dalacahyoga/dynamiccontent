import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserAccessLogs, clearUserAccessLogs, exportLogs, importLogs } from '../../utils/tracker'
import { getActiveContent, setActiveContent, CONTENT_OPTIONS, getContentLabel, syncContentFromCloud } from '../../utils/contentManager'
import { initializeBin, syncLogs, isInitialized, getApiKey, getBinId, initializeContentBin } from '../../utils/jsonbinStorage'
import { saveSharedConfig } from '../../utils/sharedConfig'
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
      // Sync content from cloud on load
      syncContentFromCloud().then(newContent => {
        if (newContent) {
          setActiveContentState(newContent)
          window.dispatchEvent(new Event('contentChanged'))
        }
      })
    } else {
      // Load from localStorage only if not using cloud
      const logs = getUserAccessLogs()
      setUserLogs(logs)
    }
    
    // Auto-sync content every 5 seconds if JSONBin is initialized
    let contentSyncInterval
    if (initialized) {
      contentSyncInterval = setInterval(async () => {
        const newContent = await syncContentFromCloud()
        if (newContent) {
          const currentContent = getActiveContent()
          if (newContent !== currentContent) {
            setActiveContentState(newContent)
            window.dispatchEvent(new Event('contentChanged'))
          }
        }
      }, 5000) // Sync every 5 seconds
    }
    
    return () => {
      if (contentSyncInterval) {
        clearInterval(contentSyncInterval)
      }
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
      const logsBinId = await initializeBin(apiKey.trim())
      // Also initialize content bin for content settings sync
      const contentBinId = await initializeContentBin(apiKey.trim())
      setJsonbinInitialized(true)
      
      // Save shared config so other devices can use the same API key and bin IDs
      saveSharedConfig(apiKey.trim(), logsBinId, contentBinId)
      
      // Save current content to cloud immediately after setup
      const currentContent = getActiveContent()
      const { saveContentToCloud } = await import('../../utils/jsonbinStorage')
      await saveContentToCloud(currentContent)
      
      alert('JSONBin.io berhasil di-setup! Log dan pengaturan konten akan otomatis tersinkronisasi di semua device.\n\n⚠️ PENTING: Device lain (B, C, dll) juga perlu setup dengan API key yang sama untuk sync bekerja. Atau gunakan fitur "Share Config" untuk mempermudah.')
      // Auto load logs after setup
      await loadLogsFromCloud()
      // Sync content from cloud
      await syncContentFromCloud().then(newContent => {
        if (newContent) {
          setActiveContentState(newContent)
          window.dispatchEvent(new Event('contentChanged'))
        }
      })
      
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

  const handleContentChange = async (contentType) => {
    const success = await setActiveContent(contentType)
    if (success) {
      setActiveContentState(contentType)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('contentChanged'))
      alert(`Konten berhasil diubah menjadi: ${getContentLabel(contentType)}. Perubahan akan tersinkronisasi ke semua device.`)
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
        {/* Warning Banner if JSONBin.io not initialized */}
        {!jsonbinInitialized && (
          <div className="warning-banner" style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>
                Cloud Sync Belum Diaktifkan!
              </strong>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Log dan pengaturan konten hanya tersimpan di browser ini. Untuk melihat log dari device lain dan sync konten antar device, 
                <strong> silakan setup JSONBin.io di tab "👥 Daftar Pengunjung"</strong>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('visitors')}
              style={{
                background: 'white',
                color: '#ff6b6b',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Setup Sekarang →
            </button>
          </div>
        )}
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
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span className="bin-id">Logs Bin ID: {getBinId()}</span>
                        <span className="bin-id">Content Bin ID: {localStorage.getItem('jsonbinContentBinId') || 'N/A'}</span>
                        <button
                          onClick={() => {
                            const logsBinId = getBinId()
                            const contentBinId = localStorage.getItem('jsonbinContentBinId')
                            const text = `Logs Bin ID: ${logsBinId}\nContent Bin ID: ${contentBinId}\n\nCopy bin IDs ini dan hardcode di src/config/jsonbin.js agar semua device menggunakan bins yang sama.`
                            navigator.clipboard.writeText(text)
                            alert('Bin IDs copied! Paste di src/config/jsonbin.js untuk hardcode bin IDs.')
                          }}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.4rem 0.8rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          📋 Copy Bin IDs untuk Hardcode
                        </button>
                      </div>
                    </div>
                    <div className="auto-sync-info">
                      <p>✅ Log otomatis tersinkronisasi setiap 10 detik</p>
                      <p>✅ Log dari semua device otomatis muncul tanpa perlu manual sync</p>
                      <p>✅ Konten otomatis tersinkronisasi setiap 5 detik</p>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                      <strong style={{ color: '#0369a1', display: 'block', marginBottom: '0.5rem' }}>
                        📋 Info untuk Device Lain:
                      </strong>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#0369a1' }}>
                        Device lain (B, C, dll) juga perlu setup dengan <strong>API key yang sama</strong> untuk sync bekerja.
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#075985' }}>
                        API Key: <code style={{ background: 'white', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>{getApiKey()?.substring(0, 20)}...</code>
                      </p>
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

