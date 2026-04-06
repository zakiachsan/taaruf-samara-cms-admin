# Quick Reference - Build & Deploy

## Build Command (Copy-Paste Ini)

```bash
cd c:\Projects\taaruf-samara-cms-admin
npm run build
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'taaruf-cms-admin-dist.zip' -Force"
```

## Output File

📦 `c:\Projects\taaruf-cms-admin-dist.zip` (~300KB)
→ Upload ini ke cPanel File Manager → public_html

## Folder Project

📁 `c:\Projects\taaruf-samara-cms-admin\read-first\` → Baca README.md di sini

## cPanel Deploy

1. File Manager → public_html
2. Hapus semua file lama
3. Upload `taaruf-cms-admin-dist.zip`
4. Extract
5. Selesai!
