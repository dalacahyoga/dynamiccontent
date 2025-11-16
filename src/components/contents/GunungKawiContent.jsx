import React from 'react'
import '../../App.css'

function GunungKawiContent() {
  return (
    <>
      <header className="header">
        <div className="container">
          <h1 className="title">⛰️ Gunung Kawi Sebatu</h1>
          <p className="subtitle">Pura Air yang Indah dan Tenang di Gianyar, Bali</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <h2>Selamat Datang di Pura Gunung Kawi Sebatu</h2>
              <p>
                Pura Gunung Kawi Sebatu adalah salah satu pura air yang paling indah dan tenang 
                di Bali, terletak di Desa Sebatu, Kecamatan Tegallalang, Kabupaten Gianyar. 
                Pura ini didedikasikan untuk Dewa Wisnu dan Dewi Gangga, menawarkan pengalaman 
                spiritual yang mendalam dengan kolam-kolam air jernih, taman hijau yang rimbun, 
                dan ukiran-ukiran yang rumit.
              </p>
            </div>
          </section>

          <section className="info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">💧</div>
                <h3>Pura Air</h3>
                <p>
                  Pura Gunung Kawi Sebatu dikenal sebagai pura air dengan kolam-kolam yang 
                  dipenuhi air jernih dari mata air alami. Air suci (Tirta Amerta) di sini 
                  dipercaya memiliki kekuatan spiritual dan penyembuhan.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🕉️</div>
                <h3>Dewa Wisnu & Dewi Gangga</h3>
                <p>
                  Pura ini didedikasikan untuk Dewa Wisnu, manifestasi Ida Sang Hyang Widhi Wasa 
                  sebagai pemelihara, serta Dewi Gangga. Menciptakan suasana yang damai dan 
                  cocok untuk refleksi spiritual.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🏛️</div>
                <h3>Sejarah Rsi Markandeya</h3>
                <p>
                  Menurut sejarah, pura ini tidak dapat dipisahkan dari perjalanan rohani Rsi Markandeya 
                  pada abad ke-9 SM. Rsi Markandeya menemukan tempat yang damai di lembah Pangkung Dawa 
                  dan membuat ukiran candi untuk memuliakan Dewa Siwa dan Dewa Wisnu.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🌿</div>
                <h3>Keindahan Alam</h3>
                <p>
                  Pura ini dikelilingi oleh taman-taman hijau yang rimbun dengan ukiran-ukiran 
                  yang rumit, menciptakan suasana yang sangat tenang dan damai. Cocok untuk 
                  meditasi dan mencari ketenangan jiwa.
                </p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2 className="section-title">Fakta Menarik</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">Gianyar</div>
                <div className="stat-label">Lokasi</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">12 km</div>
                <div className="stat-label">Dari Ubud</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Abad ke-9 SM</div>
                <div className="stat-label">Sejarah</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Gunung Kawi Sebatu - Pura Air di Gianyar, Bali. Semua hak dilindungi.</p>
        </div>
      </footer>
    </>
  )
}

export default GunungKawiContent

