import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function StatCard({ title, value, unit, icon, to }) {
  const inner = (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-neutral-200 bg-primary-50 text-primary-500">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-neutral-800">{title}</div>
          <div className="mt-1 text-neutral-500">
            <span className="text-xl font-semibold text-neutral-900">{value}</span> {unit}
          </div>
        </div>
      </div>

      <div className="shrink-0 grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500">
        <ChevronRight size={18} />
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block transition-transform hover:-translate-y-0.5">
      {inner}
    </Link>
  ) : (
    inner
  );
}
