import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/cards/ArticleCard';
import EmptyState from '../components/EmptyState';
import { Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { apiGet } from '../utils/api';

export default function Articles() {
  const [q, setQ] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (q.trim()) params.set('search', q.trim());
      const result = await apiGet(`/articles?${params.toString()}`);
      // Map API data to component format
      const mapped = (result.data || result || []).map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author?.name || 'GenBI Unsika',
        date: item.publishedAt ? item.publishedAt.split('T')[0] : item.createdAt?.split('T')[0] || '',
        cover: item.coverImage || null,
        description: item.excerpt || item.content?.substring(0, 150) || '',
        slug: item.slug,
        status: item.status,
        raw: item, // Keep original data for edit
      }));
      setArticles(mapped);
    } catch (err) {
      setError(err.message || 'Gagal memuat data artikel');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-neutral-600">Memuat artikel...</p>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="px-6 md:px-10 py-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchArticles} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Artikel</h2>
          <p className="text-sm text-neutral-600">Kelola artikel & publikasi website.</p>
        </div>

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
          <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {articles.map((a) => (
            <ArticleCard key={a.id} title={a.title} badge={a.author} date={a.date} image={a.cover} description={a.description} to={`/artikel/${a.id}/edit`} state={{ article: a.raw }} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={q.trim() ? 'search' : 'inbox'}
          title={q.trim() ? 'Tidak ada hasil' : 'Belum ada artikel'}
          description={q.trim() ? 'Coba kata kunci lain untuk pencarian artikel.' : 'Artikel yang Anda buat akan muncul di sini.'}
          variant={q.trim() ? 'default' : 'primary'}
        />
      )}
    </div>
  );
}
