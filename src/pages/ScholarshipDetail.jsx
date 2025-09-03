import { useParams, useNavigate } from "react-router-dom";

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:underline"
      >
        <span className="i-tabler-arrow-left" /> Kembali
      </button>

      <h2 className="mb-6 text-xl font-bold">Devi Fitriani Maulana</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          ["Nama Lengkap", "Devi Fitriani Maulana"],
          ["Email", "2010631250000@student.unsika.ac.id"],
          ["Tanggal Lahir", "01/01/01"],
          ["Gender", "Perempuan"],
          ["NIK", "3710101010101010"],
          ["No Telp", "081234567890"],
          ["Fakultas", "Fakultas Ilmu Komputer"],
          ["Program Studi", "Sistem Informasi"],
          ["NPM", "2010631250000"],
          ["Semester Saat Ini", "8"],
          ["IPK", "3,91"],
          ["Usia", "22"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="mb-2 text-sm font-semibold text-gray-700">{label}</p>
            <input
              readOnly
              value={value}
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="btn-primary">Simpan Perubahan</button>
      </div>
    </div>
  );
}
