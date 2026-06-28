import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getLocationPermission, captureLocation, trackEvent } from '../../utils/tracker'
import './GunungKawiContent.css'

// Stable Wikimedia Commons images (Special:FilePath needs no hash; ?width= resizes).
const FILE = 'Bali_-_Pura_Gunung_Kawi_Sebatu_(2025)_-_img_'
const img = (n, w = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${FILE}${n}.jpg?width=${w}`

const HERO_IMG = img('18', 1600)
const ABOUT_IMG = img('44', 900)

const GALLERY = [
  { n: '03', cap: 'Gerbang & Arsitektur Pura' },
  { n: '05', cap: 'Kolam Mata Air Suci' },
  { n: '08', cap: 'Taman Tropis' },
  { n: '10', cap: 'Kolam Ikan Koi' },
  { n: '12', cap: 'Pelinggih & Meru' },
  { n: '15', cap: 'Kolam Teratai' },
  { n: '22', cap: 'Ukiran Batu Khas Bali' },
  { n: '25', cap: 'Suasana Pura' },
  { n: '28', cap: 'Pancuran Penyucian' },
  { n: '30', cap: 'Patung Dewi Saraswati' },
  { n: '33', cap: 'Lanskap Hijau' },
  { n: '40', cap: 'Detail Candi' },
]

function GunungKawiContent() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(6)
  const [lightbox, setLightbox] = useState(null) // index into GALLERY or null
  const [aboutIn, setAboutIn] = useState(false)
  const aboutMediaRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Subtle reveal of the About image when it scrolls into view.
  useEffect(() => {
    const el = aboutMediaRef.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAboutIn(true); ob.disconnect() } },
      { threshold: 0.25 },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  const goTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Re-request location only if it isn't already granted; if the user allows
  // now, their data is updated with coordinates.
  const requestLocationIfNeeded = async () => {
    const perm = await getLocationPermission()
    if (perm === 'granted') return // already allowed → don't ask again
    captureLocation() // prompt/denied → (re)request; records location if allowed
  }

  // "Jelajahi": scroll to About + (re)request location.
  const onExplore = () => {
    trackEvent('gk_hero_explore', { label: 'Jelajahi' })
    goTo('gk-about')
    requestLocationIfNeeded()
  }

  // "Muat Lebih Banyak": reveal all photos + (re)request location.
  const onLoadMore = () => {
    trackEvent('gk_load_more', { label: 'Muat Lebih Banyak' })
    setVisible(GALLERY.length)
    requestLocationIfNeeded()
  }

  // Open a photo in the lightbox + (re)request location. Each photo fires a
  // UNIQUE event name so it can be counted individually in the admin tracker.
  const onOpenPhoto = (i) => {
    trackEvent(`gk_photo_${GALLERY[i].n}`, { label: GALLERY[i].cap })
    setLightbox(i)
    requestLocationIfNeeded()
  }

  const onNav = (id, name, label) => {
    trackEvent(name, { label })
    goTo(id)
  }

  // Location card: request the visitor's location again, then open Google Maps
  // with a route from their position to the temple (falls back to the temple pin).
  const onOpenMaps = async () => {
    trackEvent('gk_open_maps', { label: 'Buka di Google Maps' })
    const dest = encodeURIComponent('Pura Gunung Kawi Sebatu, Tegallalang, Gianyar, Bali')
    const coords = await captureLocation() // re-asks + updates data if allowed
    const url = coords
      ? `https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const closeBox = useCallback(() => setLightbox(null), [])
  const step = useCallback((d) => {
    setLightbox((i) => (i == null ? i : (i + d + GALLERY.length) % GALLERY.length))
  }, [])

  useEffect(() => {
    if (lightbox == null) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeBox()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeBox, step])

  return (
    <div className="gk">
      {/* ---- Navbar ---- */}
      <nav className={`gk-nav ${scrolled ? 'gk-nav--scrolled' : ''}`}>
        <div
          className="gk-nav__brand"
          onClick={() => { trackEvent('gk_nav_home', { label: 'Brand / ke atas' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          Gunung Kawi Sebatu
        </div>
        <button
          className="gk-nav__toggle"
          aria-label="Buka menu"
          onClick={() => { trackEvent('gk_nav_toggle', { label: 'Toggle menu mobile' }); setMenuOpen((o) => !o) }}
        >
          <span /><span /><span />
        </button>
        <ul className={`gk-nav__links ${menuOpen ? 'gk-nav__links--open' : ''}`}>
          <li><button className="gk-nav__link" onClick={() => onNav('gk-about', 'gk_nav_about', 'About')}>About</button></li>
          <li><button className="gk-nav__link" onClick={() => onNav('gk-gallery', 'gk_nav_gallery', 'Gallery')}>Gallery</button></li>
        </ul>
      </nav>

      {/* ---- Hero ---- */}
      <header className="gk-hero" style={{ backgroundImage: `url("${HERO_IMG}")` }}>
        <div className="gk-hero__overlay" />
        <div className="gk-hero__inner">
          <p className="gk-hero__eyebrow">Tegallalang · Ubud · Bali</p>
          <h1 className="gk-hero__title">Pura Gunung Kawi Sebatu</h1>
          <p className="gk-hero__subtitle">
            Pura air yang tenang dengan mata air suci, kolam teratai, dan ikan koi —
            permata spiritual tersembunyi di utara Ubud.
          </p>
          <div className="gk-hero__actions">
            <button className="gk-btn" onClick={onExplore}>Jelajahi</button>
            <button className="gk-btn" onClick={onOpenMaps}>Lokasi →</button>
          </div>
        </div>
      </header>

      {/* ---- About ---- */}
      <section id="gk-about" className="gk-section">
        <div className="gk-container">
          <div className="gk-section__head">
            <p className="gk-section__eyebrow">Tentang</p>
            <h2 className="gk-section__title">Mengenal Pura Gunung Kawi Sebatu</h2>
          </div>

          <div className="gk-about__grid">
            <div ref={aboutMediaRef} className={`gk-about__media ${aboutIn ? 'gk-about__media--in' : ''}`}>
              <img src={ABOUT_IMG} alt="Pura Gunung Kawi Sebatu" loading="lazy" />
            </div>
            <div className="gk-about__text">
              <p>
                Pura Gunung Kawi Sebatu terletak di Desa Sebatu, Kecamatan Tegallalang,
                Kabupaten Gianyar, sekitar 12 km di utara Ubud. Berbeda dengan candi
                tebing Gunung Kawi di Tampaksiring, pura ini dikenal sebagai pura air
                (water temple) yang asri dan menenangkan.
              </p>
              <p>
                Keberadaannya tak lepas dari perjalanan rohani Rsi Markandeya pada sekitar
                abad ke-9. Dalam perjalanannya dari Desa Taro menuju Gunung Agung, sang Rsi
                beristirahat di lembah Pangkung Dewa dan menemukan tempat yang damai untuk
                memuja manifestasi Dewa Siwa dan Dewa Wisnu.
              </p>
              <p>
                Pura ini didedikasikan untuk Dewa Wisnu sebagai pemelihara. Daya tariknya
                adalah kolam-kolam berisi air jernih dari mata air alami, kolam teratai
                dengan patung Dewi Saraswati, serta kolam besar berisi ikan koi yang
                dikeramatkan — menciptakan suasana sejuk yang cocok untuk refleksi diri.
              </p>
            </div>
          </div>

          <div className="gk-location">
            <div className="gk-location__text">
              <h3>📍 Lokasi Pura</h3>
              <p>Desa Sebatu, Kecamatan Tegallalang, Kabupaten Gianyar, Bali.</p>
            </div>
            <button className="gk-btn gk-location__btn" onClick={onOpenMaps}>
              Klik di sini untuk buka di Google Maps
            </button>
          </div>

          <div className="gk-facts">
            <div className="gk-fact">
              <div className="gk-fact__icon">🕗</div>
              <div className="gk-fact__value">08.00–18.00</div>
              <div className="gk-fact__label">Jam Buka (WITA)</div>
            </div>
            <div className="gk-fact">
              <div className="gk-fact__icon">🎟️</div>
              <div className="gk-fact__value">Rp15.000</div>
              <div className="gk-fact__label">Dewasa · anak Rp8.000</div>
            </div>
            <div className="gk-fact">
              <div className="gk-fact__icon">🚗</div>
              <div className="gk-fact__value">±12 km</div>
              <div className="gk-fact__label">dari Ubud</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Gallery ---- */}
      <section id="gk-gallery" className="gk-section gk-gallery">
        <div className="gk-container">
          <div className="gk-section__head">
            <p className="gk-section__eyebrow">Galeri</p>
            <h2 className="gk-section__title">Keindahan Pura Gunung Kawi Sebatu</h2>
          </div>

          <div className="gk-gallery__grid">
            {GALLERY.slice(0, visible).map((g, i) => (
              <figure
                key={g.n}
                className="gk-gallery__item"
                onClick={() => onOpenPhoto(i)}
              >
                <img src={img(g.n, 600)} alt={g.cap} loading="lazy" />
                <figcaption className="gk-gallery__cap">{g.cap}</figcaption>
              </figure>
            ))}
          </div>

          {visible < GALLERY.length && (
            <div className="gk-gallery__more">
              <button className="gk-btn" onClick={onLoadMore}>
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="gk-footer">
        <div className="gk-container">
          <div className="gk-footer__brand">Gunung Kawi Sebatu</div>
          <p>Pura air yang tenang di Tegallalang, Gianyar, Bali.</p>
          <div className="gk-footer__info">
            <div>📍 Desa Sebatu, Tegallalang</div>
            <div>🕗 Buka <span>08.00–18.00 WITA</span></div>
            <div>🎟️ Tiket <span>Rp15.000</span></div>
          </div>
          <div className="gk-footer__copy">
            © 2024 Gunung Kawi Sebatu. Foto: Wikimedia Commons.
          </div>
        </div>
      </footer>

      {/* ---- Lightbox ---- */}
      {lightbox != null && (
        <div className="gk-lightbox" onClick={closeBox}>
          <button
            className="gk-lightbox__btn gk-lightbox__btn--close"
            aria-label="Tutup"
            onClick={() => { trackEvent('gk_lightbox_close', { label: 'Tutup foto' }); closeBox() }}
          >×</button>
          <button
            className="gk-lightbox__btn gk-lightbox__btn--prev"
            aria-label="Sebelumnya"
            onClick={(e) => { e.stopPropagation(); trackEvent('gk_lightbox_prev', { label: 'Foto sebelumnya' }); step(-1) }}
          >‹</button>
          <img
            className="gk-lightbox__img"
            src={img(GALLERY[lightbox].n, 1400)}
            alt={GALLERY[lightbox].cap}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="gk-lightbox__btn gk-lightbox__btn--next"
            aria-label="Berikutnya"
            onClick={(e) => { e.stopPropagation(); trackEvent('gk_lightbox_next', { label: 'Foto berikutnya' }); step(1) }}
          >›</button>
        </div>
      )}
    </div>
  )
}

export default GunungKawiContent
