import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  visitorReport, eventReport, eventLabel, setAlias, deleteVisitor, clearAnalytics,
} from '../../utils/tracker'
import {
  getActiveContent, setActiveContent, CONTENT_OPTIONS, getContentLabel, syncContentFromCloud,
} from '../../utils/contentManager'
import { supabase, supabaseEnabled, sourceLabel } from '../../config/supabase'
import { updateFavicon, ADMIN_SVG } from '../../utils/faviconManager'
import AdminNav from '../../components/AdminNav'
import LocationCell from '../../components/LocationCell'
import './Admin.css'

const fmt = (ts) => (ts ? new Date(ts).toLocaleString('id-ID') : '—')

const CONTENT_LIST = [
  { id: CONTENT_OPTIONS.NONE, icon: '🚫', title: 'Tidak Ada Konten', desc: 'Halaman home kosong' },
  { id: CONTENT_OPTIONS.PULAU_PARI, icon: '🏝️', title: 'Pulau Pari', desc: 'Surga tropis di Kepulauan Seribu' },
  { id: CONTENT_OPTIONS.GUNUNG_KAWI, icon: '⛰️', title: 'Gunung Kawi Sebatu', desc: 'Pura Air yang Indah di Gianyar, Bali' },
  { id: CONTENT_OPTIONS.CEKING_TERRACE, icon: '🌾', title: 'Ceking Terrace', desc: 'Keindahan Terasering Sawah di Ubud, Bali' },
]

function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [ready, setReady] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Administrator Dashboard | Portal Indonesia'
    updateFavicon(ADMIN_SVG)

    if (supabaseEnabled) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) { setIsAuthenticated(true); setReady(true) }
        else navigate('/admin')
      })
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        if (!session) navigate('/admin')
      })
      return () => data.subscription?.unsubscribe()
    }

    if (localStorage.getItem('adminLoggedIn') === 'true') {
      setIsAuthenticated(true); setReady(true)
    } else {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
    else {
      localStorage.removeItem('adminLoggedIn')
      localStorage.removeItem('adminLoginTime')
    }
    navigate('/admin')
  }

  if (!ready || !isAuthenticated) return null

  return (
    <div className="admin-container">
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div className="dashboard-container">
        {!supabaseEnabled && (
          <div className="warning-banner">
            <div className="warning-banner__icon">⚠️</div>
            <div className="warning-banner__text">
              <strong>Mode Lokal (tanpa cloud sync)</strong>
              <p>
                Supabase belum dikonfigurasi, jadi data hanya tersimpan di browser ini dan tidak terlihat
                dari device lain. Set <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>{' '}
                (lihat <code>docs/SUPABASE_SETUP.md</code>) untuk mengaktifkan cloud sync.
              </p>
            </div>
          </div>
        )}

        <div className="dashboard-header">
          <div>
            <h1>📊 Administrator Dashboard</h1>
            <p>Portal Indonesia · sumber data: {sourceLabel}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'content' && <EditContent />}
          {activeTab === 'visitors' && <Visitors />}
          {activeTab === 'events' && <EventsTab />}
        </div>
      </div>
    </div>
  )
}

