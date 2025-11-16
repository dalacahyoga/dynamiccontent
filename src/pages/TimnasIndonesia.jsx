import React, { useEffect } from 'react'
import '../App.css'

function TimnasIndonesia() {
  useEffect(() => {
    document.title = 'Timnas Indonesia - Garuda Muda | Portal Indonesia'
  }, [])
  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">🇮🇩 Timnas Indonesia</h1>
          <p className="subtitle">Garuda Muda - Kebanggaan Bangsa</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <h2>Selamat Datang di Website Timnas Indonesia</h2>
              <p>
                Tim Nasional Sepak Bola Indonesia adalah tim yang mewakili Indonesia 
                dalam kompetisi sepak bola internasional. Tim ini berada di bawah 
                naungan Persatuan Sepak Bola Seluruh Indonesia (PSSI).
              </p>
            </div>
          </section>

          <section className="info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">🏆</div>
                <h3>Prestasi</h3>
                <p>
                  Timnas Indonesia telah meraih berbagai prestasi di level regional 
                  Asia Tenggara, termasuk juara Piala AFF dan berbagai turnamen 
                  internasional lainnya.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">⚽</div>
                <h3>Sejarah</h3>
                <p>
                  Timnas Indonesia memiliki sejarah panjang dalam sepak bola internasional, 
                  dengan partisipasi aktif di berbagai kompetisi seperti Piala Asia, 
                  SEA Games, dan Piala AFF.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">👥</div>
                <h3>Pemain</h3>
                <p>
                  Timnas Indonesia terdiri dari pemain-pemain terbaik yang dipilih dari 
                  berbagai klub di Indonesia dan juga pemain diaspora yang memiliki 
                  kualitas internasional.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🎯</div>
                <h3>Visi</h3>
                <p>
                  Meningkatkan prestasi sepak bola Indonesia di kancah internasional 
                  dan menjadi kebanggaan seluruh rakyat Indonesia di dunia sepak bola.
                </p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2 className="section-title">Fakta Menarik</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">1938</div>
                <div className="stat-label">Tahun Bergabung FIFA</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">AFF</div>
                <div className="stat-label">Juara Piala AFF</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Asia</div>
                <div className="stat-label">Partisipasi Piala Asia</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Timnas Indonesia - Garuda Muda. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}

export default TimnasIndonesia

