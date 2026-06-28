# Setup Backend Supabase

Aplikasi ini tetap bisa jalan tanpa backend (mode localStorage). Konfigurasikan
Supabase agar:

- Login admin **aman** (password diverifikasi Supabase, bukan ditanam di front-end).
- **Data pengunjung + event** dan **pilihan konten home** dibagi ke SEMUA device.

> Tanpa env var di bawah, aplikasi tetap berjalan dalam **mode localStorage**
> (login `portfolio` / `portfolio`, data per-browser). Begitu env di-set,
> semuanya otomatis pindah ke Supabase — tanpa ubah kode.

## 1. Buat project

1. Daftar di https://supabase.com (free tier), buat project baru.
2. Buka **Project Settings → API**, salin:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 2. Buat schema + security policies

Buka **SQL Editor** di Supabase, jalankan SQL berikut:

```sql
-- tables ---------------------------------------------------------------
create table if not exists pageviews (
  id   bigint generated always as identity primary key,
  path text not null,
  ref  text,
  meta jsonb,            -- device + source + lokasi (browser, os, source, location, dst.)
  ts   timestamptz not null default now()
);

create table if not exists events (
  id   bigint generated always as identity primary key,
  name text not null,
  meta jsonb,
  ts   timestamptz not null default now()
);

create table if not exists content (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,   -- { "active": "timnas" }
  updated_at timestamptz not null default now()
);
insert into content (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;

create table if not exists aliases (
  vid        text primary key,   -- visitor id (= deviceId)
  alias      text,               -- label yang di-set admin
  updated_at timestamptz not null default now()
);

-- row level security ---------------------------------------------------
alter table pageviews enable row level security;
alter table events    enable row level security;
alter table content   enable row level security;
alter table aliases   enable row level security;

-- alias: hanya admin (login) yang boleh baca/tulis
create policy "alias read"   on aliases for select to authenticated using (true);
create policy "alias insert" on aliases for insert to authenticated with check (true);
create policy "alias update" on aliases for update to authenticated using (true);

-- pageviews/events: siapa pun (anon) boleh MENCATAT; hanya admin yang boleh BACA/HAPUS
create policy "pv insert"  on pageviews for insert to anon, authenticated with check (true);
create policy "pv read"    on pageviews for select to authenticated using (true);
create policy "pv delete"  on pageviews for delete to authenticated using (true);

-- Memperbarui lokasi kunjungan (mis. IP -> GPS saat tombol "Lokasi" di-allow)
-- TANPA membuka SELECT ke anon. Anon tak punya SELECT di pageviews, jadi
-- UPDATE...WHERE biasa tak bisa menemukan baris. Pakai fungsi SECURITY DEFINER
-- yang hanya mengubah meta.location untuk visitId tertentu.
create or replace function public.set_visit_location(p_visit_id text, p_location jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update pageviews
  set meta = jsonb_set(coalesce(meta, '{}'::jsonb), '{location}', p_location, true)
  where meta->>'visitId' = p_visit_id;
$$;
grant execute on function public.set_visit_location(text, jsonb) to anon, authenticated;

create policy "ev insert"  on events for insert to anon, authenticated with check (true);
create policy "ev read"    on events for select to authenticated using (true);
create policy "ev delete"  on events for delete to authenticated using (true);

-- content: publik boleh BACA (situs butuh ini); hanya admin yang boleh TULIS
create policy "content read"   on content for select to anon, authenticated using (true);
create policy "content insert" on content for insert to authenticated with check (true);
create policy "content update" on content for update to authenticated using (true);
```

## 3. Buat user admin

**Authentication → Users → Add user** (email + password). Form login memetakan
username ke email dengan menambah `@portfolio.local`. Untuk menjaga username
`portfolio` / password `portfolio`:

- **Email:** `portfolio@portfolio.local`
- **Password:** `portfolio` (pilih yang lebih kuat kalau mau)
- Aktifkan **Auto Confirm User** agar bisa langsung login.

> Mau ganti username/password? Buat user dengan email/password lain, lalu login
> dengan bagian sebelum `@` sebagai username. Domain `@portfolio.local` diatur di
> [`src/config/supabase.js`](../src/config/supabase.js) (`ADMIN_EMAIL_DOMAIN`).

## 4. Pasang key-nya

- **Lokal:** salin `.env.example` → `.env`, isi kedua nilai, lalu `npm run dev`.
- **Netlify:** Site settings → Environment variables → tambah `VITE_SUPABASE_URL`
  dan `VITE_SUPABASE_ANON_KEY`, lalu redeploy.

## 5. CORS

Tidak perlu konfigurasi CORS tambahan — Supabase mengizinkan request dari origin
mana pun ke endpoint REST/Auth secara default; RLS yang melindungi datanya.

---

## Catatan: lokasi pengunjung

Tab **Pengunjung** masih menampilkan lokasi (latitude/longitude + nama kota via
OpenStreetMap + link Google Maps). Browser akan meminta izin lokasi saat
pengunjung membuka situs; jika ditolak, kunjungan tetap tercatat tanpa lokasi.
Data lokasi disimpan di kolom `meta` tabel `pageviews`.