// ---- Tab: Pengaturan Konten -----------------------------------------------
function EditContent() {
  const [active, setActive] = useState(getActiveContent())
  const [status, setStatus] = useState('')

  useEffect(() => {
    syncContentFromCloud().then((c) => { if (c) setActive(c) })
    const id = setInterval(async () => {
      const c = await syncContentFromCloud()
      if (c) setActive(c)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const choose = async (contentType) => {
    const ok = await setActiveContent(contentType)
    if (ok) {
      setActive(contentType)
      window.dispatchEvent(new Event('contentChanged'))
      setStatus(`✔ Konten aktif: ${getContentLabel(contentType)}` + (supabaseEnabled ? ' (tersinkron ke semua device)' : ' (lokal)'))
    } else {
      setStatus('✖ Gagal mengubah konten')
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>⚙️ Pengaturan Konten Home</h2>
        <p className="admin-note">Pilih satu konten yang akan ditampilkan di halaman home. Perubahan langsung tersinkron ke semua pengunjung.</p>
      </div>
      <div className="content-options">
        {CONTENT_LIST.map((c) => (
          <button
            key={c.id}
            onClick={() => choose(c.id)}
            className={`content-option ${active === c.id ? 'active' : ''}`}
          >
            <div className="option-icon">{c.icon}</div>
            <div className="option-text">
              <div className="option-title">{c.title}</div>
              <div className="option-desc">{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="current-content-info">
        <strong>Konten Aktif:</strong> {getContentLabel(active)}
        {status && <span className="admin-saved"> · {status}</span>}
      </div>
    </section>
  )
}

// ---- generic async report loader ------------------------------------------
function useReport(reportFn) {
  const [state, setState] = useState({ loading: true, error: '', data: null })
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try { setState({ loading: false, error: '', data: await reportFn() }) }
    catch { setState({ loading: false, error: 'Gagal memuat data.', data: null }) }
  }, [reportFn])
  useEffect(() => { load() }, [load])
  return { ...state, reload: load }
}

function CountTable({ head, rows }) {
  if (!rows?.length) return <p className="admin-empty">—</p>
  return (
    <div className="table-container">
      <table className="user-table">
        <thead><tr><th>{head}</th><th>Jumlah</th><th>Terakhir</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}><td>{r.key}</td><td>{r.count}</td><td>{fmt(r.last)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AliasInput({ vid, value }) {
  const [val, setVal] = useState(value || '')
  const [saved, setSaved] = useState(false)
  useEffect(() => { setVal(value || '') }, [value])
  async function commit() {
    const next = val.trim()
    if (next === (value || '')) return
    try { await setAlias(vid, next); setSaved(true); setTimeout(() => setSaved(false), 1200) } catch { /* ignore */ }
  }
  return (
    <input
      className={`visitor-card__alias ${saved ? 'is-saved' : ''}`}
      value={val}
      placeholder="+ alias"
      aria-label="Alias pengunjung"
      onChange={(e) => setVal(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
      onBlur={commit}
    />
  )
}

// ---- Tab: Pengunjung ------------------------------------------------------
function Visitors() {
  const { loading, error, data: rep, reload } = useReport(visitorReport)

  // auto-refresh every 10s like the old dashboard
  useEffect(() => {
    const id = setInterval(reload, 10000)
    return () => clearInterval(id)
  }, [reload])

  async function removeVisitor(vid) {
    if (!window.confirm('Hapus device ini beserta SEMUA kunjungan & event-nya?')) return
    try { await deleteVisitor(vid) } catch { /* ignore */ }
    reload()
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>👥 Daftar Pengunjung</h2>
        <p className="admin-note">
          Pengunjung unik: <strong>{rep?.uniqueVisitors ?? 0}</strong> ·
          kunjungan: <strong>{rep?.total ?? 0}</strong> ·
          event: <strong>{rep?.totalEvents ?? 0}</strong> · sumber: {sourceLabel}
        </p>
      </div>
      <Toolbar onReload={reload} />
      {loading ? <p className="admin-empty">Memuat…</p> : error ? <p className="error-message">{error}</p> : (
        <>
          {rep.visitors.length === 0 ? <p className="admin-empty">Belum ada pengunjung.</p> : (
            <div className="visitor-list">
              {rep.visitors.map((v, idx) => (
                <details className="visitor-card" key={v.vid}>
                  <summary className="visitor-card__head">
                    <button
                      className="visitor-card__del"
                      title="Hapus device & semua data-nya"
                      aria-label="Hapus device"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeVisitor(v.vid) }}
                    >🗑️</button>
                    <span className="visitor-card__id" title={v.vid}>#{idx + 1} · {String(v.vid).slice(0, 12)}</span>
                    <AliasInput vid={v.vid} value={v.alias} />
                    <span className="visitor-card__profile">{v.device} · {v.os} · {v.browser}</span>
                    <span className="visitor-card__src">{v.source}</span>
                    <span className="visitor-card__count">{v.count}× kunjungan · {v.eventCount} event</span>
                    <span className="visitor-card__last">{fmt(v.last)}</span>
                  </summary>
                  <div className="visitor-card__body">
                    <div className="visitor-card__grid">
                      <div>
                        <h4>📍 Lokasi</h4>
                        <LocationCell location={v.location} />
                      </div>
                      <div>
                        <h4>ℹ️ Info Device</h4>
                        <ul className="visitor-card__meta">
                          <li><strong>Platform:</strong> {v.platform || '—'}</li>
                          <li><strong>Status:</strong> {v.online == null ? '—' : v.online ? '🟢 Online' : '🔴 Offline'}</li>
                          <li><strong>Layar:</strong> {v.screen || '—'}</li>
                          <li><strong>Bahasa:</strong> {v.lang || '—'}</li>
                          <li><strong>Timezone:</strong> {v.timezone || '—'}</li>
                          <li><strong>Referrer:</strong> {v.referrer || '—'}</li>
                          <li><strong>Pertama:</strong> {fmt(v.first)}</li>
                        </ul>
                      </div>
                    </div>
                    <h4>Aktivitas (halaman + event)</h4>
                    <div className="table-container">
                      <table className="user-table">
                        <thead><tr><th>Aktivitas</th><th>Waktu</th></tr></thead>
                        <tbody>
                          {v.activity.map((a, i) => (
                            <tr key={i}>
                              <td>
                                {a.type === 'page'
                                  ? <><span className="tag tag--page">Halaman</span> {a.label}</>
                                  : <><span className="tag tag--event">Event</span> {eventLabel(a.name)}{a.target ? ` · ${a.target}` : ''}</>}
                              </td>
                              <td>{fmt(a.ts)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="admin-grid2">
            <div><h3 className="admin-subhead">Ringkasan Sumber</h3><CountTable head="Source" rows={rep.source} /></div>
            <div><h3 className="admin-subhead">Ringkasan Device</h3><CountTable head="Device" rows={rep.device} /></div>
          </div>
        </>
      )}
    </section>
  )
}

// ---- Tab: Event Tracker ---------------------------------------------------
function EventsTab() {
  const { loading, error, data: rep, reload } = useReport(eventReport)
  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>📈 Event Tracker</h2>
        <p className="admin-note">
          Total event: <strong>{rep?.total ?? 0}</strong> · {rep?.groups?.length ?? 0} jenis event · sumber: {sourceLabel}
        </p>
      </div>
      <Toolbar onReload={reload} />
      {loading ? <p className="admin-empty">Memuat…</p> : error ? <p className="error-message">{error}</p> : (
        <>
          {rep.groups.length === 0 ? <p className="admin-empty">Belum ada event tercatat.</p> : (
            <div className="ev-list">
              {rep.groups.map((g) => (
                <details className="ev-card" key={g.name}>
                  <summary className="ev-card__head">
                    <span className="ev-card__name">{g.label}</span>
                    <span className="ev-card__raw">{g.name}</span>
                    <span className="ev-card__count">{g.count}×</span>
                    <span className="ev-card__last">{fmt(g.last)}</span>
                  </summary>
                  <div className="ev-card__body">
                    <div className="table-container">
                      <table className="user-table">
                        <thead><tr><th>Target</th><th>Jumlah</th><th>Terakhir</th></tr></thead>
                        <tbody>
                          {g.targets.map((t) => (
                            <tr key={t.target}><td>{t.target}</td><td>{t.count}</td><td>{fmt(t.last)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

          <h3 className="admin-subhead">Event terbaru</h3>
          {rep.recent.length === 0 ? <p className="admin-empty">—</p> : (
            <div className="table-container">
              <table className="user-table">
                <thead><tr><th>Event</th><th>Target</th><th>Waktu</th></tr></thead>
                <tbody>
                  {rep.recent.map((ev, i) => (
                    <tr key={i}>
                      <td>{eventLabel(ev.name)}</td>
                      <td>{ev.meta?.menu || ev.meta?.label || '—'}</td>
                      <td>{fmt(ev.ts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Toolbar({ onReload }) {
  return (
    <div className="section-actions" style={{ marginBottom: '1rem' }}>
      <button className="refresh-button" onClick={onReload}>🔄 Refresh</button>
      <button
        className="clear-button"
        onClick={async () => {
          if (window.confirm('Hapus semua data kunjungan & event?')) { await clearAnalytics(); onReload() }
        }}
      >🗑️ Hapus data</button>
    </div>
  )
}

export default Dashboard
