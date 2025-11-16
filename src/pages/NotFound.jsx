import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Halaman Tidak Ditemukan | Portal Indonesia'
    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      navigate('/')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">404</h1>
          <p className="subtitle">Halaman Tidak Ditemukan</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <h2>Halaman yang Anda cari tidak ditemukan</h2>
              <p>
                Halaman ini tidak tersedia atau telah dipindahkan. 
                Anda akan diarahkan ke halaman utama dalam beberapa detik.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Portal Indonesia. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}

export default NotFound

