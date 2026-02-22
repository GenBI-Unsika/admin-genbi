import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import ProkerCard from '../components/cards/ProkerCard';
import EmptyState from '../components/EmptyState';
import { ChevronRight, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../contexts/ConfirmContext';
import { apiGet, apiDelete } from '../utils/api';

export default function Activities() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (q.trim()) params.set('search', q.trim());
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      const result = await apiGet(`/activities?${params.toString()}`);
      const mapped = (result.data || result || []).map((item) => {
        const division = item.division || 'GenBI';
        const location = item.location ? `• ${item.location}` : '';
        const theme = `${division} ${location}`;

        return {
          id: item.id,
          type: item.status === 'PLANNED' || item.status === 'DRAFT' ? 'proker' : 'event',
          title: item.title,
          theme,
          date: item.startDate ? item.startDate.split('T')[0] : '',
          cover: item.coverImage || null,
          description: item.description || '',
          status: item.status,
          badge: item.status === 'DRAFT' ? 'DRAFT' : (item.status === 'PLANNED' ? 'Planned' : item.status), // Tampilan status yang bisa kebaca
          badgeColor: item.status === 'DRAFT' ? '#EF4444' : (item.status === 'PLANNED' ? '#3B82F6' : '#10B981'),
          raw: item, // Simpen data aslinya jg buat dikirim lg kalau diedit
        };
      });
      setActivities(mapped);
    } catch (err) {
      setError(err.message || 'Gagal memuat data aktivitas');
    } finally {
      setLoading(false);
    }
  }, [q, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 300); // Kasih jeda tik-tok pas ngetik biar ga nge-lag/lemot pencariannya
    return () => clearTimeout(timer);
  }, [fetchActivities]);

  const { confirm } = useConfirm();

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Hapus Aktivitas?',
      description: 'Aktivitas yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!isConfirmed) return;

    try {
      await apiDelete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success('Aktivitas berhasil dihapus');
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus aktivitas');
    }
  };

  const data = useMemo(() => {
    let rows = [...activities];
    if (cat !== 'all') rows = rows.filter((r) => r.type === cat);
    return rows;
  }, [activities, cat]);

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-neutral-600">Memuat aktivitas...</p>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="px-6 md:px-10 py-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchActivities} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

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
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Event & Proker</h2>
          <p className="text-sm text-neutral-600">Kelola aktivitas GenBI.</p>
        </div>

        <Link
          to="/aktivitas/new"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30"
        >
          + Tambah Aktivitas
        </Link>
      </div>

      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Cari judul/tema…"
              className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-4 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            />
            <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="relative">
            <select
              aria-label="Kategori"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            >
              <option value="all">Semua Tipe</option>
              <option value="event">Event</option>
              <option value="proker">Proker</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
              title="Tanggal Mulai"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
              title="Tanggal Akhir"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            >
              <option value="startDate">Tgl Kegiatan</option>
              <option value="createdAt">Tgl Buat</option>
              <option value="title">Judul</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="shrink-0 h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
            >
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.map((item) =>
            item.type === 'event' ? (
              <EventCard
                key={item.id}
                title={item.title}
                theme={item.theme}
                date={item.date}
                cover={item.cover}
                description={item.description}
                to={`/aktivitas/${item.id}/edit`}
                state={{ event: item.raw }}
                onDelete={() => handleDelete(item.id)}
              />
            ) : (
              <ProkerCard
                key={item.id}
                title={item.title}
                theme={item.theme}
                date={item.date}
                cover={item.cover}
                description={item.description}
                to={`/aktivitas/${item.id}/edit`}
                state={{ proker: item.raw }}
                onDelete={() => handleDelete(item.id)}
              />
            ),
          )}
        </div>
      ) : (
        <EmptyState
          icon={q.trim() ? 'search' : 'inbox'}
          title={q.trim() ? 'Tidak ada hasil' : 'Belum ada aktivitas'}
          description={q.trim() ? 'Coba kata kunci lain untuk pencarian.' : 'Event dan proker yang Anda buat akan muncul di sini.'}
          variant={q.trim() ? 'default' : 'primary'}
        />
      )}
    </div>
  );
}
