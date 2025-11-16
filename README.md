# Portal Indonesia Website

Website dinamis tentang Indonesia dengan berbagai konten menarik, dibuat dengan Vite + React.

## ✨ Fitur

- 🎨 UI modern dan responsif
- ⚡ Fast development dengan Vite
- 📱 Mobile-friendly
- 🗺️ Dynamic routing dengan React Router
- 📝 Dynamic content management (admin panel)
- 🔄 Dynamic page title & favicon berdasarkan konten
- 📊 User access tracking dengan cloud sync
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
- `/administrator` - Halaman Login Administrator
- `/administrator/dashboard` - Dashboard Administrator (memerlukan login)

## 🔐 Administrator Access

Halaman administrator dapat diakses dengan kredensial berikut:

- **Username:** `portfolio`
- **Password:** `portfolio`

### Dashboard Features

Setelah login, dashboard akan menampilkan:

#### ⚙️ Pengaturan Konten Home
- Pilih konten yang akan ditampilkan di halaman home
- Pilihan konten: Timnas Indonesia, Pulau Seribu, Gunung Kawi Sebatu, Malaka Project, Ceking Terrace
- Hanya bisa memilih 1 konten aktif

#### 👥 Daftar Pengunjung
- Tabel lengkap user yang mengakses website
- Informasi: Device, Waktu Akses, Platform, Lokasi (dengan Google Maps), Screen, Referrer
- Cloud sync dengan JSONBin.io untuk log terpusat
- Auto-refresh setiap 10 detik
- Export/Import log untuk backup

## 📊 Sistem Logging & Cloud Sync

### ✅ Cloud Sync dengan JSONBin.io (Recommended)

Website ini sudah terintegrasi dengan **JSONBin.io** untuk cloud sync tanpa backend:

- ✅ **Auto-sync** - Log otomatis tersimpan ke cloud
- ✅ **Terpusat** - Semua device bisa melihat log dari device lain
- ✅ **Real-time** - Auto-refresh setiap 10 detik di dashboard
- ✅ **Gratis** - Free tier tersedia
- ✅ **Mudah setup** - Hanya perlu API key

**Panduan Setup:**
- 📋 **Step-by-step:** Lihat [`docs/PANDUAN_SETUP_JSONBIN.md`](docs/PANDUAN_SETUP_JSONBIN.md)
- 🔧 **Detail Teknis:** Lihat [`docs/JSONBIN_SETUP.md`](docs/JSONBIN_SETUP.md)

### ⚠️ Tanpa Cloud Sync (LocalStorage Only)

Jika JSONBin.io belum di-setup, sistem menggunakan localStorage:

- ✅ Setiap device mencatat log aksesnya sendiri
- ✅ Fitur export/import tersedia untuk backup manual
- ❌ Device A TIDAK BISA melihat log dari Device B secara otomatis
- ❌ Log hanya tersimpan di browser masing-masing device
- ❌ Data hilang jika user clear browser data

**Lihat [`docs/LOGGING_SYSTEM.md`](docs/LOGGING_SYSTEM.md) untuk detail lebih lengkap.**

## 🛠️ Teknologi

- **React 18** - UI Framework
- **React Router DOM 6** - Routing
- **Vite 5** - Build tool & dev server
- **CSS3** - Styling dengan efek modern (backdrop-filter, gradients)
- **JSONBin.io** - Cloud storage untuk log sync
- **OpenStreetMap Nominatim** - Reverse geocoding untuk nama lokasi

## 📚 Dokumentasi

Semua dokumentasi tersedia di folder [`docs/`](docs/):

- `README.md` - Dokumentasi utama (file ini)
- [`docs/PANDUAN_SETUP_JSONBIN.md`](docs/PANDUAN_SETUP_JSONBIN.md) - Panduan step-by-step setup JSONBin.io
- [`docs/JSONBIN_SETUP.md`](docs/JSONBIN_SETUP.md) - Dokumentasi teknis JSONBin.io
- [`docs/LOGGING_SYSTEM.md`](docs/LOGGING_SYSTEM.md) - Dokumentasi sistem logging

