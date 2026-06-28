import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getLocationPermission, captureLocation, trackEvent } from '../../utils/tracker'
import './PulauPariContent.css'

// Stable Wikimedia Commons images (Special:FilePath needs no hash; ?width= resizes).
const img = (file, w = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`

const HERO_IMG = img('Pari Island Pier.jpg', 1600)
const ABOUT_IMG = img('Pulau Pari Kepulauan Seribu.jpg', 900)

const GALLERY = [
  { f: 'Pantai Perawan Pulau Pari Kepulauan Seribu.jpg', cap: 'Pantai Pasir Perawan' },
  { f: 'Pantai bintang pulau pari.jpg', cap: 'Pantai Bintang' },
  { f: 'East side of Pari Island, Kepulauan Seribu National Park.jpg', cap: 'Sisi Timur Pulau' },
  { f: 'Trailing on Tanjung Rengge Beach, Pari Island.jpg', cap: 'Pantai Tanjung Rengge' },
  { f: 'Pelabuhan Pulau Pari.jpg', cap: 'Pelabuhan' },
  { f: 'Pulau Pari atau Pulau Merak.jpg', cap: 'Panorama Pulau' },
  { f: 'Biota pantai pulau Pari Kepulauan Seribu (Taman Nasional Kepulauan Seribu).jpg', cap: 'Biota Laut' },
  { f: 'Pulau pari.jpg', cap: 'Suasana Pulau Pari' },
  { f: 'Papan Nama Pulau Pari.jpg', cap: 'Gerbang Pulau Pari' },
]

function PulauPariContent() {
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
    trackEvent('pp_hero_explore', { label: 'Jelajahi' })
    goTo('pp-about')
    requestLocationIfNeeded()
  }

  const onLoadMore = () => {
    trackEvent('pp_load_more', { label: 'Muat Lebih Banyak' })
    setVisible(GALLERY.length)
    requestLocationIfNeeded()
  }

  // Each photo fires a UNIQUE event name so it can be counted individually.
  const onOpenPhoto = (i) => {
    trackEvent(`pp_photo_${i + 1}`, { label: GALLERY[i].cap })
    setLightbox(i)
    requestLocationIfNeeded()
  }

  const onNav = (id, name, label) => {
    trackEvent(name, { label })
    goTo(id)
  }

  const onOpenMaps = async () => {
    trackEvent('pp_open_maps', { label: 'Buka di Google Maps' })
    const dest = encodeURIComponent('Pulau Pari, Kepulauan Seribu, DKI Jakarta')
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
    <div className="pp">
      {/* ---- Navbar ---- */}
      <nav className={`pp-nav ${scrolled ? 'pp-nav--scrolled' : ''}`}>
        <div
          className="pp-nav__brand"
          onClick={() => { trackEvent('pp_nav_home', { label: 'Brand / ke atas' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          Pulau Pari
        </div>
        <button
          className="pp-nav__toggle"
          aria-label="Buka menu"
          onClick={() => { trackEvent('pp_nav_toggle', { label: 'Toggle menu mobile' }); setMenuOpen((o) => !o) }}
        >
          <span /><span /><span />
        </button>
        <ul className={`pp-nav__links ${menuOpen ? 'pp-nav__links--open' : ''}`}>
          <li><button className="pp-nav__link" onClick={() => onNav('pp-about', 'pp_nav_about', 'About')}>About</button></li>
          <li><button className="pp-nav__link" onClick={() => onNav('pp-gallery', 'pp_nav_gallery', 'Gallery')}>Gallery</button></li>
        </ul>
      </nav>

      {/* ---- Hero ---- */}
      <header className="pp-hero" style={{ backgroundImage: `url("${HERO_IMG}")` }}>
        <div className="pp-hero__overlay" />
        <div className="pp-hero__inner">
          <p className="pp-hero__eyebrow">Kepulauan Seribu · Jakarta</p>
          <h1 className="pp-hero__title">Pulau Pari</h1>
          <p className="pp-hero__subtitle">
            Surga tropis berpasir putih dengan laguna jernih, Pantai Pasir Perawan,
            dan senja memukau — hanya sejam dari Jakarta.
          </p>
          <div className="pp-hero__actions">
            <button className="pp-btn" onClick={onExplore}>Jelajahi</button>
            <button className="pp-btn" onClick={onOpenMaps}>Lokasi →</button>
          </div>
        </div>
      </header>

      {/* ---- About ---- */}
      <section id="pp-about" className="pp-section">
        <div className="pp-container">
          <div className="pp-section__head">
            <p className="pp-section__eyebrow">Tentang</p>
            <h2 className="pp-section__title">Mengenal Pulau Pari</h2>
          </div>

          <div className="pp-about__grid">
            <div ref={aboutMediaRef} className={`pp-about__media ${aboutIn ? 'pp-about__media--in' : ''}`}>
              <img src={ABOUT_IMG} alt="Pulau Pari Kepulauan Seribu" loading="lazy" />
            </div>
            <div className="pp-about__text">
              <p>
                Pulau Pari adalah salah satu pulau di gugusan Kepulauan Seribu, DKI Jakarta,
                dengan luas sekitar 40 hektare. Namanya diambil dari bentuk geografisnya yang
                menyerupai ikan pari bila dilihat dari udara.
              </p>
              <p>
                Ikon utamanya adalah <strong>Pantai Pasir Perawan</strong> — nama yang muncul
                sekitar tahun 2010 karena pantai ini dulu masih sangat alami dan jarang
                tersentuh. Pasirnya putih lembut, lagunanya dangkal dan jernih, sehingga aman
                untuk bermain air, sementara senjanya menjadi salah satu yang terindah di
                Kepulauan Seribu.
              </p>
              <p>
                Selain berpantai, pengunjung bisa snorkeling menikmati terumbu karang dan ikan
                tropis, menyusuri kawasan mangrove dengan perahu kecil, bersepeda mengelilingi
                pulau, atau sekadar bersantai. Akses tercepat lewat Pelabuhan Kali Adem (Muara
                Angke) atau kapal cepat dari Marina Ancol.
              </p>
            </div>
          </div>

          <div className="pp-location">
            <div className="pp-location__text">
              <h3>📍 Lokasi</h3>
              <p>Kepulauan Seribu Selatan, DKI Jakarta — ±1 jam dari Jakarta via kapal.</p>
            </div>
            <button className="pp-btn pp-location__btn" onClick={onOpenMaps}>
              Klik di sini untuk buka di Google Maps
            </button>
          </div>

          <div className="pp-facts">
            <div className="pp-fact">
              <div className="pp-fact__icon">⛴️</div>
              <div className="pp-fact__value">±45–90 mnt</div>
              <div className="pp-fact__label">Kapal dari Jakarta</div>
            </div>
            <div className="pp-fact">
              <div className="pp-fact__icon">🎟️</div>
              <div className="pp-fact__value">Rp10–15.000</div>
              <div className="pp-fact__label">Tiket Masuk Pantai</div>
            </div>
            <div className="pp-fact">
              <div className="pp-fact__icon">🏝️</div>
              <div className="pp-fact__value">±40 ha</div>
              <div className="pp-fact__label">Luas Pulau</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Gallery ---- */}
      <section id="pp-gallery" className="pp-section pp-gallery">
        <div className="pp-container">
          <div className="pp-section__head">
            <p className="pp-section__eyebrow">Galeri</p>
            <h2 className="pp-section__title">Keindahan Pulau Pari</h2>
          </div>

          <div className="pp-gallery__grid">
            {GALLERY.slice(0, visible).map((g, i) => (
              <figure
                key={g.f}
                className="pp-gallery__item"
                onClick={() => onOpenPhoto(i)}
              >
                <img src={img(g.f, 600)} alt={g.cap} loading="lazy" />
                <figcaption className="pp-gallery__cap">{g.cap}</figcaption>
              </figure>
            ))}
          </div>

          {visible < GALLERY.length && (
            <div className="pp-gallery__more">
              <button className="pp-btn" onClick={onLoadMore}>
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="pp-footer">
        <div className="pp-container">
          <div className="pp-footer__brand">Pulau Pari</div>
          <p>Surga tropis di Kepulauan Seribu, Jakarta.</p>
          <div className="pp-footer__info">
            <div>📍 Kepulauan Seribu, Jakarta</div>
            <div>⛴️ <span>±45–90 menit</span> dari Jakarta</div>
            <div>🎟️ Tiket <span>Rp10–15.000</span></div>
          </div>
          <div className="pp-footer__copy">
            © 2024 Pulau Pari. Foto: Wikimedia Commons.
          </div>
        </div>
      </footer>

      {/* ---- Lightbox ---- */}
      {lightbox != null && (
        <div className="pp-lightbox" onClick={closeBox}>
          <button
            className="pp-lightbox__btn pp-lightbox__btn--close"
            aria-label="Tutup"
            onClick={() => { trackEvent('pp_lightbox_close', { label: 'Tutup foto' }); closeBox() }}
          >×</button>
          <button
            className="pp-lightbox__btn pp-lightbox__btn--prev"
            aria-label="Sebelumnya"
            onClick={(e) => { e.stopPropagation(); trackEvent('pp_lightbox_prev', { label: 'Foto sebelumnya' }); step(-1) }}
          >‹</button>
          <img
            className="pp-lightbox__img"
            src={img(GALLERY[lightbox].f, 1400)}
            alt={GALLERY[lightbox].cap}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="pp-lightbox__btn pp-lightbox__btn--next"
            aria-label="Berikutnya"
            onClick={(e) => { e.stopPropagation(); trackEvent('pp_lightbox_next', { label: 'Foto berikutnya' }); step(1) }}
          >›</button>
        </div>
      )}
    </div>
  )
}

export default PulauPariContent
