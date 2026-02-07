# Admin GenBI

Admin dashboard untuk manajemen GenBI Unsika.

## Quick Start

```bash
npm install
npm run dev
```

Berjalan di `http://localhost:5174`

## Environment

Buat `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Routes

| Route          | Halaman             |
| -------------- | ------------------- |
| `/dashboard`   | Dashboard           |
| `/beasiswa`    | Pendaftar Beasiswa  |
| `/aktivitas`   | Event & Proker      |
| `/artikel`     | Artikel & Publikasi |
| `/divisi`      | Kelola Divisi       |
| `/anggota`     | Kelola Anggota      |
| `/kas`         | Treasury            |
| `/poin`        | Poin Kegiatan       |
| `/dispensasi`  | Kelola Dispensasi   |
| `/cms`         | CMS Website         |
| `/admin/users` | Kelola Admin Users  |
| `/login`       | Login               |

## Build

```bash
npm run build
```

Output: `dist/`

## Dokumentasi

Lihat `../Documentation/` untuk dokumentasi lengkap.
