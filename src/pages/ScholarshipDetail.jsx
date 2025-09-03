import { Link, useParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

const DATA = {
  1: {
    name: 'Devi Fitriani Maulana',
    email: '2010631250000@student.unsika.ac.id',
    birth: '2001-01-01',
    gender: 'Perempuan',
    nik: '3710101010101010',
    fakultas: 'Fakultas Ilmu Komputer',
    npm: '2010631250000',
    prodi: 'Sistem Informasi',
    semester: '8',
    ipk: '3,91',
    usia: '22',
    know: 'Ya',
    about: 'GenBI (Generasi Baru Indonesia) adalah komunitas dari penerima beasiswa Bank Indonesia...',
  },
};

export default function ScholarshipDetail() {
  const { id } = useParams();
  const d = DATA[id] || DATA['1'];

  return (
    <div className="px-6 md:px-10 py-6">
      <Link to="/beasiswa" className="text-sm text-neutral-600 hover:underline">
        ← Kembali
      </Link>
      <h2 className="mt-2 text-xl md:text-2xl font-semibold">{d.name}</h2>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <h3 className="mb-4 text-lg font-semibold">Data Pribadi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nama Lengkap" value={d.name} readOnly />
          <Input label="Email" value={d.email} readOnly />

          <Input label="Tanggal Lahir" type="date" value={d.birth} readOnly />
          <Input label="Gender" value={d.gender} readOnly />

          <Input label="NIK" value={d.nik} readOnly />
          <Input label="No Telp" value="081234567890" readOnly />

          <Input label="Fakultas" value={d.fakultas} readOnly />
          <Input label="Program Studi" value={d.prodi} readOnly />

          <Input label="NPM" value={d.npm} readOnly />
          <Input label="Semester Saat Ini" value={d.semester} readOnly />

          <Input label="IPK" value={d.ipk} readOnly />
          <Input label="Usia" value={d.usia} readOnly />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Apakah kamu mengetahui komunitas GenBI Unsika?" value={d.know} readOnly />
          <div />
          <Textarea label="Jika kamu mengetahuinya, Jelaskan apa yang kamu ketahui mengenai GenBI Unsika?" value={d.about} readOnly className="md:col-span-2" />
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}
