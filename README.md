# Admin GenBI (Dashboard)

Dashboard admin berbasis React untuk pengelolaan data GenBI Unsika (Anggota, Kegiatan, Keuangan, dll).

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Backend (`genbi-server`) harus berjalan.

### Installation

1.  **Clone & Install Dependencies**

    ```bash
    cd admin-genbi
    npm install
    ```

2.  **Environment Variables**
    Buat file `.env.local`:

    ```env
    VITE_API_BASE_URL=http://localhost:3500/api/v1
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Akses di `http://localhost:5174`.

## 🛠️ Tech Stack

- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios (atau fetch wrapper Custom)
- **Icons**: Lucide React / Heroicons

## 📂 Folder Structure

```
admin-genbi/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, css global
│   ├── components/      # UI components reusable (Button, Input, Layout)
│   ├── contexts/        # React Context (AuthContext, ThemeContext)
│   ├── pages/           # Halaman utama (Dashboard, Users, Finance)
│   ├── utils/           # Helper functions (date formatter, currency)
│   ├── App.jsx          # Root component & Routing setup
│   └── main.jsx         # Entry point (ReactDOM render)
├── .env.local           # Environment variables
└── vite.config.js       # Vite configuration
```

## 🔄 Application Flow

1.  **Authentication**:
    - Halaman Login memanggil API `/auth/admin/login`.
    - Token disimpan di LocalStorage/Cookie.
    - `AuthContext` mengecek status login saat aplikasi start.
    - Gunakan `ProtectedLayout` untuk membatasi akses halaman.

2.  **Data Fetching**:
    - Menggunakan `useEffect` di halaman untuk load data dari API.
    - Menampilkan loading state saat fetch.
    - Menampilkan data table/grid setelah berhasil.

3.  **CRUD Operations**:
    - Forms (Add/Edit) mengirim POST/PATCH request ke API.
    - Delete button mengirim DELETE request dengan konfirmasi.

## 🗺️ File Tour

- **`src/App.jsx`**:
  - Definisi Route aplikasi (`/`, `/dashboard`, `/users`).
  - Penggunaan Layout wrapper.

- **`src/contexts/AuthContext.jsx`**:
  - Provider untuk user session.
  - Fungsi `login`, `logout`.

- **`src/pages/Dashboard.jsx`**:
  - Halaman utama setelah login.
  - Menampilkan summary stats.

- **`src/components/Sidebar.jsx` (jika ada)**:
  - Navigasi utama sidebar.

## 📚 Documentation

Dokumentasi lengkap project ini ada di folder `../Documentation/`.
