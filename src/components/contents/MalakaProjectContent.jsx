import React from 'react'
import '../../App.css'

function MalakaProjectContent() {
  return (
    <>
      <header className="header">
        <div className="container">
          <h1 className="title">🏗️ Malaka Project</h1>
          <p className="subtitle">Inovasi dan Pembangunan Berkelanjutan</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <h2>Selamat Datang di Malaka Project</h2>
              <p>
                Malaka Project adalah sebuah proyek pembangunan dan inovasi yang bertujuan 
                untuk menciptakan solusi berkelanjutan dalam berbagai aspek kehidupan. 
                Proyek ini fokus pada pengembangan teknologi, infrastruktur, dan pemberdayaan 
                masyarakat untuk masa depan yang lebih baik.
              </p>
            </div>
          </section>

          <section className="info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">💡</div>
                <h3>Inovasi Teknologi</h3>
                <p>
                  Malaka Project mengembangkan berbagai inovasi teknologi yang ramah lingkungan 
                  dan berkelanjutan. Fokus pada solusi yang dapat diterapkan untuk meningkatkan 
                  kualitas hidup masyarakat.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🌱</div>
                <h3>Pembangunan Berkelanjutan</h3>
                <p>
                  Proyek ini mengedepankan prinsip pembangunan berkelanjutan yang memperhatikan 
                  aspek lingkungan, sosial, dan ekonomi. Setiap inisiatif dirancang untuk 
                  memberikan dampak positif jangka panjang.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🤝</div>
                <h3>Pemberdayaan Masyarakat</h3>
                <p>
                  Malaka Project tidak hanya fokus pada pembangunan fisik, tetapi juga pada 
                  pemberdayaan masyarakat melalui pelatihan, edukasi, dan penciptaan 
                  peluang kerja yang berkelanjutan.
                </p>
              </div>

              <div className="info-card">
                <div className="card-icon">🎯</div>
                <h3>Visi Masa Depan</h3>
                <p>
                  Dengan pendekatan yang holistik dan inovatif, Malaka Project bertujuan 
                  menciptakan ekosistem yang mendukung pertumbuhan ekonomi, pelestarian 
                  lingkungan, dan kesejahteraan sosial.
                </p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2 className="section-title">Fakta Menarik</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">2024</div>
                <div className="stat-label">Tahun Dimulai</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Berkelanjutan</div>
                <div className="stat-label">Fokus Utama</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">Inovatif</div>
                <div className="stat-label">Pendekatan</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Malaka Project - Inovasi untuk Masa Depan. Semua hak dilindungi.</p>
        </div>
      </footer>
    </>
  )
}

export default MalakaProjectContent

