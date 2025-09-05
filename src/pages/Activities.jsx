import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import ProkerCard from '../components/cards/ProkerCard';
import { ChevronRight } from 'lucide-react';

const MOCK = [
  {
    id: 'evt-1',
    type: 'event',
    title: 'Tech Talk: AI untuk Mahasiswa',
    theme: 'AI & Produktivitas',
    date: '2024-03-07',
    cover: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
    description: 'Sesi pengenalan penerapan AI dalam belajar & riset kampus.',
  },
  {
    id: 'prk-1',
    type: 'proker',
    title: 'Program Kerja: Literasi Keuangan',
    theme: 'Edukasi BI',
    date: '2024-03-09',
    cover: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop',
    description: 'Kampanye pengelolaan keuangan untuk mahasiswa baru.',
  },
  {
    id: 'evt-2',
    type: 'event',
    title: 'Workshop Penulisan Artikel',
    theme: 'Kepenulisan',
    date: '2024-03-12',
    cover: 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?q=80&w=1200&auto=format&fit=crop',
    description: 'Latihan membuat artikel yang rapi & SEO-friendly.',
  },
  {
    id: 'prk-2',
    type: 'proker',
    title: 'Proker: Aksi Sosial Kampus',
    theme: 'Community',
    date: '2024-03-18',
    cover: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
    description: 'Kegiatan sosial kolaboratif bersama komunitas kampus.',
  },
];

export default function Activities() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const data = useMemo(() => {
    let rows = [...MOCK];
    if (cat !== 'all') rows = rows.filter((r) => r.type === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(t) || (r.theme || '').toLowerCase().includes(t));
    }
    return rows;
  }, [q, cat]);

  return (
    <div className="px-6 md:px-10 py-6">
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">Aktifitas</span>
      </nav>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          {/* judul diperkecil */}
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Event & Proker</h2>
          <p className="text-sm text-neutral-600">Kelola aktivitas GenBI.</p>
        </div>

        {/* tombol kecil agar tidak memenuhi parent */}
        <Link
          to="/aktivitas/new"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30"
        >
          + Tambah Aktivitas
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Cari judul/tema…"
              className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-4 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">🔎</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 md:hidden">Kategori</label>
          <div className="relative">
            <select
              aria-label="Kategori"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            >
              <option value="all">Semua</option>
              <option value="event">Event</option>
              <option value="proker">Proker</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid cards: 4 kolom di xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {data.map((item) =>
          item.type === 'event' ? (
            <EventCard
              key={item.id}
              title={item.title}
              theme={item.theme}
              date={item.date}
              cover={item.cover}
              description={item.description} // <- tampilkan deskripsi di card
              to={`/aktivitas/${item.id}/edit`}
              state={{ event: item }}
            />
          ) : (
            <ProkerCard
              key={item.id}
              title={item.title}
              theme={item.theme}
              date={item.date}
              cover={item.cover}
              description={item.description} // <- tampilkan deskripsi di card
              to={`/aktivitas/${item.id}/edit`}
              state={{ proker: item }}
            />
          )
        )}
      </div>
    </div>
  );
}
