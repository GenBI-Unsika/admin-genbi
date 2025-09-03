import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Input from "../components/ui/Input";

const MOCK = [
  [
    "1",
    "Devi Fitriani Maulana",
    "2010631250000",
    "Sistem Informasi",
    "07 Maret 2024",
  ],
  ["2", "Adeeva Caria", "213450987634", "Ilmu Komunikasi", "07 Maret 2024"],
  ["3", "Ahad Fayroz", "211760054321", "Teknik Industri", "08 Maret 2024"],
  ["4", "Craig Kenter", "223409885418", "Teknik Elektro", "08 Maret 2024"],
  ["5", "Gustavo Dorc", "215438765102", "Informatika", "08 Maret 2024"],
  ["6", "Rayna Rosser", "236754098765", "Manajemen", "08 Maret 2024"],
  ["7", "Zain Bothman", "227651324809", "Ilmu Hukum", "09 Maret 2024"],
  ["8", "Marley Sceifer", "234135679803", "Akuntansi", "09 Maret 2024"],
  ["9", "Zaire Saris", "216754123678", "Pend. Matematika", "09 Maret 2024"],
  ["10", "Carla Culhaneq", "224567898704", "Ilmu Gizi", "09 Maret 2024"],
];

export default function ScholarshipList() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!q.trim()) return MOCK;
    const t = q.toLowerCase();
    return MOCK.filter(
      ([, name, npm, prodi]) =>
        name.toLowerCase().includes(t) ||
        npm.toLowerCase().includes(t) ||
        prodi.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <div className="px-6 md:px-10 py-6">
      <h2 className="text-xl md:text-2xl font-semibold">
        Peserta Pendaftar Beasiswa
      </h2>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-medium">Peserta Pendaftar Beasiswa</h3>
          <div className="w-64">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Temukan…"
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                🔎
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-600">
                <th className="py-3 font-medium">Nama</th>
                <th className="py-3 font-medium">NPM</th>
                <th className="py-3 font-medium">Prodi</th>
                <th className="py-3 font-medium">Timestamp</th>
                <th className="py-3 font-medium">Administrasi</th>
                <th className="py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([id, name, npm, prodi, ts], i) => (
                <tr key={id} className={i % 2 ? "bg-neutral-50" : "bg-white"}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                      {name}
                    </div>
                  </td>
                  <td className="py-3 pr-4">{npm}</td>
                  <td className="py-3 pr-4">{prodi}</td>
                  <td className="py-3 pr-4">{ts}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/beasiswa/${id}`}
                      className="text-sm font-medium text-[var(--primary-500)] hover:underline"
                    >
                      Lihat Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm">
            1
          </span>
          <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm">
            &lt;
          </button>
          <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm">
            &gt;
          </button>
          <span className="text-sm text-neutral-600">of 20</span>
        </div>
      </div>
    </div>
  );
}
