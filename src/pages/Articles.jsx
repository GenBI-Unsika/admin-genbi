import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/cards/ArticleCard';
import EmptyState from '../components/EmptyState';
import { Plus } from 'lucide-react';

const MOCK = [
  {
    id: 'a-1',
    title: 'Rangkuman Kegiatan Bulan Maret',
    author: 'GenBI Unsika',
    date: '2024-03-09',
    cover: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1200&auto=format&fit=crop',
    description: 'Ringkasan aktivitas dan capaian komunitas selama bulan Maret.',
  },
  {
    id: 'a-2',
    title: 'Tips Lolos Beasiswa BI',
    author: 'Tim Beasiswa',
    date: '2024-03-11',
    cover: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
    description: 'Kumpulan strategi praktis menyiapkan berkas dan wawancara.',
  },
  {
    id: 'a-3',
    title: 'Budaya Kolaborasi di GenBI',
    author: 'Humas',
    date: '2024-03-13',
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
    description: 'Mengapa budaya kolaborasi penting dan bagaimana kami menerapkannya.',
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
          {/* judul diperkecil */}
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Artikel</h2>
          <p className="text-sm text-neutral-600">Kelola artikel & publikasi website.</p>
        </div>

        {/* tombol kecil */}
        <Link
          to="/artikel/new"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30"
        >
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

      {/* Grid: 4 kolom di xl */}
      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.map((a) => (
            <ArticleCard key={a.id} title={a.title} author={a.author} date={a.date} cover={a.cover} description={a.description} onClick={() => {}} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={q.trim() ? 'search' : 'files'}
          title={q.trim() ? 'Tidak ada hasil' : 'Belum ada artikel'}
          description={q.trim() ? 'Coba kata kunci lain untuk pencarian artikel.' : 'Artikel yang Anda buat akan muncul di sini.'}
          action={
            !q.trim() && (
              <Link to="/artikel/new" className="inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
                <Plus className="h-4 w-4" />
                Tulis Artikel Baru
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
