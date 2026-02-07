import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Search, Wallet, Users, TrendingUp, Edit2, Save, X, RefreshCw, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';

const months = [
  { key: 'oktober', label: 'Okt', full: 'Oktober' },
  { key: 'november', label: 'Nov', full: 'November' },
  { key: 'desember', label: 'Des', full: 'Desember' },
  { key: 'januari', label: 'Jan', full: 'Januari' },
  { key: 'februari', label: 'Feb', full: 'Februari' },
  { key: 'maret', label: 'Mar', full: 'Maret' },
  { key: 'april', label: 'Apr', full: 'April' },
  { key: 'mei', label: 'Mei', full: 'Mei' },
  { key: 'juni', label: 'Jun', full: 'Juni' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatCurrencyShort(value) {
  if (!value || value === 0) return 'Rp0';
  if (value >= 1000000) return 'Rp' + (value / 1000000).toFixed(1) + 'jt';
  if (value >= 1000) return 'Rp' + (value / 1000).toFixed(0) + 'rb';
  return 'Rp' + value.toString();
}

export default function Treasury() {
  const [tab, setTab] = useState('members'); // members | transactions

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  // Kas Umum (transactions)
  const [tx, setTx] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txYear, setTxYear] = useState(String(new Date().getFullYear()));
  const [txSummary, setTxSummary] = useState({ totalIncome: 0, totalExpense: 0, net: 0, incomeCount: 0, expenseCount: 0 });

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txSaving, setTxSaving] = useState(false);
  const [txEditing, setTxEditing] = useState(null);
  const [txForm, setTxForm] = useState({
    type: 'INCOME',
    amount: 0,
    occurredAt: new Date().toISOString().slice(0, 10),
    category: '',
    description: '',
    reference: '',
  });

  // Edit modal
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('/treasury');
      setData(response?.data || []);
    } catch (err) {
      console.error('Failed to fetch treasury:', err);
      setError(err.message || 'Gagal memuat data rekapitulasi kas');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    setTxError(null);
    try {
      const qs = txYear ? `?year=${encodeURIComponent(txYear)}` : '';
      const [listRes, sumRes] = await Promise.all([apiRequest(`/treasury/transactions${qs}`), apiRequest(`/treasury/transactions/summary${qs}`)]);
      setTx(listRes?.data || []);
      setTxSummary(sumRes?.data || { totalIncome: 0, totalExpense: 0, net: 0, incomeCount: 0, expenseCount: 0 });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTxError(err.message || 'Gagal memuat transaksi kas');
    } finally {
      setTxLoading(false);
    }
  }, [txYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tab === 'transactions') fetchTransactions();
  }, [tab, fetchTransactions]);

  const filteredData = q.trim() ? data.filter((row) => row.nama?.toLowerCase().includes(q.toLowerCase()) || row.jabatan?.toLowerCase().includes(q.toLowerCase())) : data;

  const calculateTotal = (row) => {
    return months.reduce((sum, m) => sum + (row[m.key] || 0), 0);
  };

  const grandTotal = data.reduce((sum, row) => sum + calculateTotal(row), 0);
  const monthlyTotals = months.reduce((acc, m) => {
    acc[m.key] = data.reduce((sum, row) => sum + (row[m.key] || 0), 0);
    return acc;
  }, {});

  const openEditModal = (row) => {
    setEditingRow(row);
    const formData = {};
    months.forEach((m) => {
      formData[m.key] = row[m.key] || 0;
    });
    setEditForm(formData);
  };

  const closeEditModal = () => {
    setEditingRow(null);
    setEditForm({});
  };

  const handleEditChange = (month, value) => {
    setEditForm((prev) => ({
      ...prev,
      [month]: Number(value) || 0,
    }));
  };

  const handleSave = async () => {
    if (!editingRow) return;

    setSaving(true);
    try {
      const response = await apiRequest(`/treasury/member/${editingRow.id}`, {
        method: 'PUT',
        body: editForm,
      });

      // Update local data
      const updated = response?.data;
      if (updated) {
        setData((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      }
      closeEditModal();
    } catch (err) {
      console.error('Failed to save treasury:', err);
      alert(err.message || 'Gagal menyimpan data kas');
    } finally {
      setSaving(false);
    }
  };

  const editTotal = months.reduce((sum, m) => sum + (editForm[m.key] || 0), 0);

  const openTxModal = (row) => {
    if (row) {
      setTxEditing(row);
      setTxForm({
        type: row.type || 'INCOME',
        amount: row.amount || 0,
        occurredAt: row.occurredAt ? new Date(row.occurredAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        category: row.category || '',
        description: row.description || '',
        reference: row.reference || '',
      });
    } else {
      setTxEditing(null);
      setTxForm({
        type: 'INCOME',
        amount: 0,
        occurredAt: new Date().toISOString().slice(0, 10),
        category: '',
        description: '',
        reference: '',
      });
    }
    setTxModalOpen(true);
  };

  const closeTxModal = () => {
    setTxModalOpen(false);
    setTxEditing(null);
  };

  const saveTx = async () => {
    setTxSaving(true);
    try {
      const payload = {
        type: txForm.type,
        amount: Number(txForm.amount) || 0,
        occurredAt: txForm.occurredAt ? new Date(`${txForm.occurredAt}T00:00:00.000Z`).toISOString() : undefined,
        category: txForm.category,
        description: txForm.description,
        reference: txForm.reference,
      };
      if (txEditing?.id) {
        await apiRequest(`/treasury/transactions/${txEditing.id}`, { method: 'PATCH', body: payload });
      } else {
        await apiRequest('/treasury/transactions', { method: 'POST', body: payload });
      }
      closeTxModal();
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert(err.message || 'Gagal menyimpan transaksi kas');
    } finally {
      setTxSaving(false);
    }
  };

  const deleteTx = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await apiRequest(`/treasury/transactions/${id}`, { method: 'DELETE' });
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert(err.message || 'Gagal menghapus transaksi');
    }
  };

  return (
    <div className="px-6 md:px-10 py-6">
      <nav className="mb-4 flex items-center text-sm text-neutral-600">
        <Link to="/dashboard" className="hover:text-neutral-800 hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="text-neutral-900 font-medium">Rekapitulasi Kas</span>
      </nav>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Rekapitulasi Kas</h2>
          <p className="text-sm text-neutral-600">Kelola kas anggota dan kas umum.</p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {tab === 'transactions' ? (
            <>
              <button onClick={openTxModal} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm">
                <Plus className="h-4 w-4" />
                Tambah Transaksi
              </button>
              <button onClick={fetchTransactions} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </>
          ) : (
            <button onClick={fetchData} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:scale-[0.99] shadow-sm">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setTab('members')}
          className={`rounded-lg px-3 py-2 text-sm font-medium border ${tab === 'members' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
        >
          Kas Anggota
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`rounded-lg px-3 py-2 text-sm font-medium border ${tab === 'transactions' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
        >
          Kas Umum
        </button>
      </div>

      {tab === 'members' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.length}</p>
                  <p className="text-xs text-blue-100">Anggota</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrencyShort(grandTotal)}</p>
                  <p className="text-xs text-emerald-100">Total Kas</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.length > 0 ? formatCurrencyShort(grandTotal / data.length) : 'Rp0'}</p>
                  <p className="text-xs text-violet-100">Rata-rata</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Filters + Stats */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <input value={txYear} onChange={(e) => setTxYear(e.target.value)} className="w-28 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm" placeholder="Tahun" />
              <button onClick={fetchTransactions} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm">
                <RefreshCw className="h-4 w-4" />
                Terapkan
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatCurrencyShort(txSummary.totalIncome)}</p>
                    <p className="text-xs text-emerald-100">Pemasukan</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatCurrencyShort(txSummary.totalExpense)}</p>
                    <p className="text-xs text-rose-100">Pengeluaran</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatCurrencyShort(txSummary.net)}</p>
                    <p className="text-xs text-slate-200">Saldo (Net)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {txLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <span className="ml-3 text-neutral-600">Memuat transaksi...</span>
            </div>
          )}

          {txError && !txLoading && (
            <EmptyState
              icon="error"
              variant="warning"
              title="Gagal memuat transaksi"
              description={txError}
              action={
                <button onClick={fetchTransactions} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  Coba Lagi
                </button>
              }
            />
          )}

          {!txLoading && !txError && tx.length === 0 && <EmptyState icon="inbox" title="Belum ada transaksi" description="Transaksi kas umum akan muncul setelah ada pemasukan/pengeluaran yang dicatat." />}

          {!txLoading && !txError && tx.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="divide-y divide-neutral-100">
                {tx.map((row) => {
                  const isIncome = row.type === 'INCOME';
                  return (
                    <div key={row.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isIncome ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-neutral-900">{isIncome ? 'Pemasukan' : 'Pengeluaran'}</p>
                            <span className="text-xs text-neutral-500">•</span>
                            <p className="text-sm text-neutral-600">{new Date(row.occurredAt).toLocaleDateString('id-ID')}</p>
                            {row.category ? (
                              <>
                                <span className="text-xs text-neutral-500">•</span>
                                <span className="text-xs rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">{row.category}</span>
                              </>
                            ) : null}
                          </div>
                          {row.description ? <p className="text-sm text-neutral-700 mt-1 whitespace-pre-wrap">{row.description}</p> : null}
                          <p className="text-xs text-neutral-500 mt-1">Dicatat oleh: {row.createdBy?.profile?.name || row.createdBy?.email || '—'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <p className={`text-base font-bold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(row.amount)}</p>
                        <button onClick={() => openTxModal(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" title="Edit">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button onClick={() => deleteTx(row.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'members' && (
        <>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="Cari nama atau jabatan..."
                className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-200"
              />
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
            <EmptyState
              icon="error"
              variant="warning"
              title="Gagal memuat data"
              description={error}
              action={
                <button onClick={fetchData} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  Coba Lagi
                </button>
              }
            />
          )}

          {/* Empty State */}
          {!loading && !error && filteredData.length === 0 && (
            <EmptyState icon={q.trim() ? 'search' : 'inbox'} title={q ? 'Tidak ditemukan' : 'Belum ada data kas'} description={q ? 'Coba ubah kata kunci pencarian.' : 'Data kas akan muncul setelah ada anggota yang terdaftar.'} />
          )}

          {/* Table */}
          {!loading && !error && filteredData.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="w-12 text-center p-3 font-semibold text-neutral-700">No</th>
                      <th className="text-left p-3 font-semibold text-neutral-700 min-w-[180px]">Nama</th>
                      <th className="text-left p-3 font-semibold text-neutral-700">Jabatan</th>
                      {months.map((m) => (
                        <th key={m.key} className="text-center p-3 font-semibold text-neutral-700 min-w-[80px]">
                          {m.label}
                        </th>
                      ))}
                      <th className="text-right p-3 font-semibold text-neutral-700 min-w-[100px]">Total</th>
                      <th className="text-center p-3 font-semibold text-neutral-700 w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredData.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="text-center p-3 text-neutral-600">{row.no || idx + 1}</td>
                        <td className="p-3 font-medium text-neutral-900">{row.nama}</td>
                        <td className="p-3 text-neutral-600">{row.jabatan || '-'}</td>
                        {months.map((m) => (
                          <td key={m.key} className={`text-center p-3 ${row[m.key] > 0 ? 'text-emerald-600 font-medium' : 'text-neutral-400'}`}>
                            {row[m.key] > 0 ? formatCurrencyShort(row[m.key]) : '-'}
                          </td>
                        ))}
                        <td className="text-right p-3 font-semibold text-neutral-900">{formatCurrency(calculateTotal(row))}</td>
                        <td className="text-center p-3">
                          <button onClick={() => openEditModal(row)} className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-all" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-100 border-t-2 border-neutral-300">
                    <tr>
                      <td colSpan={3} className="p-3 font-bold text-neutral-900 text-right">
                        Total
                      </td>
                      {months.map((m) => (
                        <td key={m.key} className="text-center p-3 font-semibold text-neutral-700">
                          {formatCurrencyShort(monthlyTotals[m.key])}
                        </td>
                      ))}
                      <td className="text-right p-3 font-bold text-primary-600">{formatCurrency(grandTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingRow && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Edit Data Kas</h3>
                    <p className="text-sm text-neutral-500">{editingRow.nama}</p>
                  </div>
                  <button onClick={closeEditModal} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {months.map((month) => (
                      <div key={month.key}>
                        <label className="block text-xs text-neutral-500 mb-1.5">{month.full}</label>
                        <input
                          type="number"
                          value={editForm[month.key] || 0}
                          onChange={(e) => handleEditChange(month.key, e.target.value)}
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-center text-sm outline-none focus:ring-2 focus:ring-primary-200"
                          min="0"
                          step="1000"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                    <div className="text-sm text-neutral-500">
                      Total: <span className="font-bold text-neutral-900">{formatCurrency(editTotal)}</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={closeEditModal} className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors" disabled={saving}>
                        Batal
                      </button>
                      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-all">
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transaction Modal */}
      {txModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{txEditing ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas'}</h3>
                <p className="text-sm text-neutral-500">Pemasukan atau pengeluaran kas umum.</p>
              </div>
              <button onClick={closeTxModal} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tipe</label>
                  <select value={txForm.type} onChange={(e) => setTxForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal</label>
                  <input type="date" value={txForm.occurredAt} onChange={(e) => setTxForm((p) => ({ ...p, occurredAt: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nominal</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={txForm.amount}
                    onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                    placeholder="contoh: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Kategori (opsional)</label>
                  <input
                    type="text"
                    value={txForm.category}
                    onChange={(e) => setTxForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                    placeholder="contoh: Donasi, Konsumsi, ATK"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows={3}
                  value={txForm.description}
                  onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                  placeholder="contoh: Uang kas masuk dari sponsor acara..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Referensi (opsional)</label>
                <input
                  type="text"
                  value={txForm.reference}
                  onChange={(e) => setTxForm((p) => ({ ...p, reference: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                  placeholder="contoh: bukti transfer #123"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeTxModal} className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors" disabled={txSaving}>
                  Batal
                </button>
                <button onClick={saveTx} disabled={txSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-all">
                  {txSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {txEditing ? 'Simpan Perubahan' : 'Simpan'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
