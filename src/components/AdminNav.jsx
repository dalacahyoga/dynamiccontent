import React, { useState } from 'react'
import './AdminNav.css'

function AdminNav({ activeTab, onTabChange, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleTabClick = (tab) => {
    onTabChange(tab)
    setIsMenuOpen(false) // Close menu on mobile after selection
  }

  const handleLogout = () => {
    setIsMenuOpen(false)
    onLogout()
  }

  return (
    <nav className="admin-nav">
      <div className="admin-nav-container">
        <div className="admin-nav-brand">
          <span className="brand-icon">🔐</span>
          <span className="brand-text">Administrator</span>
        </div>

        {/* Desktop Menu */}
        <div className="admin-nav-menu desktop-menu">
          <button
            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => handleTabClick('content')}
          >
            ⚙️ Pengaturan Konten
          </button>
          <button
            className={`nav-item ${activeTab === 'visitors' ? 'active' : ''}`}
            onClick={() => handleTabClick('visitors')}
          >
            👥 Daftar Pengunjung
          </button>
          <button
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            🚪 Keluar
          </button>
        </div>

        {/* Hamburger Button */}
        <button className="hamburger-button" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <button
          className={`mobile-nav-item ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => handleTabClick('content')}
        >
          ⚙️ Pengaturan Konten
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'visitors' ? 'active' : ''}`}
          onClick={() => handleTabClick('visitors')}
        >
          👥 Daftar Pengunjung
        </button>
        <button
          className="mobile-nav-item logout-item"
          onClick={handleLogout}
        >
          🚪 Keluar
        </button>
      </div>
    </nav>
  )
}

export default AdminNav

