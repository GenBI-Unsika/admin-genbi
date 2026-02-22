import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Loader2, RefreshCw, Trash2, Search, Download } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';
import { apiGet, apiDelete } from '../utils/api';
import EmptyState from '../components/EmptyState';
import { toast } from 'react-hot-toast';

export default function ActivityRegistrations() {
    const [q, setQ] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiGet(`/activities/registrations`);
            setRegistrations(Array.isArray(result) ? result : (result?.data || []));
        } catch (err) {
            setError(err.message || 'Gagal memuat data pendaftar');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const { confirm } = useConfirm();

    const handleDelete = async (registrationId, activityId, name) => {
        const isConfirmed = await confirm({
            title: 'Hapus Pendaftar?',
            description: `Apakah Anda yakin ingin menghapus ${name} dari daftar pendaftar? Tindakan ini tidak dapat dikembalikan.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
            tone: 'danger',
        });

        if (!isConfirmed) return;

        try {
            await apiDelete(`/activities/${activityId}/registrations/${registrationId}`);
            setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
            toast.success('Pendaftar berhasil dihapus');
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus pendaftar');
        }
    };

    const filteredRegistrations = registrations.filter((r) => {
        const search = q.toLowerCase();
        return (
            (r.name && r.name.toLowerCase().includes(search)) ||
            (r.email && r.email.toLowerCase().includes(search)) ||
            (r.institution && r.institution.toLowerCase().includes(search)) ||
            (r.activity?.title && r.activity.title.toLowerCase().includes(search))
        );
    });

    const handleExportCSV = () => {
        if (registrations.length === 0) return toast.error('Tidak ada data untuk diekspor');

        const headers = ['Event', 'Nama Lengkap', 'Email', 'Institusi/Instansi', 'Catatan Tambahan', 'Tanggal Daftar'];
        const rows = filteredRegistrations.map(r => [
            r.activity?.title || '-',
            r.name || '-',
            r.email || '-',
            r.institution || '-',
            (r.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
            new Date(r.registeredAt).toLocaleString('id-ID')
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `seluruh_pendaftar_event_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    if (loading && registrations.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <span className="ml-3 text-neutral-600">Memuat data pendaftar...</span>
            </div>
        );
    }

    if (error && registrations.length === 0) {
        return (
            <div className="px-6 md:px-10 py-6">
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchRegistrations} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
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
                <Link to="/aktivitas" className="hover:text-neutral-800 hover:underline">
                    Aktifitas
                </Link>
                <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
                <span className="text-neutral-900 font-medium">Data Pendaftar Event</span>
            </nav>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Pendaftar Event</h2>
                    <p className="text-sm text-neutral-600">Kelola daftar partisipan yang mendaftar pada event terkait.</p>
                </div>

                <button
                    onClick={handleExportCSV}
                    disabled={filteredRegistrations.length === 0}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    Ekspor CSV
                </button>
            </div>

            <div className="mb-6 relative max-w-md">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    type="text"
                    placeholder="Cari nama delegasi atau event..."
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-4 outline-none focus:ring-2 focus:ring-primary-200"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            </div>

            {filteredRegistrations.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-[800px] w-full text-left text-sm text-neutral-600">
                            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-900 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Event</th>
                                    <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                                    <th className="px-6 py-4 font-medium">Kontak & Instansi</th>
                                    <th className="px-6 py-4 font-medium">Catatan Tambahan</th>
                                    <th className="px-6 py-4 font-medium">Tanggal Mendaftar</th>
                                    <th className="px-6 py-4 font-medium w-16 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredRegistrations.map((item) => (
                                    <tr key={item.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex w-fit items-center bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded border border-primary-200 leading-normal">
                                                {item.activity?.title || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-neutral-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <a href={`mailto:${item.email}`} className="text-primary-600 hover:underline">{item.email}</a>
                                                <span className="text-xs text-neutral-500">{item.institution || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate" title={item.notes}>
                                            {item.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                                            {new Date(item.registeredAt).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(item.id, item.activityId, item.name)}
                                                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                                                title="Hapus Pendaftar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={q.trim() ? 'search' : 'users'}
                    title={q.trim() ? 'Pendaftar tidak ditemukan' : 'Belum ada pendaftar'}
                    description={q.trim() ? 'Coba kata kunci pencarian yang lain.' : 'Saat ini belum ada orang yang mendaftar ke kegiatan ini.'}
                    variant={q.trim() ? 'default' : 'primary'}
                />
            )}
        </div>
    );
}
