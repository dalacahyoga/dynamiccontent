import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseEnabled, usernameToEmail } from '../../config/supabase'
import { updateFavicon, ADMIN_SVG } from '../../utils/faviconManager'
import './Admin.css'

// localStorage fallback credentials (used only when Supabase is NOT configured)
const FALLBACK_USER = 'portfolio'
const FALLBACK_PASS = 'portfolio'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Administrator Login | Portal Indonesia'
    updateFavicon(ADMIN_SVG)

    // Redirect if already logged in
    if (supabaseEnabled) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) navigate('/admin/dashboard')
      })
    } else if (localStorage.getItem('adminLoggedIn') === 'true') {
      navigate('/admin/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (supabaseEnabled) {
      setBusy(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      })
      setBusy(false)
      if (error) setError('Username atau password salah!')
      else navigate('/admin/dashboard')
      return
    }

    // localStorage fallback
    if (username === FALLBACK_USER && password === FALLBACK_PASS) {
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminLoginTime', new Date().toISOString())
      navigate('/admin/dashboard')
    } else {
      setError('Username atau password salah!')
    }
  }

  return (
    <div className="admin-container login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Administrator</h1>
          <p>Portal Indonesia · {supabaseEnabled ? 'Supabase Auth' : 'Mode Lokal'}</p>
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
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={busy}>
            {busy ? 'Masuk…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
