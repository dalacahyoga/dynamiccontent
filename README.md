# Portal Indonesia Website

Website dinamis tentang Indonesia dengan berbagai konten menarik, dibuat dengan Vite + React.

## ✨ Fitur

- 🎨 UI modern dan responsif
- ⚡ Fast development dengan Vite
- 📱 Mobile-friendly
- 🗺️ Dynamic routing dengan React Router
- 📝 Dynamic content management (admin panel)
- 🔄 Dynamic page title & favicon berdasarkan konten
- 📊 User access tracking + event tracking dengan cloud sync (Supabase)
- 🌐 Multiple content options:
  - ⚽ Timnas Indonesia
  - 🏝️ Pulau Seribu
  - ⛰️ Gunung Kawi Sebatu
  - 🏗️ Malaka Project
  - 🌾 Ceking Terrace

## Instalasi

```bash
npm install
```

## Menjalankan Development Server

```bash
npm run dev
```

## Build untuk Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## 🗺️ Routing

Website ini menggunakan React Router untuk routing dinamis:

- `/` - Halaman Home (konten dinamis berdasarkan admin setting)
- `/timnas-indonesia` - Halaman Timnas Indonesia (jika aktif)
- `/pulau-seribu` - Halaman Pulau Seribu (jika aktif)
- `/admin` - Halaman Login Administrator
- `/admin/dashboard` - Dashboard Administrator (memerlukan login)

## 🔐 Administrator Access

Halaman administrator dapat diakses dengan kredensial berikut:

- **Username:** `portfolio`
- **Password:** `portfolio`

> Saat Supabase aktif, login diverifikasi oleh **Supabase Auth** (lihat
> [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)). Tanpa Supabase, dipakai
> kredensial fallback `portfolio` / `portfolio` (mode lokal).

### Dashboard Features

Setelah login, dashboard punya 3 tab:

#### ⚙️ Pengaturan Konten Home
- Pilih konten yang akan ditampilkan di halaman home
- Pilihan konten: Timnas Indonesia, Pulau Seribu, Gunung Kawi Sebatu, Malaka Project, Ceking Terrace
- Hanya bisa memilih 1 konten aktif (tersinkron ke semua device via Supabase)

#### 👥 Daftar Pengunjung
- Kartu per-pengunjung (expandable): device, OS, browser, source, alias
- Lokasi (latitude/longitude + nama kota + link Google Maps)
- Timeline aktivitas (halaman + event), ringkasan source/device
- Auto-refresh setiap 10 detik

#### 📈 Event Tracker
- Rekap event per jenis + breakdown target, plus daftar event terbaru

## 📊 Sistem Logging & Cloud Sync

### ✅ Cloud Sync dengan Supabase (Recommended)

Saat env var Supabase di-set, data dibagi ke semua device:

- ✅ **Auth aman** - password diverifikasi Supabase, bukan ditanam di front-end
- ✅ **Terpusat** - semua device melihat pengunjung & event yang sama
- ✅ **Real-time** - auto-refresh di dashboard
- ✅ **Gratis** - free tier tersedia
- ✅ **RLS** - anon hanya boleh mencatat, hanya admin yang boleh membaca/hapus

**Panduan Setup:** Lihat [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)
(schema SQL, RLS, dan pembuatan user admin).

### ⚠️ Tanpa Cloud Sync (LocalStorage Only)

Jika Supabase belum di-setup, sistem otomatis fallback ke localStorage:

- ✅ Setiap device mencatat data aksesnya sendiri
- ❌ Device A TIDAK BISA melihat data dari Device B
- ❌ Data hanya tersimpan di browser masing-masing device
- ❌ Login pakai kredensial fallback `portfolio` / `portfolio`

## 🛠️ Teknologi

- **React 18** - UI Framework
- **React Router DOM 6** - Routing
- **Vite 5** - Build tool & dev server
- **CSS3** - Styling dengan efek modern (backdrop-filter, gradients)
- **Supabase** - Auth + Postgres (cloud sync pengunjung, event, & konten)
- **OpenStreetMap Nominatim** - Reverse geocoding untuk nama lokasi

## 🚀 Deploy ke Netlify

Website ini sudah dikonfigurasi untuk deploy ke Netlify dengan mudah.

### Cara Deploy

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Login ke Netlify**
   - Kunjungi [https://app.netlify.com](https://app.netlify.com)
   - Login dengan GitHub account

3. **Import Project dari GitHub**
   - Klik "Add new site" → "Import an existing project"
   - Pilih "Deploy with GitHub"
   - Authorize Netlify untuk akses GitHub
   - Pilih repository: `dalacahyoga/dynamiccontent`

4. **Konfigurasi Build Settings**
   - Build command: `npm run build` (sudah otomatis)
   - Publish directory: `dist` (sudah otomatis)
   - Klik "Deploy site"

5. **Setup Environment Variable (PENTING untuk Cloud Sync)**
   - Setelah deploy pertama, go to **Site settings** → **Environment variables**
   - Add 2 variable (dari Supabase dashboard → Project Settings → API):
     - **Key:** `VITE_SUPABASE_URL` → **Value:** `https://YOUR-PROJECT.supabase.co`
     - **Key:** `VITE_SUPABASE_ANON_KEY` → **Value:** anon public key
   - Klik **Save**
   - **Redeploy** website

6. **Selesai!** 🎉
   - Netlify akan otomatis build dan deploy
   - Website akan live di URL: `https://your-site-name.netlify.app`
   - Setiap push ke GitHub akan otomatis trigger deploy baru
   - Semua device langsung berbagi data via Supabase (tanpa setup manual per-device)

### File Konfigurasi

- `netlify.toml` - Konfigurasi build dan redirect untuk SPA routing
- `public/_redirects` - Fallback routing untuk React Router
- `src/config/supabase.js` - Inisialisasi client Supabase (baca env var)
- `.env.example` - Template environment variable

### Catatan Penting

- ✅ SPA routing sudah dikonfigurasi dengan redirect rules
- ✅ Build command dan output directory sudah di-set
- ✅ Auto-deploy dari GitHub sudah aktif
- ✅ Tanpa env var Supabase, app tetap jalan dalam mode localStorage (per-browser)
- ⚠️ **PENTING:** Set `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` di Netlify untuk cloud sync
- 📋 Lihat [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) untuk schema SQL & setup lengkap

## 📚 Dokumentasi

Semua dokumentasi tersedia di folder [`docs/`](docs/):

- `README.md` - Dokumentasi utama (file ini)
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) - Setup Supabase: schema SQL, RLS, user admin, env var

