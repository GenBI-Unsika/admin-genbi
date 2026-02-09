import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, FileText, Clock, CheckCircle, XCircle, Eye, Download, Upload, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { apiGet, apiPatch, apiRequest } from '../utils/api';
import EmptyState from '../components/EmptyState';

const STATUS_MAP = {
  DIAJUKAN: { label: 'Diajukan', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  DIPROSES: { label: 'Diproses', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  DISETUJUI: { label: 'Disetujui', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export default function Dispensations() {
  const [dispensations, setDispensations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const loadDispensations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await apiGet(`/dispensations?${params.toString()}`);
      setDispensations(res.data || res || []);
      if (res.meta) {
        setPagination((p) => ({ ...p, total: res.meta.total }));
      }
    } catch (err) {
      console.error('Failed to load dispensations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTemplate = async () => {
    try {
      const res = await apiGet('/dispensations/template/active');
      setActiveTemplate(res.data || res || null);
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadDispensations();
    loadActiveTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.page]);

  const handleStatusUpdate = async (id, status, reviewNotes = '') => {
    try {
      await apiPatch(`/dispensations/${id}/status`, { status, reviewNotes });
      setReviewModal(false);
      setSelectedItem(null);
      loadDispensations();
    } catch (err) {
      alert('Gagal mengupdate status: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleTemplateUpload = async (file) => {
    const formData = new FormData();
    formData.append('template', file);

    try {
      await apiRequest('/dispensations/template/upload', { method: 'POST', body: formData });
      setTemplateModal(false);
      loadActiveTemplate();
      alert('Template berhasil diupload');
    } catch (err) {
      alert('Gagal mengupload template: ' + (err?.message || 'Unknown error'));
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return dispensations;
    const q = search.toLowerCase();
    return dispensations.filter((d) => d.nama?.toLowerCase().includes(q) || d.npm?.toLowerCase().includes(q) || d.kegiatan?.toLowerCase().includes(q));
  }, [dispensations, search]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="px-4 md:px-6 lg:px-10 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-900">Kelola Dispensasi</h1>
          <p className="text-sm text-neutral-600 mt-1">Review dan kelola pengajuan dispensasi anggota</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTemplateModal(true)} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            <Upload className="w-4 h-4" />
            Template
          </button>
          <button onClick={loadDispensations} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NPM, atau kegiatan..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="DIAJUKAN">Diajukan</option>
            <option value="DIPROSES">Diproses</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon={search || statusFilter ? 'search' : 'box'}
          title={search || statusFilter ? 'Tidak ada hasil' : 'Belum ada pengajuan dispensasi'}
          description={search || statusFilter ? 'Coba ubah filter atau kata kunci pencarian.' : 'Pengajuan dispensasi dari anggota akan muncul di sini.'}
          variant={search || statusFilter ? 'default' : 'primary'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">NPM</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">Kegiatan</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const status = STATUS_MAP[item.status] || STATUS_MAP.DIAJUKAN;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-neutral-900">{item.nama}</p>
                          <p className="text-xs text-neutral-500">{item.user?.email || item.prodi || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{item.npm}</td>
                      <td className="px-4 py-3 text-neutral-700 max-w-[200px] truncate">{item.kegiatan}</td>
                      <td className="px-4 py-3 text-neutral-600">{formatDate(item.tanggal)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setReviewModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-neutral-100 transition"
                            title="Review"
                          >
                            <Eye className="w-4 h-4 text-neutral-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && selectedItem && <ReviewModal item={selectedItem} onClose={() => setReviewModal(false)} onUpdate={handleStatusUpdate} />}

      {/* Template Modal */}
      {templateModal && <TemplateModal template={activeTemplate} onClose={() => setTemplateModal(false)} onUpload={handleTemplateUpload} />}
    </div>
  );
}

function ReviewModal({ item, onClose, onUpdate }) {
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.reviewNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onUpdate(item.id, status, notes);
    } finally {
      setSaving(false);
    }
  };

  const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.DIAJUKAN;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Review Dispensasi</h3>
        </div>

        <div className="p-5 space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Nama</p>
              <p className="font-medium text-neutral-900">{item.nama}</p>
            </div>
            <div>
              <p className="text-neutral-500">NPM</p>
              <p className="font-medium text-neutral-900">{item.npm}</p>
            </div>
            <div>
              <p className="text-neutral-500">Fakultas</p>
              <p className="font-medium text-neutral-900">{item.fakultas || '-'}</p>
            </div>
            <div>
              <p className="text-neutral-500">Prodi</p>
              <p className="font-medium text-neutral-900">{item.prodi || '-'}</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-neutral-500">Kegiatan</p>
            <p className="font-medium text-neutral-900">{item.kegiatan}</p>
          </div>

          <div className="text-sm">
            <p className="text-neutral-500">Tanggal</p>
            <p className="font-medium text-neutral-900">{new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {item.alasan && (
            <div className="text-sm">
              <p className="text-neutral-500">Alasan</p>
              <p className="text-neutral-700">{item.alasan}</p>
            </div>
          )}

          <div className="text-sm">
            <p className="text-neutral-500 mb-1">Status Saat Ini</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>

          <hr className="border-neutral-200" />

          {/* Update Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Ubah Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="DIAJUKAN">Diajukan</option>
              <option value="DIPROSES">Diproses</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Catatan Review</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Tambahkan catatan untuk pemohon (opsional)"
            />
          </div>
        </div>

        <div className="p-5 border-t border-neutral-200 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateModal({ template, onClose, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Template Dispensasi</h3>
        </div>

        <div className="p-5 space-y-4">
          {template ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Template Aktif</p>
                  <p className="text-sm text-green-700 mt-1">{template.fileName || 'template-dispensasi.docx'}</p>
                  <p className="text-xs text-green-600 mt-1">Diupload: {new Date(template.uploadedAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Belum Ada Template</p>
                  <p className="text-sm text-yellow-700 mt-1">Upload template Word (.docx) untuk generate surat dispensasi</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Upload Template Baru</label>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium"
            />
            <p className="text-xs text-neutral-500 mt-1">Format: .doc atau .docx (maks 10MB)</p>
          </div>
        </div>

        <div className="p-5 border-t border-neutral-200 flex justify-end">
          <button onClick={onClose} disabled={uploading} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
