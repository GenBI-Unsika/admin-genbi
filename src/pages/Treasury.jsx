import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Search, Wallet, Users, TrendingUp, Edit2, Save, X, RefreshCw, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { apiRequest } from '../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useConfirm } from '../contexts/ConfirmContext';

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
  const [tab, setTab] = useState('members'); // members | transactions (keduanya dalam bahasa inggris di kode, tapi UI pakai Indonesia)

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

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

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.map((row, idx) => {
      const rowData = {
        No: row.no || idx + 1,
        Nama: row.nama,
        Jabatan: row.jabatan || '-',
      };
      months.forEach((m) => {
        rowData[m.full] = row[m.key] || 0;
      });
      rowData['Total'] = calculateTotal(row);
      return rowData;
    });

    // Add total row
    const totalRow = {
      No: '',
      Nama: 'TOTAL KESELURUHAN',
      Jabatan: '',
    };
    months.forEach((m) => {
      totalRow[m.full] = monthlyTotals[m.key];
    });
    totalRow['Total'] = grandTotal;
    exportData.push(totalRow);

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kas Anggota');
    XLSX.writeFile(wb, `Rekapitulasi-Kas-Anggota-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REKAPITULASI KAS ANGGOTA', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('GenBI Unsika - Periode 2024/2025', pageWidth / 2, 22, { align: 'center' });
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, 28, { align: 'center' });

    // Table headers
    const headers = [['No', 'Nama', 'Jabatan', ...months.map((m) => m.label), 'Total']];

    // Table body
    const body = filteredData.map((row, idx) => [row.no || idx + 1, row.nama, row.jabatan || '-', ...months.map((m) => formatCurrency(row[m.key] || 0)), formatCurrency(calculateTotal(row))]);

    // Total row
    body.push(['', 'TOTAL KESELURUHAN', '', ...months.map((m) => formatCurrency(monthlyTotals[m.key])), formatCurrency(grandTotal)]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
      },
      didParseCell: (data) => {
        // Style total row
        if (data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
        }
      },
    });

    doc.save(`Rekapitulasi-Kas-Anggota-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Export Transactions to Excel
  const exportTxToExcel = () => {
    const exportData = tx.map((row, idx) => ({
      No: idx + 1,
      Tanggal: new Date(row.occurredAt).toLocaleDateString('id-ID'),
      Tipe: row.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      Nominal: row.amount || 0,
      Deskripsi: row.description || '-',
      Referensi: row.reference || '-',
      'Dicatat oleh': row.createdBy?.profile?.name || row.createdBy?.email || '-',
    }));

    // Add summary row
    exportData.push({});
    exportData.push({ No: '', Tanggal: 'RINGKASAN', Tipe: '', Nominal: '', Deskripsi: '', Referensi: '', 'Dicatat oleh': '' });
    exportData.push({ No: '', Tanggal: 'Total Pemasukan', Tipe: '', Nominal: txSummary.totalIncome, Deskripsi: '', Referensi: '', 'Dicatat oleh': '' });
    exportData.push({ No: '', Tanggal: 'Total Pengeluaran', Tipe: '', Nominal: txSummary.totalExpense, Deskripsi: '', Referensi: '', 'Dicatat oleh': '' });
    exportData.push({ No: '', Tanggal: 'Saldo Bersih', Tipe: '', Nominal: txSummary.net, Deskripsi: '', Referensi: '', 'Dicatat oleh': '' });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kas Umum');
    XLSX.writeFile(wb, `Kas-Umum-${txYear || 'All'}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export Transactions to PDF
  const exportTxToPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN KAS UMUM', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`GenBI Unsika - Tahun ${txYear || 'Semua'}`, pageWidth / 2, 22, { align: 'center' });
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, 28, { align: 'center' });

    // Summary
    doc.setFontSize(10);
    doc.text(`Total Pemasukan: ${formatCurrency(txSummary.totalIncome)}`, 14, 38);
    doc.text(`Total Pengeluaran: ${formatCurrency(txSummary.totalExpense)}`, 14, 44);
    doc.setFont('helvetica', 'bold');
    doc.text(`Saldo Bersih: ${formatCurrency(txSummary.net)}`, 14, 50);
    doc.setFont('helvetica', 'normal');

    // Table
    const headers = [['No', 'Tanggal', 'Tipe', 'Nominal', 'Deskripsi']];
    const body = tx.map((row, idx) => [idx + 1, new Date(row.occurredAt).toLocaleDateString('id-ID'), row.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran', formatCurrency(row.amount), row.description || '-']);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 56,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { halign: 'right', cellWidth: 35 },
        4: { cellWidth: 'auto' },
      },
    });

    doc.save(`Kas-Umum-${txYear || 'All'}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

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
      const response = await apiRequest(`/treasury/user/${editingRow.id}`, {
        method: 'PUT',
        body: editForm,
      });

      // Update data lokal
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

  const { confirm } = useConfirm();

  const [moreOptions, setMoreOptions] = useState(false);

  const deleteTx = async (id) => {
    const isConfirmed = await confirm({
      title: 'Hapus Transaksi',
      description: 'Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!isConfirmed) return;

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
          <p className="text-sm text-neutral-600">{tab === 'members' ? 'Rekap pembayaran kas bulanan per anggota GenBI.' : 'Catatan pemasukan dan pengeluaran kas organisasi.'}</p>
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {tab === 'transactions' ? (
            <>
              <button onClick={() => openTxModal()} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm">
                <Plus className="h-4 w-4" />
                Tambah Transaksi
              </button>
              <button
                onClick={exportTxToPDF}
                disabled={tx.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export ke PDF"
              >
                <FileText className="h-4 w-4 text-red-500" />
                PDF
              </button>
              <button
                onClick={exportTxToExcel}
                disabled={tx.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export ke Excel"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Excel
              </button>
              <button onClick={fetchTransactions} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm">
                <RefreshCw className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              {/* Export Buttons */}
              <button
                onClick={exportToPDF}
                disabled={data.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export ke PDF"
              >
                <FileText className="h-4 w-4 text-red-500" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                disabled={data.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export ke Excel"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Excel
              </button>
              <button onClick={fetchData} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:scale-[0.99] shadow-sm">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setTab('members')}
          className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${tab === 'members' ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
        >
          Kas Anggota
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${tab === 'transactions' ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
        >
          Kas Umum
        </button>
      </div>

      {tab === 'members' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.length}</p>
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
                  <p className="text-2xl font-bold text-white">{formatCurrencyShort(grandTotal)}</p>
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
                  <p className="text-2xl font-bold text-white">{data.length > 0 ? formatCurrencyShort(grandTotal / data.length) : 'Rp0'}</p>
                  <p className="text-xs text-violet-100">Rata-rata</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <input value={txYear} onChange={(e) => setTxYear(e.target.value)} className="w-28 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm" placeholder="Tahun" />
              <button onClick={fetchTransactions} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm">
                <RefreshCw className="h-4 w-4" />
                Terapkan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:max-w-xl lg:max-w-2xl">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{formatCurrencyShort(txSummary.totalIncome)}</p>
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
                    <p className="text-xl font-bold text-white">{formatCurrencyShort(txSummary.totalExpense)}</p>
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
                    <p className="text-xl font-bold text-white">{formatCurrencyShort(txSummary.net)}</p>
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-neutral-900">{isIncome ? 'Pemasukan' : 'Pengeluaran'}</p>
                            <Calendar className='h-3 w-3 text-neutral-500' />
                            <span className="text-sm text-neutral-500">{new Date(row.occurredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <span className="ml-3 text-neutral-600">Memuat data...</span>
            </div>
          )}

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

          {!loading && !error && filteredData.length === 0 && (
            <EmptyState icon={q.trim() ? 'search' : 'inbox'} title={q ? 'Tidak ditemukan' : 'Belum ada data kas'} description={q ? 'Coba ubah kata kunci pencarian.' : 'Data kas akan muncul setelah ada anggota yang terdaftar.'} />
          )}

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

      {txModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{txEditing ? 'Edit Transaksi Kas' : 'Tambah Transaksi'}</h3>
                <p className="text-sm text-neutral-500">Catat pemasukan atau pengeluaran.</p>
              </div>
              <button onClick={closeTxModal} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tipe Transaksi - Segmented Control */}
              <div className="p-1 bg-neutral-100 rounded-lg flex">
                <button
                  type="button"
                  onClick={() => setTxForm((p) => ({ ...p, type: 'INCOME' }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${txForm.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setTxForm((p) => ({ ...p, type: 'EXPENSE' }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${txForm.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  Pengeluaran
                </button>
              </div>

              {/* Nominal with formatted display */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nominal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={txForm.amount ? Number(txForm.amount).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setTxForm((p) => ({ ...p, amount: raw ? parseInt(raw, 10) : 0 }));
                    }}
                    className="w-full text-lg font-semibold rounded-lg border border-neutral-200 bg-white pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-primary-200 placeholder:text-neutral-300"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Contoh: 1.000.000 (otomatis terformat)</p>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={txForm.occurredAt}
                  onChange={(e) => setTxForm((p) => ({ ...p, occurredAt: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              {/* Deskripsi (menggantikan Kategori) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={txForm.description}
                  onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                  placeholder="Contoh: Iuran kas bulan Januari, Pembelian ATK, dll."
                />
              </div>

              {/* Toggle More Options */}
              <div>
                <button type="button" onClick={() => setMoreOptions(!moreOptions)} className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                  {moreOptions ? 'Sembunyikan Opsi Tambahan' : 'Tampilkan Opsi Tambahan (Referensi)'}
                </button>
              </div>

              {moreOptions && (
                <div className="space-y-3 pt-2 border-t border-neutral-100 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">No. Referensi / Bukti</label>
                    <input
                      type="text"
                      value={txForm.reference}
                      onChange={(e) => setTxForm((p) => ({ ...p, reference: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200"
                      placeholder="Contoh: TF-12345, INV-001"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-2">
                <button onClick={closeTxModal} className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors" disabled={txSaving}>
                  Batal
                </button>
                <button onClick={saveTx} disabled={txSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all shadow-sm">
                  {txSaving ? (
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
      )}
    </div>
  );
}
