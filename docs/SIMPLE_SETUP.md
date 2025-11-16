# 🎯 Setup Sederhana - Sistem Terpusat

## ✅ Yang Sudah Otomatis

1. **API Key** - Sudah di-hardcode, semua device otomatis pakai
2. **Auto-Setup** - Device B, C, dst otomatis setup saat akses website
3. **Content Sync** - Edit konten di Device A → semua device berubah (auto setiap 5 detik)
4. **Log Sync** - Akses dari Device B → tercatat di Device A (auto setiap 10 detik)

## 📋 Langkah Setup (Hanya Device A)

1. **Login ke Admin Panel**
   - URL: `https://nusatravel.netlify.app/administrator`
   - Username: `portfolio`
   - Password: `portfolio`

2. **Setup JSONBin.io (Sekali Saja)**
   - Klik tab "👥 Daftar Pengunjung"
   - Klik tombol "✅ Setup JSONBin.io (Auto dengan API Key)"
   - Selesai! ✅

## 🚀 Setelah Setup

- ✅ **Device A**: Bisa edit konten dan lihat log
- ✅ **Device B, C, dst**: Otomatis setup, konten sync, log sync
- ✅ **Tidak perlu setup manual di device lain!**

## ⚠️ Catatan Penting

Setelah Device A setup pertama kali, **copy Config Bin ID** dari dashboard dan hardcode di `src/config/jsonbin.js` agar semua device menggunakan bins yang sama.

Tapi jika tidak di-hardcode, setiap device akan create bins sendiri-sendiri (masih sync, tapi terpisah).

