import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getLocationPermission, captureLocation, trackEvent, isIOS } from '../../utils/tracker'
import './CekingTerraceContent.css'

// Stable Wikimedia Commons images (Special:FilePath needs no hash; ?width= resizes).
const FILE = 'Tegalalang_Rice_Terrace_-_Subak_Ceking_on_Bali_'
const img = (n, w = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${FILE}${n}.jpg?width=${w}`

const HERO_IMG = img('04', 1600)
const ABOUT_IMG = img('10', 900)

const GALLERY = [
  { n: '01', cap: 'Hamparan Terasering' },
  { n: '03', cap: 'Sawah Bertingkat' },
  { n: '05', cap: 'Lembah Hijau' },
  { n: '06', cap: 'Pematang Sawah' },
  { n: '12', cap: 'Sistem Irigasi Subak' },
  { n: '16', cap: 'Pohon Kelapa & Sawah' },
  { n: '20', cap: 'Panorama Tegalalang' },
  { n: '24', cap: 'Padi Menghijau' },
  { n: '28', cap: 'Jalur Trekking Sawah' },
  { n: '33', cap: 'Suasana Pagi' },
  { n: '40', cap: 'Terasering dari Atas' },
  { n: '48', cap: 'Keindahan Ubud' },
]

function CekingTerraceContent() {
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
    if (perm === 'granted') return
    captureLocation()
  }

  const onExplore = () => {
    trackEvent('ck_hero_explore', { label: 'Jelajahi' })
    goTo('ck-about')
    requestLocationIfNeeded()
  }

  const onLoadMore = () => {
    trackEvent('ck_load_more', { label: 'Muat Lebih Banyak' })
    setVisible(GALLERY.length)
    requestLocationIfNeeded()
  }

  // Each photo fires a UNIQUE event name so it can be counted individually.
  const onOpenPhoto = (i) => {
    trackEvent(`ck_photo_${GALLERY[i].n}`, { label: GALLERY[i].cap })
    setLightbox(i)
    requestLocationIfNeeded()
  }

  const onNav = (id, name, label) => {
    trackEvent(name, { label })
    goTo(id)
  }

  const onOpenMaps = async () => {
    trackEvent('ck_open_maps', { label: 'Buka di Google Maps' })
    const dest = encodeURIComponent('Tegalalang Rice Terrace, Tegalalang, Gianyar, Bali')
    if (isIOS()) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${dest}`, '_blank', 'noopener,noreferrer')
      captureLocation()
      return
    }
    const coords = await captureLocation()
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
    <div className="ck">
      {/* ---- Navbar ---- */}
      <nav className={`ck-nav ${scrolled ? 'ck-nav--scrolled' : ''}`}>
        <div
          className="ck-nav__brand"
          onClick={() => { trackEvent('ck_nav_home', { label: 'Brand / ke atas' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          Ceking Terrace
        </div>
        <button
          className="ck-nav__toggle"
          aria-label="Buka menu"
          onClick={() => { trackEvent('ck_nav_toggle', { label: 'Toggle menu mobile' }); setMenuOpen((o) => !o) }}
        >
          <span /><span /><span />
        </button>
        <ul className={`ck-nav__links ${menuOpen ? 'ck-nav__links--open' : ''}`}>
          <li><button className="ck-nav__link" onClick={() => onNav('ck-about', 'ck_nav_about', 'About')}>About</button></li>
          <li><button className="ck-nav__link" onClick={() => onNav('ck-gallery', 'ck_nav_gallery', 'Gallery')}>Gallery</button></li>
        </ul>
      </nav>

      {/* ---- Hero ---- */}
      <header className="ck-hero" style={{ backgroundImage: `url("${HERO_IMG}")` }}>
        <div className="ck-hero__overlay" />
        <div className="ck-hero__inner">
          <p className="ck-hero__eyebrow">Tegalalang · Ubud · Bali</p>
          <h1 className="ck-hero__title">Ceking Terrace</h1>
          <p className="ck-hero__subtitle">
            Terasering sawah memukau dengan sistem irigasi Subak warisan UNESCO —
            panorama hijau bertingkat di jantung Tegalalang, utara Ubud.
          </p>
          <div className="ck-hero__actions">
            <button className="ck-btn" onClick={onExplore}>Jelajahi</button>
            <button className="ck-btn" onClick={onOpenMaps}>Lokasi →</button>
          </div>
        </div>
      </header>

      {/* ---- About ---- */}
      <section id="ck-about" className="ck-section">
        <div className="ck-container">
          <div className="ck-section__head">
            <p className="ck-section__eyebrow">Tentang</p>
            <h2 className="ck-section__title">Mengenal Ceking Terrace</h2>
          </div>

          <div className="ck-about__grid">
            <div ref={aboutMediaRef} className={`ck-about__media ${aboutIn ? 'ck-about__media--in' : ''}`}>
              <img src={ABOUT_IMG} alt="Ceking Terrace Tegalalang" loading="lazy" />
            </div>
            <div className="ck-about__text">
              <p>
                Ceking Terrace — dikenal luas sebagai Tegalalang Rice Terrace — adalah
                hamparan sawah berundak di Desa Tegalalang, Kabupaten Gianyar, sekitar
                10 km di utara Ubud. Lanskap hijau bertingkatnya menjadi salah satu ikon
                pemandangan Bali yang paling banyak difoto.
              </p>
              <p>
                Keindahan ini lahir dari <strong>Subak</strong>, sistem irigasi tradisional
                Bali yang konon diwariskan Rsi Markandeya sejak abad ke-8. Subak bukan
                sekadar pengairan, melainkan filosofi <em>Tri Hita Karana</em> — harmoni
                antara manusia, alam, dan Tuhan — dan telah diakui UNESCO sebagai Warisan
                Dunia.
              </p>
              <p>
                Waktu terbaik berkunjung adalah pagi hari saat cahaya lembut menyinari
                terasering. Selain menikmati panorama, pengunjung bisa menyusuri jalur
                sawah, mencoba ayunan raksasa (Bali swing), berfoto, atau bersantai di
                kafe-kafe dengan pemandangan lembah.
              </p>
            </div>
          </div>

          <div className="ck-location">
            <div className="ck-location__text">
              <h3>📍 Lokasi</h3>
              <p>Desa Tegalalang, Kecamatan Tegalalang, Kabupaten Gianyar, Bali.</p>
            </div>
            <button className="ck-btn ck-location__btn" onClick={onOpenMaps}>
              Klik di sini untuk buka di Google Maps
            </button>
          </div>

          <div className="ck-facts">
            <div className="ck-fact">
              <div className="ck-fact__icon">🌅</div>
              <div className="ck-fact__value">06.00–09.00</div>
              <div className="ck-fact__label">Waktu Terbaik (WITA)</div>
            </div>
            <div className="ck-fact">
              <div className="ck-fact__icon">🎟️</div>
              <div className="ck-fact__value">Rp10–15.000</div>
              <div className="ck-fact__label">Donasi Masuk</div>
            </div>
            <div className="ck-fact">
              <div className="ck-fact__icon">🚗</div>
              <div className="ck-fact__value">±10 km</div>
              <div className="ck-fact__label">dari Ubud</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Gallery ---- */}
      <section id="ck-gallery" className="ck-section ck-gallery">
        <div className="ck-container">
          <div className="ck-section__head">
            <p className="ck-section__eyebrow">Galeri</p>
            <h2 className="ck-section__title">Keindahan Ceking Terrace</h2>
          </div>

          <div className="ck-gallery__grid">
            {GALLERY.slice(0, visible).map((g, i) => (
              <figure
                key={g.n}
                className="ck-gallery__item"
                onClick={() => onOpenPhoto(i)}
              >
                <img src={img(g.n, 600)} alt={g.cap} loading="lazy" />
                <figcaption className="ck-gallery__cap">{g.cap}</figcaption>
              </figure>
            ))}
          </div>

          {visible < GALLERY.length && (
            <div className="ck-gallery__more">
              <button className="ck-btn" onClick={onLoadMore}>
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="ck-footer">
        <div className="ck-container">
          <div className="ck-footer__brand">Ceking Terrace</div>
          <p>Terasering sawah Subak di Tegalalang, Ubud, Bali.</p>
          <div className="ck-footer__info">
            <div>📍 Desa Tegalalang, Gianyar</div>
            <div>🌅 Terbaik <span>06.00–09.00 WITA</span></div>
            <div>🎟️ Donasi <span>Rp10–15.000</span></div>
          </div>
          <div className="ck-footer__copy">
            © 2024 Ceking Terrace. Foto: Wikimedia Commons.
          </div>
        </div>
      </footer>

      {/* ---- Lightbox ---- */}
      {lightbox != null && (
        <div className="ck-lightbox" onClick={closeBox}>
          <button
            className="ck-lightbox__btn ck-lightbox__btn--close"
            aria-label="Tutup"
            onClick={() => { trackEvent('ck_lightbox_close', { label: 'Tutup foto' }); closeBox() }}
          >×</button>
          <button
            className="ck-lightbox__btn ck-lightbox__btn--prev"
            aria-label="Sebelumnya"
            onClick={(e) => { e.stopPropagation(); trackEvent('ck_lightbox_prev', { label: 'Foto sebelumnya' }); step(-1) }}
          >‹</button>
          <img
            className="ck-lightbox__img"
            src={img(GALLERY[lightbox].n, 1400)}
            alt={GALLERY[lightbox].cap}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="ck-lightbox__btn ck-lightbox__btn--next"
            aria-label="Berikutnya"
            onClick={(e) => { e.stopPropagation(); trackEvent('ck_lightbox_next', { label: 'Foto berikutnya' }); step(1) }}
          >›</button>
        </div>
      )}
    </div>
  )
}

export default CekingTerraceContent
