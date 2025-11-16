import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Administrator Login | Portal Indonesia'
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (isLoggedIn) {
      navigate('/administrator/dashboard')
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === 'portfolio' && password === 'portfolio') {
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminLoginTime', new Date().toISOString())
      navigate('/administrator/dashboard')
    } else {
      setError('Username atau password salah!')
    }
  }

  return (
    <div className="admin-container login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Administrator</h1>
          <p>Portal Indonesia - Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Masuk
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

