import { useMemo, useState } from 'react';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { Search } from 'lucide-react';

const formatID = (n) => new Intl.NumberFormat('id-ID').format(n);

export default function ScholarshipList() {
  const [q, setQ] = useState('');

  // Contoh data — sesuaikan dengan API kamu (pakai field: photo, name, npm, prodi, date, status)
  const data = useMemo(
    () => [
      {
        id: 1,
        name: 'Devi Fitriani Maulana',
        npm: '2010631250000',
        prodi: 'Sistem Informasi',
        date: '2024-03-07',
        status: 'Completed',
        photo: '', // pasang URL foto jika ada
      },
      {
        id: 2,
        name: 'Adeeva Caria',
        npm: '213450987634',
        prodi: 'Ilmu Komunikasi',
        date: '2024-03-07',
        status: 'Pending',
        photo: '',
      },
      {
        id: 3,
        name: 'Ahad Fayroz',
        npm: '211760054321',
        prodi: 'Teknik Industri',
        date: '2024-03-08',
        status: 'Rejected',
        photo: '',
      },
      // ...dst
    ],
    []
  );

  const filtered = data.filter((row) => {
    const s = `${row.name} ${row.npm} ${row.prodi}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div className="px-6 md:px-10 py-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">Peserta Pendaftar Beasiswa</h3>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Temukan" className="h-9 w-56 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-3.5 pr-3 font-medium">Nama</th>
                <th className="px-3 py-3.5 font-medium">NPM</th>
                <th className="px-3 py-3.5 font-medium">Prodi</th>
                <th className="px-3 py-3.5 font-medium">Timestamp</th>
                <th className="px-3 py-3.5 font-medium">Administrasi</th>
                <th className="px-3 py-3.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-neutral-200 text-neutral-800">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} src={row.photo} size={32} />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600">{row.npm}</td>
                  <td className="px-3 py-3.5 text-neutral-600">{row.prodi}</td>
                  <td className="px-3 py-3.5 text-neutral-600">
                    {new Date(row.date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex justify-end">
                      <a href={`/beasiswa/${row.id}`} className="text-primary-500 hover:underline">
                        Lihat Detail
                      </a>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-neutral-500">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination dummy */}
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <span className="text-neutral-500">1</span>
          <span className="text-neutral-400">of</span>
          <span className="text-neutral-500">20</span>
          <button className="h-8 w-8 rounded-md border border-neutral-200">‹</button>
          <button className="h-8 w-8 rounded-md border border-neutral-200">›</button>
        </div>
      </div>
    </div>
  );
}
