// Client-side analytics with two backends:
//  • Supabase (when configured) → data is shared across ALL visitors
//  • localStorage fallback (no backend) → data is per-browser only
import { supabase, supabaseEnabled } from '../config/supabase'
import { collectVisitor, getVisitorId, normalizeSource } from './visitor'

const PV_KEY = 'userAccessLogs'   // page views (kept from the JSONBin era)
const EV_KEY = 'trackedEvents'
const ALIAS_KEY = 'visitorAliases'
const MAX = 2000 // bound local storage

// ---- localStorage helpers --------------------------------------------------
function lsRead(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
function lsWrite(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr.slice(-MAX))) } catch { /* ignore */ }
}

const getDeviceName = (m) => `${m.platform || m.os || 'Unknown'} (${m.screen})`

// ---- writes (fire-and-forget) ----------------------------------------------
// Guard against double counts (React StrictMode double-invokes effects in dev;
// also fast back/forward). Same path within this window is recorded once.
let _lastPV = { path: '', t: 0 }

// Records a page view. Tries to attach geolocation (with the user's permission)
// before persisting so the admin "Pengunjung" tab can show a map link.
export function trackUserAccess() {
  try {
    const path = window.location.pathname
    if (path.startsWith('/admin')) return // don't count the admin area
    const now = Date.now()
    if (path === _lastPV.path && now - _lastPV.t < 2000) return
    _lastPV = { path, t: now }

    const base = collectVisitor()
    base.deviceId = base.vid
    base.deviceName = getDeviceName(base)

    const finish = (location) => record({ ...base, location: location || null })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finish({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
        () => finish(null),       // denied / unavailable
        { timeout: 5000 },
      )
    } else {
      finish(null)
    }
  } catch (e) {
    console.error('Error tracking user access:', e)
  }
}

function record(meta) {
  const path = window.location.pathname
  if (supabaseEnabled) {
    supabase.from('pageviews').insert({ path, ref: meta.referrer, meta }).then(() => {}, () => {})
    return
  }
  const arr = lsRead(PV_KEY)
  arr.push({ path, ref: meta.referrer, meta, ts: Date.now() })
  lsWrite(PV_KEY, arr)
}

export function trackEvent(name, meta) {
  const m = { ...(meta || {}), vid: getVisitorId() } // tie the event to a visitor
  if (supabaseEnabled) {
    supabase.from('events').insert({ name, meta: m }).then(() => {}, () => {})
    return
  }
  const arr = lsRead(EV_KEY)
  arr.push({ name, meta: m, ts: Date.now() })
  lsWrite(EV_KEY, arr)
}

// ---- reads (async) ---------------------------------------------------------
// Returns rows shaped { path|name, meta?, ts(ms), ref? }, oldest first.
async function fetchRows(table, key) {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from(table).select('*').order('ts', { ascending: true }).limit(5000)
    if (error) throw error
    return (data || []).map((r) => ({ ...r, ts: new Date(r.ts).getTime() }))
  }
  return lsRead(key)
}
export const getPageViews = () => fetchRows('pageviews', PV_KEY)
export const getEvents = () => fetchRows('events', EV_KEY)

// Delete everything for one visitor id: their page views AND their events.
export async function deleteVisitor(vid) {
  if (supabaseEnabled) {
    const r1 = await supabase.from('pageviews').delete().eq('meta->>vid', vid)
    if (r1.error) throw r1.error
    const r2 = await supabase.from('events').delete().eq('meta->>vid', vid)
    if (r2.error) throw r2.error
    return
  }
  try {
    lsWrite(PV_KEY, lsRead(PV_KEY).filter((r) => r.meta?.vid !== vid))
    lsWrite(EV_KEY, lsRead(EV_KEY).filter((r) => r.meta?.vid !== vid))
    const al = JSON.parse(localStorage.getItem(ALIAS_KEY)) || {}
    delete al[vid]; localStorage.setItem(ALIAS_KEY, JSON.stringify(al))
  } catch { /* ignore */ }
}

export async function clearAnalytics() {
  if (supabaseEnabled) {
    await supabase.from('pageviews').delete().neq('id', 0)
    await supabase.from('events').delete().neq('id', 0)
    return
  }
  try { localStorage.removeItem(PV_KEY); localStorage.removeItem(EV_KEY) } catch { /* ignore */ }
}

// ---- aliases (admin-set labels for a vid) ----------------------------------
export async function getAliases() {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from('aliases').select('vid,alias')
    if (error) return {}
    const m = {}; for (const r of data || []) m[r.vid] = r.alias
    return m
  }
  try { return JSON.parse(localStorage.getItem(ALIAS_KEY)) || {} } catch { return {} }
}
export async function setAlias(vid, alias) {
  if (supabaseEnabled) {
    const { error } = await supabase.from('aliases').upsert({ vid, alias, updated_at: new Date().toISOString() })
    if (error) throw error
    return
  }
  try {
    const m = JSON.parse(localStorage.getItem(ALIAS_KEY)) || {}
    if (alias) m[vid] = alias; else delete m[vid]
    localStorage.setItem(ALIAS_KEY, JSON.stringify(m))
  } catch { /* ignore */ }
}

