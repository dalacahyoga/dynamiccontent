import React, { useEffect } from 'react'
import '../App.css'

function PulauSeribu() {
  useEffect(() => {
    document.title = 'Pulau Seribu - Surga Tropis di Utara Jakarta | Portal Indonesia'
  }, [])
  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">🏝️ Pulau Seribu</h1>
          <p className="subtitle">Surga Tropis di Utara Jakarta</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <h2>Selamat Datang di Kepulauan Seribu</h2>
              <p>
                Kepulauan Seribu adalah sebuah kabupaten administratif di Provinsi DKI Jakarta, 
                Indonesia. Terdiri dari gugusan pulau-pulau kecil di Laut Jawa, kepulauan ini 
                menawarkan keindahan alam tropis yang memukau dengan pantai berpasir putih, 
                air laut yang jernih, dan kehidupan bawah laut yang kaya.
              </p>
            </div>
          </section>

          <section className="info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">🌊</div>
                <h3>Keindahan Alam</h3>
                <p>
                  Pulau Seribu menawarkan pemandangan laut yang menakjubkan dengan air biru 
                  jernih, terumbu karang yang indah, dan berbagai spesies ikan tropis. 
                  Perfect untuk snorkeling dan diving.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🏖️</div>
                <h3>Pantai Eksotis</h3>
                <p>
                  Setiap pulau memiliki karakteristik pantai yang unik, dari pasir putih 
                  yang halus hingga pantai dengan batu karang yang menarik. Cocok untuk 
                  berjemur, berenang, dan aktivitas air lainnya.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🐠</div>
                <h3>Kehidupan Laut</h3>
                <p>
                  Kepulauan Seribu adalah rumah bagi berbagai biota laut termasuk ikan hias, 
                  terumbu karang, dan bahkan penyu. Area ini merupakan salah satu destinasi 
                  diving terbaik di Indonesia.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">⛵</div>
                <h3>Aktivitas Wisata</h3>
                <p>
                  Berbagai aktivitas menarik tersedia seperti snorkeling, diving, fishing, 
                  island hopping, dan menikmati sunset yang spektakuler. Cocok untuk 
                  liburan keluarga atau romantis.
                </p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="section-title">Pulau-Pulau Populer</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">🏝️</div>
                <h3>Pulau Pramuka</h3>
                <p>
                  Ibu kota Kabupaten Kepulauan Seribu dengan fasilitas lengkap, 
                  pantai yang indah, dan pusat konservasi penyu.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🏝️</div>
                <h3>Pulau Tidung</h3>
                <p>
                  Pulau populer dengan jembatan cinta (Love Bridge) yang menghubungkan 
                  Pulau Tidung Besar dan Tidung Kecil.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🏝️</div>
                <h3>Pulau Pari</h3>
                <p>
                  Destinasi favorit dengan pantai pasir putih, spot snorkeling yang 
                  menakjubkan, dan resort yang nyaman.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🏝️</div>
                <h3>Pulau Sepa</h3>
                <p>
                  Pulau pribadi dengan resort eksklusif, pantai yang sangat bersih, 
                  dan spot diving kelas dunia.
                </p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2 className="section-title">Fakta Menarik</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">110+</div>
                <div className="stat-label">Jumlah Pulau</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">45km</div>
                <div className="stat-label">Jarak dari Jakarta</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Tropis</div>
                <div className="stat-label">Iklim</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Pulau Seribu - Surga Tropis Indonesia. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}

export default PulauSeribu

