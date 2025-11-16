import React from 'react'
import '../../App.css'

function CekingTerraceContent() {
  return (
    <>
      <header className="header">
        <div className="container">
          <h1 className="title">🌾 Ceking Terrace</h1>
          <p className="subtitle">Keindahan Terasering Sawah di Ubud, Bali</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <h2>Selamat Datang di Ceking Terrace</h2>
              <p>
                Ceking Terrace adalah salah satu destinasi wisata terkenal di Ubud, Bali, 
                yang menawarkan pemandangan terasering sawah yang menakjubkan. Tempat ini 
                menjadi salah satu spot foto favorit para wisatawan karena keindahan 
                alamnya yang memukau dan suasana pedesaan yang masih asri.
              </p>
            </div>
          </section>

          <section className="info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">🌾</div>
                <h3>Terasering Sawah</h3>
                <p>
                  Ceking Terrace menampilkan sistem terasering sawah tradisional Bali yang 
                  sangat indah dan terawat. Pemandangan hijau yang berundak-undak menciptakan 
                  panorama yang memukau, terutama saat matahari terbit atau terbenam.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">📸</div>
                <h3>Spot Foto Terkenal</h3>
                <p>
                  Tempat ini menjadi salah satu spot foto paling populer di Bali. Banyak 
                  wisatawan yang datang untuk mengabadikan momen dengan latar belakang 
                  terasering sawah yang hijau dan indah.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🚶</div>
                <h3>Jalan Setapak</h3>
                <p>
                  Pengunjung dapat berjalan di sepanjang jalan setapak yang membelah 
                  sawah-sawah terasering. Perjalanan ini memberikan pengalaman langsung 
                  menikmati keindahan alam dan budaya pertanian tradisional Bali.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🌅</div>
                <h3>Sunrise & Sunset</h3>
                <p>
                  Ceking Terrace menawarkan pemandangan matahari terbit dan terbenam yang 
                  spektakuler. Saat-saat ini adalah waktu terbaik untuk mengunjungi tempat 
                  ini dan menikmati keindahan alam yang luar biasa.
                </p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2 className="section-title">Fakta Menarik</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">Ubud</div>
                <div className="stat-label">Lokasi</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Tegallalang</div>
                <div className="stat-label">Area</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Wisata Alam</div>
                <div className="stat-label">Jenis</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Ceking Terrace - Keindahan Terasering Ubud. Semua hak dilindungi.</p>
        </div>
      </footer>
    </>
  )
}

export default CekingTerraceContent

