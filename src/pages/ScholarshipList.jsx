import { Link } from "react-router-dom";

const rows = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: [
    "Devi Fitriani Maulana",
    "Adeeva Caria",
    "Ahad Fayroz",
    "Craig Kenter",
    "Gustavo Dorc",
    "Rayna Rosser",
    "Zain Bothman",
    "Marley Sceifer",
    "Zaire Saris",
    "Carla Culhaneq",
  ][i],
  npm: [
    "2010631250000",
    "213450987634",
    "211760054321",
    "223409885418",
    "215438765102",
    "236754098765",
    "227651324809",
    "234135679803",
    "216754123678",
    "224567898704",
  ][i],
  prodi: [
    "Sistem Informasi",
    "Ilmu Komunikasi",
    "Teknik Industri",
    "Teknik Elektro",
    "Informatika",
    "Manajemen",
    "Ilmu Hukum",
    "Akuntansi",
    "Pend. Matematika",
    "Ilmu Gizi",
  ][i],
  date:
    ["07", "07", "08", "08", "08", "08", "09", "09", "09", "09"][i] +
    " Maret 2024",
}));

export default function ScholarshipList() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Peserta Pendaftar Beasiswa</h3>
        <div className="relative">
          <span className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Temukan"
            className="h-10 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="py-3 text-left font-medium">Nama</th>
              <th className="py-3 text-left font-medium">NPM</th>
              <th className="py-3 text-left font-medium">Prodi</th>
              <th className="py-3 text-left font-medium">Timestamp</th>
              <th className="py-3 text-left font-medium">Administrasi</th>
              <th className="py-3 text-left font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className="text-gray-700">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-gray-300" />
                    {r.name}
                  </div>
                </td>
                <td className="py-3">{r.npm}</td>
                <td className="py-3">{r.prodi}</td>
                <td className="py-3">{r.date}</td>
                <td className="py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                    Completed
                  </span>
                </td>
                <td className="py-3">
                  <Link
                    to={`/beasiswa/${r.id}`}
                    className="text-primary-600 underline"
                  >
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination mini */}
      <div className="mt-6 flex items-center justify-end gap-2 text-sm">
        <span className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1">
          1
        </span>
        <button className="rounded-md border border-gray-200 bg-white px-3 py-1">
          &lt;
        </button>
        <button className="rounded-md border border-gray-200 bg-white px-3 py-1">
          &gt;
        </button>
        <span className="text-gray-500">of 20</span>
      </div>
    </section>
  );
}
