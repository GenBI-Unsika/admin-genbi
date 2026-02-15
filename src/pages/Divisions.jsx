import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight, Users, Loader2, Search } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';
import { useConfirm } from '../contexts/ConfirmContext';

export default function Divisions() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const { confirm } = useConfirm();

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('/divisions/admin/all');
      setDivisions(response?.data || []);
    } catch (err) {
      // Error fetching divisions
      setError(err.message || 'Gagal memuat data divisi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const handleDelete = async (division) => {
    const confirmed = await confirm({
      title: 'Hapus Divisi',
      description: `Apakah Anda yakin ingin menghapus divisi "${division.name}"?`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!confirmed) return;

    try {
      await apiRequest(`/divisions/${division.id}`, { method: 'DELETE' });
      setDivisions((prev) => prev.filter((d) => d.id !== division.id));
    } catch (err) {
      // Error deleting division
      alert(err.message || 'Gagal menghapus divisi');
    }
  };

  const filteredDivisions = q.trim() ? divisions.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.key.toLowerCase().includes(q.toLowerCase())) : divisions;

  return (
    <div className="px-6 md:px-10 py-6">
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">Divisi</span>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Manajemen Divisi</h2>
          <p className="text-sm text-neutral-600">Kelola divisi organisasi GenBI.</p>
        </div>

        <Link
          to="/divisi/new"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary-600/20 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 active:scale-[0.99] shadow-sm hover:shadow-md-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          Tambah Divisi
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Cari divisi..."
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
          />
          <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-neutral-600">Memuat data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button onClick={fetchDivisions} className="mt-2 text-sm font-medium text-red-800 hover:underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {filteredDivisions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDivisions.map((division) => (
                <div key={division.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl flex-shrink-0">{division.icon || '👥'}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${division.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>{division.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </div>

                    <h3 className="text-base font-semibold text-neutral-900 mb-1">{division.name}</h3>
                    {division.description && <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{division.description}</p>}

                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                      <Link
                        to={`/divisi/${division.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(division)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={q.trim() ? 'search' : 'inbox'}
              title={q.trim() ? 'Tidak ada hasil' : 'Belum ada divisi'}
              description={q.trim() ? 'Coba kata kunci lain untuk pencarian divisi.' : 'Divisi yang Anda buat akan muncul di sini.'}
              variant={q.trim() ? 'default' : 'primary'}
            />
          )}
        </>
      )}
    </div>
  );
}
