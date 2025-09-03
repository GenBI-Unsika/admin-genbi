import { useState } from "react";

export default function CMSSettings() {
  const [nav, setNav] = useState({
    history: true,
    teams: true,
    events: true,
    proker: true,
    scholarship: true,
    articles: true,
  });

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">CMS Landing (Placeholder)</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Navigasi</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.keys(nav).map((k) => (
            <label
              key={k}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <span className="capitalize">{k}</span>
              <input
                type="checkbox"
                checked={nav[k]}
                onChange={(e) =>
                  setNav((s) => ({ ...s, [k]: e.target.checked }))
                }
              />
            </label>
          ))}
        </div>

        <div className="mt-6">
          <button className="btn-primary">Simpan (stub)</button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-2 font-semibold">Hero Section</h3>
        <p className="mb-4 text-sm text-gray-600">
          Tempat untuk mengedit konten hero, CTA, gambar, dll. (akan kita
          sambungkan ke API nanti)
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3"
            placeholder="Judul"
          />
          <input
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3"
            placeholder="Subjudul"
          />
        </div>
        <div className="mt-4">
          <button className="btn-primary">Simpan Draft (stub)</button>
        </div>
      </div>
    </section>
  );
}
