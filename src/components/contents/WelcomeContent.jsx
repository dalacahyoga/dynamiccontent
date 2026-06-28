import React from 'react'
import { ISLAND_SVG, GAPURA_SVG, RICE_TERRACE_SVG } from '../../utils/faviconManager'
import './WelcomeContent.css'

const svgUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`

const HIGHLIGHTS = [
  { icon: ISLAND_SVG, title: 'Pulau Pari', desc: 'Surga tropis berpasir putih di Kepulauan Seribu.' },
  { icon: GAPURA_SVG, title: 'Gunung Kawi Sebatu', desc: 'Pura air yang tenang di Tegallalang, Ubud.' },
  { icon: RICE_TERRACE_SVG, title: 'Ceking Terrace', desc: 'Terasering sawah Subak yang memukau di Ubud.' },
]

function WelcomeContent() {
  return (
    <div className="nc">
      {/* ---- Hero ---- */}
      <header className="nc-hero">
        <div className="nc-hero__inner">
          <p className="nc-hero__eyebrow">Portal Indonesia</p>
          <h1 className="nc-hero__title">Keindahan & Kebanggaan Nusantara</h1>
          <p className="nc-hero__subtitle">
            Jelajahi pesona destinasi Indonesia. Saat ini konten belum dipilih —
            administrator dapat menampilkan salah satu destinasi melalui dashboard.
          </p>
        </div>
      </header>

      {/* ---- Highlights ---- */}
      <section className="nc-section">
        <div className="nc-container">
          <div className="nc-section__head">
            <p className="nc-section__eyebrow">Destinasi</p>
            <h2 className="nc-section__title">Pilihan Konten</h2>
          </div>
          <div className="nc-cards">
            {HIGHLIGHTS.map((h) => (
              <div className="nc-card" key={h.title}>
                <img className="nc-card__icon" src={svgUri(h.icon)} alt={h.title} />
                <h3 className="nc-card__title">{h.title}</h3>
                <p className="nc-card__desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="nc-footer">
        <div className="nc-container">
          <div className="nc-footer__brand">Portal Indonesia</div>
          <p>Keindahan dan Kebanggaan Nusantara.</p>
          <div className="nc-footer__copy">© 2024 Portal Indonesia. Semua hak dilindungi.</div>
        </div>
      </footer>
    </div>
  )
}

export default WelcomeContent
