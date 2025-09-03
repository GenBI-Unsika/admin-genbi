import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";

export default function ArticleForm({ mode = "create" }) {
  const [form, setForm] = useState({
    title: "",
    publishDate: "",
    description: "",
    attachment: "",
    cover: null,
  });

  const update = (k) => (eOrV) =>
    setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  return (
    <div className="px-6 md:px-10 py-6">
      <Link to="/artikel" className="text-sm text-neutral-600 hover:underline">
        ← Kembali
      </Link>
      <h2 className="mt-2 text-xl md:text-2xl font-semibold">Artikel</h2>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
        <Input
          label="Judul"
          value={form.title}
          onChange={update("title")}
          placeholder="Tuliskan Nama kegiatan"
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cover Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Cover
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm cursor-pointer">
              <span className="opacity-70 truncate">
                {form.cover?.name || "Unggah file"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setForm((s) => ({ ...s, cover: e.target.files?.[0] || null }))
                }
                accept="image/*"
              />
            </label>
          </div>

          <Input
            label="Tanggal Publikasi"
            type="date"
            value={form.publishDate}
            onChange={update("publishDate")}
            placeholder="dd/mm/yyyy"
          />
        </div>

        <Textarea
          className="mt-4"
          label="Deskripsi"
          value={form.description}
          onChange={update("description")}
          placeholder="Tuliskan Deskripsi kegiatan"
        />

        <Select
          className="mt-4"
          label="Lampiran"
          value={form.attachment}
          onChange={update("attachment")}
          placeholder="Tambahkan Lampiran"
          options={[
            { value: "foto", label: "Foto" },
            { value: "dokumen", label: "Dokumen" },
            { value: "tautan", label: "Tautan" },
          ]}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/artikel" className="btn-outline-primary px-4 py-2">
            Batal
          </Link>
          <button className="btn-primary">Unggah Artikel</button>
        </div>
      </div>
    </div>
  );
}
