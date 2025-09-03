import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";

export default function ActivityForm({ mode = "create" }) {
  const [form, setForm] = useState({
    category: "",
    title: "",
    theme: "",
    date: "",
    description: "",
    attachments: "",
  });

  const update = (k) => (eOrV) =>
    setForm((s) => ({ ...s, [k]: eOrV?.target ? eOrV.target.value : eOrV }));

  return (
    <div className="px-6 md:px-10 py-6">
      <Link
        to="/aktivitas"
        className="text-sm text-neutral-600 hover:underline"
      >
        ← Kembali
      </Link>
      <h2 className="mt-2 text-xl md:text-2xl font-semibold">
        Event dan Proker
      </h2>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Kategori"
            value={form.category}
            onChange={update("category")}
            placeholder="Pilih kategori Aktivitas"
            options={[
              { value: "event", label: "Event" },
              { value: "proker", label: "Proker" },
            ]}
          />

          <div />
          <Input
            label="Judul"
            value={form.title}
            onChange={update("title")}
            placeholder="Tuliskan Nama kegiatan"
            className="md:col-span-2"
          />

          <Input
            label="Tema"
            value={form.theme}
            onChange={update("theme")}
            placeholder="Tuliskan Tema kegiatan"
          />
          <Input
            label="Tanggal Publikasi"
            type="date"
            value={form.date}
            onChange={update("date")}
            placeholder="dd/mm/yyyy"
          />

          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={update("description")}
            placeholder="Tuliskan Deskripsi kegiatan"
            className="md:col-span-2"
          />

          <Select
            label="Lampiran"
            value={form.attachments}
            onChange={update("attachments")}
            placeholder="Tambahkan Lampiran"
            options={[
              { value: "foto", label: "Foto" },
              { value: "dokumen", label: "Dokumen" },
              { value: "tautan", label: "Tautan" },
            ]}
            className="md:col-span-2"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/aktivitas" className="btn-outline-primary px-4 py-2">
            Batal
          </Link>
          <button className="btn-primary">Unggah Aktivitas</button>
        </div>
      </div>
    </div>
  );
}
