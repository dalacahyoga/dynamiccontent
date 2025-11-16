# ☁️ Setup JSONBin.io untuk Cloud Sync

## 🎯 Solusi Tanpa Backend!

Sistem ini menggunakan **JSONBin.io** - service gratis untuk menyimpan JSON di cloud tanpa perlu membuat backend sendiri.

**📋 Untuk panduan step-by-step yang lebih detail, lihat `PANDUAN_SETUP_JSONBIN.md`**

## ✅ Keuntungan

- ✅ **Gratis** - Free tier tersedia
- ✅ **Tidak perlu backend** - Langsung dari frontend
- ✅ **Auto-sync** - Log otomatis tersinkronisasi
- ✅ **Terpusat** - Semua device bisa melihat log dari device lain
- ✅ **Mudah setup** - Hanya perlu API key

## 📋 Cara Setup

### 1. Daftar di JSONBin.io

1. Kunjungi https://jsonbin.io
2. Klik "Sign Up" (gratis)
3. Buat akun dengan email atau GitHub

### 2. Dapatkan API Key

1. Setelah login, buka dashboard
2. Di bagian "API Keys", copy **Master Key** (atau buat baru)
3. Simpan API key ini (akan digunakan di admin panel)

### 3. Setup di Admin Panel

1. Login ke admin panel (`/administrator/dashboard`)
2. Pilih tab "👥 Daftar Pengunjung"
3. Di section "☁️ Cloud Sync (JSONBin.io)"
4. Paste API key yang sudah di-copy
5. Klik tombol "🔧 Setup"

## 🔄 Cara Kerja

### Auto-Sync (Otomatis!)
- ✅ Setiap kali ada user mengakses website, log **otomatis tersimpan ke cloud**
- ✅ Dashboard admin **otomatis refresh setiap 10 detik**
- ✅ **TIDAK PERLU manual sync** - semua otomatis!

### Skenario Real-Time:

1. **Device A** mengakses website 
   - Log tersimpan di localStorage Device A
   - Log **otomatis tersimpan ke cloud** (background)

2. **Device B** (admin) login ke dashboard
   - Dashboard **otomatis fetch log dari cloud** saat load
   - Log Device A **langsung muncul** ✅
   - Dashboard **auto-refresh setiap 10 detik**

3. **Device C** mengakses website
   - Log tersimpan ke cloud (otomatis)

4. **Device B** (masih buka dashboard)
   - Dalam **maksimal 10 detik**, log Device C **otomatis muncul** ✅
   - **TIDAK PERLU klik sync** - semua otomatis!

## ⚠️ Catatan

- **Free tier** JSONBin.io memiliki limit (cek di website mereka)
- Jika limit tercapai, bisa upgrade ke paid plan atau gunakan alternatif
- API key disimpan di localStorage browser (aman untuk development)

## 🔒 Keamanan

- API key hanya tersimpan di browser admin yang setup
- Setiap device menggunakan API key yang sama untuk mengakses bin yang sama
- Untuk production, pertimbangkan untuk menggunakan environment variable

## 🆘 Troubleshooting

### "Failed to create bin"
- Pastikan API key benar
- Cek koneksi internet
- Coba refresh dan setup lagi

### "Failed to sync"
- Pastikan JSONBin.io sudah di-setup
- Cek koneksi internet
- Coba klik "Sync dari Cloud" lagi

### Log tidak muncul
- Pastikan sudah klik "Sync dari Cloud"
- Cek apakah device lain sudah mengakses website
- Pastikan JSONBin.io sudah di-setup dengan benar