// ---- page labels -----------------------------------------------------------
export const PAGE_LABELS = {
  '/': 'Home',
  '/timnas-indonesia': 'Timnas Indonesia',
  '/pulau-seribu': 'Pulau Seribu',
}
export const pageLabel = (path) => PAGE_LABELS[path] || path

// ---- visitor report --------------------------------------------------------
// One entry PER visitor id (vid), carrying that visitor's device/source profile,
// latest location, total visits, and a recent activity timeline. Sorted by most
// recently active first.
export async function visitorReport() {
  const [rows, evs, aliases] = await Promise.all([getPageViews(), getEvents(), getAliases()])
  const byVid = new Map()
  const source = new Map(), device = new Map()
  const bump = (m, key, ts) => {
    const k = key || '—'
    const e = m.get(k) || { key: k, count: 0, last: 0 }
    e.count += 1; e.last = Math.max(e.last, ts); m.set(k, e)
  }
  const ensure = (vid, ts) => {
    let v = byVid.get(vid)
    if (!v) {
      v = {
        vid, count: 0, eventCount: 0, first: ts, last: 0,
        device: '—', os: '—', browser: '—', source: '—',
        lang: '', screen: '', platform: '', timezone: '', referrer: '',
        deviceName: '', online: null, location: null, activity: [],
      }
      byVid.set(vid, v)
    }
    return v
  }
  for (const r of rows) {
    const ts = r.ts
    const src = normalizeSource(r.meta?.source)
    bump(source, src, ts)
    bump(device, r.meta?.device, ts)
    const v = ensure(r.meta?.vid || '—', ts)
    v.count += 1
    v.first = Math.min(v.first, ts)
    if (ts >= v.last) { // keep the freshest profile for this visitor
      v.last = ts
      v.device = r.meta?.device || '—'; v.os = r.meta?.os || '—'; v.browser = r.meta?.browser || '—'
      v.source = src; v.lang = r.meta?.lang || ''; v.screen = r.meta?.screen || ''
      v.platform = r.meta?.platform || ''; v.timezone = r.meta?.timezone || ''
      v.referrer = r.meta?.referrer || ''; v.deviceName = r.meta?.deviceName || ''
      v.online = r.meta?.online ?? null
      if (r.meta?.location) v.location = r.meta.location
    }
    if (r.meta?.location && !v.location) v.location = r.meta.location
    v.activity.push({ type: 'page', label: pageLabel(r.path), ts })
  }
  for (const ev of evs) {
    const ts = ev.ts
    const v = ensure(ev.meta?.vid || '—', ts)
    v.eventCount += 1
    v.first = Math.min(v.first, ts); v.last = Math.max(v.last, ts)
    v.activity.push({ type: 'event', name: ev.name, target: ev.meta?.menu || ev.meta?.label || '', ts })
  }
  const visitors = [...byVid.values()].map((v) => ({
    ...v,
    alias: aliases[v.vid] || '',
    activity: v.activity.sort((a, b) => b.ts - a.ts), // newest first
  })).sort((a, b) => b.last - a.last)
  const sort = (m) => [...m.values()].sort((a, b) => b.count - a.count)
  return {
    total: rows.length,
    totalEvents: evs.length,
    uniqueVisitors: byVid.size,
    visitors,
    source: sort(source),
    device: sort(device),
  }
}

// ---- event report ----------------------------------------------------------
// Friendly Indonesian labels for each event name.
export const EVENT_LABELS = {
  menu_click: 'Klik menu navigasi',
  content_change: 'Ubah konten home (admin)',
  open_maps: 'Buka lokasi di Google Maps',
  view_content: 'Lihat konten',
  open_external: 'Buka link eksternal',
}
export const eventLabel = (name) => EVENT_LABELS[name] || name

// Grouped event report: per event name with a breakdown of targets, total
// count, and last time. Sorted by most frequent.
export async function eventReport() {
  const rows = await getEvents()
  const groups = new Map()
  for (const ev of rows) {
    let g = groups.get(ev.name)
    if (!g) { g = { name: ev.name, label: eventLabel(ev.name), count: 0, last: 0, targets: new Map() }; groups.set(ev.name, g) }
    g.count += 1; g.last = Math.max(g.last, ev.ts)
    const t = ev.meta?.menu || ev.meta?.label || '—'
    const tt = g.targets.get(t) || { target: t, count: 0, last: 0 }
    tt.count += 1; tt.last = Math.max(tt.last, ev.ts); g.targets.set(t, tt)
  }
  const groupsArr = [...groups.values()]
    .map((g) => ({ ...g, targets: [...g.targets.values()].sort((a, b) => b.count - a.count) }))
    .sort((a, b) => b.count - a.count)
  return { total: rows.length, groups: groupsArr, recent: rows.slice(-100).reverse() }
}
