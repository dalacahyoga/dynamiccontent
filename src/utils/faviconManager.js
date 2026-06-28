// Utility to update favicon dynamically.
// Accepts either an emoji (rendered on a canvas) or a raw SVG string
// (used as a transparent, scalable favicon — no background).

// Gapura / candi bentar (Balinese split gate) icon — transparent background,
// gold fill so it stays visible on both light and dark browser tabs.
export const GAPURA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="#c6a15b"><path d="M4 58V50H8V44H12V38H16V32H20V26H24V20H28V58Z"/><path d="M60 58V50H56V44H52V38H48V32H44V26H40V20H36V58Z"/><rect x="3" y="56" width="58" height="5" rx="1"/><rect x="23" y="14" width="5" height="7"/><rect x="36" y="14" width="5" height="7"/></g></svg>`

// Rice terrace (sawah terasering) icon — transparent background, green fill,
// for the Ceking Terrace tab.
export const RICE_TERRACE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="#5b8c3e"><rect x="5" y="46" width="54" height="9" rx="3"/><rect x="11" y="35" width="42" height="9" rx="3"/><rect x="17" y="24" width="30" height="9" rx="3"/><rect x="23" y="13" width="18" height="9" rx="3"/></g></svg>`

// Tropical island + palm tree icon — transparent background, for Pulau Pari.
export const ISLAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="32" cy="50" rx="22" ry="6" fill="#e0b25e"/><rect x="30" y="26" width="4" height="22" rx="2" fill="#9c6b3a"/><g fill="#2f9e6a"><path d="M32 26 C24 18 14 18 10 24 C18 22 26 24 32 28 Z"/><path d="M32 26 C40 18 50 18 54 24 C46 22 38 24 32 28 Z"/><path d="M32 24 C28 14 30 8 36 6 C34 14 34 20 33 26 Z"/></g></svg>`

// Padlock icon (admin area) — transparent background, purple to match the
// admin theme. Used for the browser tab on the Login & Dashboard pages.
export const ADMIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M22 30 V22 a10 10 0 0 1 20 0 V30" fill="none" stroke="#667eea" stroke-width="6" stroke-linecap="round"/><rect x="15" y="30" width="34" height="26" rx="6" fill="#667eea"/><circle cx="32" cy="40" r="3.6" fill="#fff"/><rect x="30.4" y="41" width="3.2" height="8" rx="1.5" fill="#fff"/></svg>`

// Archipelago / Nusantara islands icon — transparent background, blue base.
// Used as the default tab icon for the welcome ("no content") state.
export const PORTAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="#1487b0"><path d="M6 42 Q16 24 26 42 Z"/><path d="M22 42 Q34 18 48 42 Z"/><path d="M42 42 Q51 28 60 42 Z"/></g><g fill="none" stroke="#0b3d5c" stroke-width="3" stroke-linecap="round"><path d="M6 50 q5 4 10 0 t10 0 t10 0 t10 0 t10 0"/><path d="M10 57 q5 4 10 0 t10 0 t10 0 t10 0"/></g></svg>`

const setFaviconHref = (href, type) => {
  document.querySelectorAll("link[rel*='icon']").forEach((f) => f.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = type
  link.href = href
  document.head.appendChild(link)
}

export const updateFavicon = (value) => {
  try {
    // SVG path: transparent, no canvas background
    if (typeof value === 'string' && value.trim().startsWith('<svg')) {
      setFaviconHref(`data:image/svg+xml,${encodeURIComponent(value)}`, 'image/svg+xml')
      return
    }

    // Emoji path: draw onto a canvas
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 64, 64)
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(value, 32, 32)

    setFaviconHref(canvas.toDataURL('image/png'), 'image/png')
  } catch (error) {
    console.warn('Failed to update favicon:', error)
  }
}
