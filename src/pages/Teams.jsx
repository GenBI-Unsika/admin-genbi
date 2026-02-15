import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Mail, Phone, Search, Users } from 'lucide-react';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';

const ROLE_LABEL = {
  awardee: 'Awardee',
  member: 'Member',
  alumni: 'Alumni',
};

export default function Teams() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q.trim());

      const response = await apiRequest(`/members/admin/all${params.toString() ? `?${params.toString()}` : ''}`);
      setMembers(response?.data || []);
    } catch (err) {
      // Error fetching members
      setError(err.message || 'Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    if (!q.trim()) return members;
    const ql = q.trim().toLowerCase();
    return members.filter((m) => {
      const name = String(m.name || '').toLowerCase();
      const email = String(m.email || '').toLowerCase();
      const npm = String(m.npm || '');
      return name.includes(ql) || email.includes(ql) || npm.includes(q.trim());
    });
  }, [members, q]);

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.isActive).length;

  return (
    <div className="px-6 md:px-10 py-6">
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">Anggota</span>
      </nav>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Manajemen Anggota</h2>
          <p className="text-sm text-neutral-600">Daftar anggota diambil dari akun user yang dibuat di menu Kelola User.</p>
        </div>
        <Link to="/admin/users/accounts" className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <Users className="h-4 w-4" />
          Kelola User
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900">{totalMembers}</p>
              <p className="text-xs text-neutral-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900">{activeMembers}</p>
              <p className="text-xs text-neutral-500">Aktif</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Cari nama, NPM, atau email..."
            className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-neutral-600">Memuat data...</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchMembers} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && filteredMembers.length === 0 && (
        <EmptyState icon={q.trim() ? 'search' : 'inbox'} title={q ? 'Tidak ditemukan' : 'Belum ada anggota'} description={q ? 'Coba ubah kata kunci pencarian.' : 'Belum ada data anggota untuk ditampilkan.'} />
      )}

      {!loading && !error && filteredMembers.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-neutral-700">Nama</th>
                  <th className="text-left p-4 font-semibold text-neutral-700">Email</th>
                  <th className="text-left p-4 font-semibold text-neutral-700">NPM</th>
                  <th className="text-left p-4 font-semibold text-neutral-700">Prodi</th>
                  {/* <th className="text-left p-4 font-semibold text-neutral-700">Role</th> */}
                  <th className="text-left p-4 font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name || member.email} src={member.avatar || ''} size={40} />
                        <p className="font-medium text-neutral-900 truncate">{member.name || member.email?.split?.('@')?.[0] || '-'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600 truncate">{member.email || '-'}</td>
                    <td className="p-4 text-neutral-600">{member.npm || '-'}</td>
                    <td className="p-4 text-neutral-600">{member.studyProgram || '-'}</td>
                    {/* <td className="p-4 text-neutral-700">{ROLE_LABEL[String(member.role)] || member.role || '-'}</td> */}
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>{member.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
