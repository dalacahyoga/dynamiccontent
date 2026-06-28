import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { preloadContent } from './utils/contentManager'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

const render = () => root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Pull the shared active-content selection from Supabase into the local cache
// before first paint, so the right content shows immediately. Never block the
// app if Supabase is slow or unconfigured.
preloadContent().finally(render)
