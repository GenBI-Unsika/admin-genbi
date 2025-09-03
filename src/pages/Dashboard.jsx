import StatCard from '../components/StatCard';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { GraduationCap, Users, CalendarDays, FileText, Download } from 'lucide-react';

const formatID = (n) => new Intl.NumberFormat('id-ID').format(n);

const chartData = [
  { day: '21', views: 300, insights: 560 },
  { day: '22', views: 410, insights: 450 },
  { day: '23', views: 90, insights: 120 },
  { day: '24', views: 330, insights: 820 },
  { day: '25', views: 420, insights: 450 },
  { day: '26', views: 450, insights: 830 },
  { day: '27', views: 230, insights: 650 },
  { day: '28', views: 400, insights: 980 },
  { day: '29', views: 260, insights: 600 },
  { day: '30', views: 620, insights: 660 },
];

export default function Dashboard() {
  return (
    <div className="px-6 md:px-10 py-6">
      {/* 4 kartu statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard title="Jumlah Pendaftar Beasiswa" value={formatID(671)} unit="peserta" icon={<GraduationCap size={22} className="text-primary-500" />} to="/beasiswa" />
        <StatCard title="Jumlah Pengunjung Proker" value={formatID(1243)} unit="pengunjung" icon={<Users size={22} className="text-primary-500" />} to="/aktivitas" />
        <StatCard title="Jumlah Pengunjung Event" value={formatID(1159)} unit="pengunjung" icon={<CalendarDays size={22} className="text-primary-500" />} to="/aktivitas" />
        <StatCard title="Jumlah Pengunjung Artikel" value={formatID(987)} unit="peserta" icon={<FileText size={22} className="text-primary-500" />} to="/artikel" />
      </div>

      {/* Grafik Pengunjung Website */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-neutral-900">Grafik Pengunjung Website</h3>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500" aria-label="Unduh data" title="Unduh data">
            <Download size={18} />
          </button>
        </div>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid stroke="var(--neutral-200)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--neutral-600)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--neutral-200)' }} />
              <YAxis tick={{ fill: 'var(--neutral-600)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--neutral-200)' }} width={30} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--neutral-200)',
                  boxShadow: 'none',
                }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="views" name="Views" fill="var(--secondary-400)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="insights" name="Insights" fill="var(--primary-400)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-neutral-700">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'var(--secondary-400)' }} />
            Views
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'var(--primary-400)' }} />
            Insights
          </div>
        </div>
      </div>
    </div>
  );
}
