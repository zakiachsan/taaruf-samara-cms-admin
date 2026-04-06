# Taaruf Samara CMS Admin - Deployment Guide

## 🚀 Quick Deploy

### 1. Build Project

```bash
cd c:\Projects\taaruf-samara-cms-admin
npm run build
```

### 2. Create ZIP of dist Folder

```bash
# Using PowerShell (Windows)
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'taaruf-cms-admin-dist.zip' -Force"
```

### 3. Upload to cPanel

1. Buka cPanel → **File Manager**
2. Pergi ke folder **`public_html`**
3. **Hapus semua file** yang ada di sana (file lama)
4. Upload `taaruf-cms-admin-dist.zip`
5. Extract ZIP di folder `public_html`

### 4. Verify Structure

Setelah extract, struktur folder harus jadi:

```
public_html/
├── index.html
└── assets/
    ├── index-B8c2GAkP.js
    ├── index-CisdcEHe.css
    └── ... (file JS lainnya)
```

## ⚠️ PENTING: JANGAN UPLOAD SOURCE CODE!

**JANGAN upload** folder atau file berikut:
- `src/` - ini source code, browser gak baca
- `package.json` - gak perlu di server
- `.env` - jangan upload file ini!
- `node_modules/` - gak perlu
- `vite.config.ts` - gak perlu
- `tsconfig*.json` - gak perlu

**HANYA upload folder `dist/`** hasil build!

## 🔧 Build Project dari Scratch (Reset)

Kalau perlu build ulang dari awal:

```bash
# 1. Hapus node_modules dan build lama
cd c:\Projects\taaruf-samara-cms-admin
rm -rf node_modules dist
rm package-lock.json

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Buat ZIP dist
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'taaruf-cms-admin-dist.zip' -Force"
```

## 📦 File ZIP yang Perlu Dibuat

| File | Ukuran | Keterangan |
|------|--------|-----------|
| `taaruf-cms-admin-dist.zip` | ~300KB | **INI yang di-upload ke cPanel** |
| `taaruf-cms-admin.zip` | ~500KB | Source code (backup aja) |

## 🌐 Akses Admin

Setelah deploy, akses:
- URL: `https://domain-anda.com/`
- Login page akan muncul

## 🗄️ Database Migration

Kalau ada perubahan database:
1. Buka file migration di folder `supabase/migrations/`
2. Copy SQL-nya
3. Buka Supabase Dashboard → SQL Editor
4. Paste dan run SQL

## 📝 Catatan

- Build hanya butuh file `dist/` yang sudah dioptimasi
- Tidak perlu `.htaccess` tambahan untuk static build Vite
- Environment variables (`.env`) gak perlu di-upload ke server karena ini client-side only

## 🆘 Troubleshooting

### Website putih/kosong
- Pastikan sudah extract ZIP dengan benar
- Cek struktur folder (harus ada `index.html` di root)
- Refresh browser (Ctrl + F5)

### MIME Type Error
- Pastikan upload **build file** (dist/) bukan source code
- Jangan upload file `.ts`, `.tsx`, atau `.vue`

### Tidak bisa login
- Cek Supabase connection di `.env` (local development)
- Pastikan email/password admin benar
