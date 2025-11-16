# 📋 Panduan Setup JSONBin.io - Step by Step

## 🎯 Tujuan

Setup JSONBin.io agar log dari semua device (A, B, C) otomatis muncul di dashboard admin (Device D) secara real-time tanpa perlu manual sync.

## 📝 Langkah-langkah Setup

### Step 1: Daftar di JSONBin.io

1. Buka browser dan kunjungi: **https://jsonbin.io**
2. Klik tombol **"Sign Up"** atau **"Get Started"** (di pojok kanan atas)
3. Pilih metode pendaftaran:
   - **Email** - Masukkan email dan password
   - **GitHub** - Login dengan akun GitHub (lebih cepat)
4. Verifikasi email jika diperlukan
5. Login ke akun JSONBin.io

### Step 2: Dapatkan API Key

1. Setelah login, Anda akan masuk ke **Dashboard**
2. Di bagian kiri atau atas, cari menu **"API Keys"** atau **"My Account"**
3. Klik **"API Keys"** atau **"Create API Key"**
4. Anda akan melihat **Master Key** (atau bisa buat API Key baru)
5. **Copy** API Key tersebut (contoh: `$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. **Simpan** API Key ini di tempat aman (akan digunakan di admin panel)

### Step 3: Setup di Admin Panel

1. **Deploy website** ke production (atau jalankan di localhost)
2. Buka website dan login ke **Admin Panel**:
   - URL: `https://yourdomain.com/administrator` (atau `http://localhost:5173/administrator`)
   - Username: `portfolio`
   - Password: `portfolio`

3. Setelah login, klik tab **"👥 Daftar Pengunjung"**

4. Di section **"☁️ Cloud Sync (JSONBin.io)"**, Anda akan melihat:
   - Warning box (kuning) yang menjelaskan pentingnya setup
   - Form input untuk API Key
   - Tombol "🔧 Setup"

5. **Paste API Key** yang sudah di-copy dari Step 2 ke input field

6. Klik tombol **"🔧 Setup"**

7. Tunggu beberapa detik, akan muncul alert: **"JSONBin.io berhasil di-setup! Log akan otomatis tersinkronisasi dan muncul di semua device."**

8. Selesai! ✅

### Step 4: Verifikasi Setup

1. Setelah setup, section akan berubah menjadi:
   - Status: **"✓ Terhubung & Auto-Sync Aktif"**
   - Info: **"Log otomatis tersinkronisasi setiap 10 detik"**
   - Bin ID akan terlihat

2. **Test** dengan:
   - Buka website di device lain (atau browser lain)
   - Akses halaman website
   - Kembali ke admin dashboard
   - Dalam 10 detik, log dari device lain akan muncul otomatis

## ✅ Setelah Setup

### Yang Terjadi:

1. **Setiap pengunjung** yang akses website:
   - Log otomatis tersimpan ke cloud
   - Tidak perlu action apapun

2. **Admin login** ke dashboard:
   - Log dari semua device otomatis muncul
   - Auto-refresh setiap 10 detik
   - Tidak perlu manual sync

### Contoh Skenario:

```
09:00 - Device A akses website → Log tersimpan ke cloud
09:05 - Device B akses website → Log tersimpan ke cloud  
09:10 - Device C akses website → Log tersimpan ke cloud
09:15 - Device D (Admin) login → Semua log A, B, C langsung muncul ✅
09:20 - Device E akses website → Log tersimpan ke cloud
09:21 - Device D (masih buka dashboard) → Log Device E muncul otomatis (dalam 10 detik) ✅
```

## ⚠️ Troubleshooting

### "Failed to create bin"
- **Cek API Key**: Pastikan API Key benar dan lengkap
- **Cek koneksi internet**: Pastikan ada koneksi internet
- **Cek JSONBin.io**: Pastikan akun JSONBin.io masih aktif

### "Failed to sync"
- **Cek status JSONBin.io**: Kunjungi jsonbin.io dan cek apakah service sedang down
- **Cek API Key**: Pastikan API Key masih valid
- **Cek limit**: Free tier JSONBin.io memiliki limit, cek apakah sudah tercapai

### Log tidak muncul
- **Tunggu 10 detik**: Auto-refresh setiap 10 detik
- **Klik "Refresh Sekarang"**: Untuk refresh manual
- **Cek device lain**: Pastikan device lain sudah mengakses website
- **Cek setup**: Pastikan JSONBin.io sudah di-setup dengan benar

## 💡 Tips

1. **Simpan API Key dengan aman**: Jangan share API Key ke publik
2. **Monitor limit**: Cek limit JSONBin.io free tier secara berkala
3. **Backup**: Gunakan fitur Export Log untuk backup manual
4. **Satu API Key untuk semua**: Semua device menggunakan API Key yang sama untuk mengakses bin yang sama

## 🔒 Keamanan

- API Key disimpan di localStorage browser admin
- Hanya admin yang login yang bisa setup
- Untuk production, pertimbangkan untuk menyimpan API Key di environment variable

## 📞 Bantuan

Jika ada masalah:
1. Cek dokumentasi JSONBin.io: https://jsonbin.io/docs
2. Cek console browser untuk error message
3. Pastikan semua step diikuti dengan benar

