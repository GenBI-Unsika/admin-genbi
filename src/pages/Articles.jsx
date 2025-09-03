import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/cards/ArticleCard';

const MOCK = [
  {
    id: 'a-1',
    title: 'Rangkuman Kegiatan Bulan Maret',
    author: 'GenBI Unsika',
    date: '2024-03-09',
    cover: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'a-2',
    title: 'Tips Lolos Beasiswa BI',
    author: 'Tim Beasiswa',
    date: '2024-03-11',
    cover: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'a-3',
    title: 'Budaya Kolaborasi di GenBI',
    author: 'Humas',
    date: '2024-03-13',
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function Articles() {
  const [q, setQ] = useState('');
  const data = useMemo(() => {
    if (!q.trim()) return MOCK;
    const t = q.trim().toLowerCase();
    return MOCK.filter((r) => r.title.toLowerCase().includes(t));
  }, [q]);

  return (
    <div className="px-6 md:px-10 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">Artikel</h2>
          <p className="text-sm text-neutral-600">Kelola artikel & publikasi website.</p>
        </div>

        <Link to="/artikel/new" className="btn-primary whitespace-nowrap">
          + Tulis Artikel
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Cari judul artikel…"
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">🔎</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map((a) => (
          <ArticleCard key={a.id} title={a.title} author={a.author} date={a.date} cover={a.cover} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
}
