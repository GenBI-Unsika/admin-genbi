import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Award, TrendingUp, Users, ChevronDown, Loader2, RefreshCw, X } from 'lucide-react';
import { apiGet, apiRequest, apiPatch, apiDelete } from '../utils/api';
import { useConfirm } from '../contexts/ConfirmContext';

export default function Points() {
  const { confirm } = useConfirm();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // { memberId, activity }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/leaderboard');
      setLeaderboard(res.data || res || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoint = async (data) => {
    try {
      await apiRequest('/leaderboard/points', { method: 'POST', body: data });
      setAddModal(false);
      loadLeaderboard();
    } catch (err) {
      alert('Gagal menambah poin: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleEditPoint = async (memberId, pointId, data) => {
    try {
      await apiPatch(`/leaderboard/points/${memberId}/${pointId}`, data);
      setEditModal(null);
      loadLeaderboard();
    } catch (err) {
      alert('Gagal mengupdate poin: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDeletePoint = async (memberId, pointId) => {
    const ok = await confirm({
      title: 'Hapus Poin?',
      description: 'Poin ini akan dihapus permanen.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!ok) return;

    try {
      await apiDelete(`/leaderboard/points/${memberId}/${pointId}`);
      loadLeaderboard();
    } catch (err) {
      alert('Gagal menghapus poin: ' + (err?.message || 'Unknown error'));
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return leaderboard;
    const q = search.toLowerCase();
    return leaderboard.filter((m) => m.name?.toLowerCase().includes(q) || m.division?.toLowerCase().includes(q));
  }, [leaderboard, search]);

  // Stats
  const stats = useMemo(() => {
    const totalMembers = leaderboard.length;
    const totalPoints = leaderboard.reduce((sum, m) => sum + (m.points || 0), 0);
    const avgPoints = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;
    return { totalMembers, totalPoints, avgPoints };
  }, [leaderboard]);

  return (
    <div className="px-4 md:px-6 lg:px-10 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-900">Kelola Poin Kegiatan</h1>
          <p className="text-sm text-neutral-600 mt-1">Tambah, edit, dan hapus poin kegiatan anggota</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            <Plus className="w-4 h-4" />
            Tambah Poin
          </button>
          <button onClick={loadLeaderboard} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{stats.totalMembers}</p>
              <p className="text-sm text-neutral-500">Total Anggota</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{stats.totalPoints.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">Total Poin</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{stats.avgPoints}</p>
              <p className="text-sm text-neutral-500">Rata-rata Poin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau divisi..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600">Belum ada data poin</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">Anggota</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">Divisi</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700">Poin</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700">Online</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700">Offline</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((member, idx) => (
                  <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition">
                    <td className="px-4 py-3 text-neutral-500 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">{member.name?.charAt(0)?.toUpperCase()}</div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-900">{member.name}</p>
                          <p className="text-xs text-neutral-500">{member.jabatan || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{member.division || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-primary-600">{member.points || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-600">{member.online || 0}</td>
                    <td className="px-4 py-3 text-center text-neutral-600">{member.offline || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button onClick={() => setSelectedMember(member)} className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition">
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(activity) =>
            setEditModal({
              memberId: selectedMember.id,
              activity,
            })
          }
          onDelete={(pointId) => handleDeletePoint(selectedMember.id, pointId)}
        />
      )}

      {/* Add Point Modal */}
      {addModal && <AddPointModal members={leaderboard} onClose={() => setAddModal(false)} onSubmit={handleAddPoint} />}

      {/* Edit Point Modal */}
      {editModal && <EditPointModal memberId={editModal.memberId} activity={editModal.activity} onClose={() => setEditModal(null)} onSubmit={handleEditPoint} />}
    </div>
  );
}

function MemberDetailModal({ member, onClose, onEdit, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">{member.name?.charAt(0)?.toUpperCase()}</div>
            )}
            <div>
              <h3 className="font-semibold text-neutral-900">{member.name}</h3>
              <p className="text-sm text-neutral-500">{member.division || '-'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <p className="text-2xl font-semibold text-primary-700">{member.points || 0}</p>
              <p className="text-xs text-primary-600">Total Poin</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-semibold text-blue-700">{member.online || 0}</p>
              <p className="text-xs text-blue-600">Kegiatan Online</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-semibold text-green-700">{member.offline || 0}</p>
              <p className="text-xs text-green-600">Kegiatan Offline</p>
            </div>
          </div>

          {/* Activities */}
          <h4 className="font-medium text-neutral-900 mb-3">Riwayat Kegiatan</h4>
          {member.activities?.length > 0 ? (
            <div className="space-y-2">
              {member.activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800 text-sm">{act.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${act.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{act.type}</span>
                      <span className="text-xs text-neutral-500">{act.date || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary-600 mr-2">+{act.points}</span>
                    <button onClick={() => onEdit(act)} className="p-1.5 hover:bg-neutral-200 rounded transition">
                      <Edit2 className="w-3.5 h-3.5 text-neutral-600" />
                    </button>
                    <button onClick={() => onDelete(act.id)} className="p-1.5 hover:bg-red-100 rounded transition">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-6">Belum ada riwayat kegiatan</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AddPointModal({ members, onClose, onSubmit }) {
  const [form, setForm] = useState({
    memberId: '',
    name: '',
    points: '',
    type: 'offline',
    date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.name || !form.points) {
      alert('Semua field wajib diisi');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Tambah Poin</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Pilih Anggota</label>
            <select
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">-- Pilih Anggota --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.division || 'No Division'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nama Kegiatan</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Contoh: Rapat Koordinasi"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jumlah Poin</label>
              <input
                type="number"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="10"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipe</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPointModal({ memberId, activity, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: activity.name || '',
    points: activity.points || '',
    type: activity.type || 'offline',
    date: activity.date || new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(memberId, activity.id, form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Edit Poin</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nama Kegiatan</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jumlah Poin</label>
              <input
                type="number"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipe</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
