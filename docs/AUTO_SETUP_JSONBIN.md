# 🚀 Auto-Setup JSONBin.io untuk Device B, C, dst

## 🎯 Tujuan

Membuat sistem dimana **hanya Device A (admin) yang perlu setup API key**, dan **Device B, C, dst otomatis setup** saat mengakses website tanpa perlu manual setup.

## ✅ Solusi yang Sudah Diimplementasikan

Sistem ini sudah mendukung **auto-setup** untuk device B, C, dst dengan **API key yang di-hardcode** di `src/config/jsonbin.js`.

### ✅ Hardcode API Key (Sudah Aktif)

API key sudah di-hardcode di `src/config/jsonbin.js`:
```javascript
const HARDCODED_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'
```

**Cara Kerja:**
- Device A (admin) setup JSONBin.io sekali → bins dibuat
- **Setelah Device A setup:** Copy bin IDs dari dashboard, lalu hardcode di `src/config/jsonbin.js` (lihat langkah di bawah)
- Device B, C, dst akses website → **otomatis detect API key dari config** → **otomatis menggunakan bins yang sama** → **tidak perlu setup manual!**

### Alternatif: Environment Variable (Opsional)

1. **Setup di Netlify:**
   - Login ke Netlify dashboard
   - Pilih site Anda
   - Go to **Site settings** → **Environment variables**
   - Klik **Add variable**
   - Name: `VITE_JSONBIN_API_KEY`
   - Value: `$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.`
   - Klik **Save**
   - **Redeploy** website (atau trigger deploy baru)

2. **Setelah deploy:**
   - Device A (admin) setup JSONBin.io seperti biasa (untuk create bins)
   - Device B, C, dst **otomatis** akan menggunakan API key dari environment variable
   - Tidak perlu setup manual di device lain!

### Cara 2: Hardcode di Config (Untuk Development/Testing)

API key sudah di-hardcode di `src/config/jsonbin.js`:

```javascript
const HARDCODED_API_KEY = '$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.'
```

**Catatan:** Ini akan expose API key di code. Gunakan hanya untuk development/testing.

## 🔄 Cara Kerja

1. **Device A (Admin):**
   - Login ke admin panel di production
   - Setup JSONBin.io dengan API key (bisa pakai API key yang sama atau biarkan auto-detect dari config)
   - Bins akan dibuat (logs bin & content bin)
   - **Catatan:** Setelah setup, semua device akan menggunakan bins yang sama

2. **Setelah Device A Setup (PENTING):**
   - Di dashboard admin, klik tombol **"📋 Copy Bin IDs untuk Hardcode"**
   - Buka file `src/config/jsonbin.js`
   - Paste bin IDs ke `HARDCODED_LOGS_BIN_ID` dan `HARDCODED_CONTENT_BIN_ID`
   - Commit dan push ke GitHub → Netlify akan auto-deploy
   - Setelah deploy, semua device akan menggunakan bins yang sama

3. **Device B, C, dst (Pengunjung):**
   - Akses website
   - Sistem otomatis detect API key dari config (hardcoded)
   - Otomatis menggunakan bins yang sama dengan device A (jika bin IDs sudah di-hardcode)
   - Otomatis sync log dan konten dari cloud
   - **Tidak perlu setup manual!**

## 📋 Langkah Setup di Netlify

### Step 1: Tambah Environment Variable

1. Login ke [Netlify Dashboard](https://app.netlify.com)
2. Pilih site: `nusatravel`
3. Klik **Site settings** (gear icon)
4. Klik **Environment variables** di menu kiri
5. Klik **Add variable**
6. Isi:
   - **Key:** `VITE_JSONBIN_API_KEY`
   - **Value:** `$2a$10$KJMZHD2T9JURi3VYxeY.MOEM3jU2qB7nGl3yH5EU2Cqgh0XN5fy2.`
   - **Scopes:** Pilih "All scopes" (atau "Production" saja)
7. Klik **Save**

### Step 2: Redeploy

1. Di Netlify dashboard, klik **Deploys**
2. Klik **Trigger deploy** → **Deploy site**
3. Atau push commit baru ke GitHub (akan auto-deploy)

### Step 3: Setup di Device A (Sekali Saja)

1. Login ke admin panel di production
2. Setup JSONBin.io dengan API key yang sama
3. Bins akan dibuat

### Step 4: Test di Device B

1. Buka website di device B (browser lain/device lain)
2. Akses halaman home
3. **Tidak perlu setup manual** - sistem otomatis akan:
   - Detect API key dari environment variable
   - Initialize bins (jika belum ada)
   - Sync log dan konten dari cloud

## ✅ Setelah Setup

- ✅ Device A setup sekali → bins dibuat
- ✅ Device B, C, dst akses website → **otomatis setup** (tidak perlu manual)
- ✅ Log dari semua device otomatis sync
- ✅ Konten dari device A otomatis muncul di device B, C, dst

## ⚠️ Catatan Keamanan

- **Environment Variable** lebih aman karena tidak expose API key di code
- **Hardcode** di config file akan expose API key di GitHub (tidak recommended untuk production)
- Untuk production, **selalu gunakan Environment Variable**

## 🔧 Troubleshooting

### Device B tidak auto-setup

1. **Cek Environment Variable di Netlify:**
   - Pastikan `VITE_JSONBIN_API_KEY` sudah di-set
   - Pastikan sudah redeploy setelah set environment variable

2. **Cek Console Browser:**
   - Buka Developer Tools (F12)
   - Lihat Console untuk error message
   - Harus ada log: `✅ JSONBin.io auto-initialized from config`

3. **Cek localStorage:**
   - Buka Developer Tools → Application → Local Storage
   - Harus ada `jsonbinApiKey`, `jsonbinBinId`, `jsonbinContentBinId`

### Log tidak sync

- Pastikan Device A sudah setup dan bins sudah dibuat
- Pastikan Device B sudah auto-initialize (cek console)
- Tunggu beberapa detik (auto-sync setiap 10 detik untuk log, 5 detik untuk konten)

