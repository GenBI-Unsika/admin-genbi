import { FileQuestion, Inbox, Search, AlertCircle, UserX, FileX, Calendar, ClipboardList } from 'lucide-react';

const icons = {
  inbox: Inbox,
  search: Search,
  error: AlertCircle,
  users: UserX,
  files: FileX,
  calendar: Calendar,
  clipboard: ClipboardList,
  default: FileQuestion,
};

/**
 * EmptyState - Komponen reusable untuk menampilkan state kosong dengan desain menarik
 *
 * @param {Object} props
 * @param {string} props.icon - Nama icon: 'inbox' | 'search' | 'error' | 'users' | 'files' | 'calendar' | 'clipboard'
 * @param {string} props.title - Judul utama
 * @param {string} props.description - Deskripsi detail
 * @param {React.ReactNode} props.action - Optional button atau action element
 * @param {string} props.variant - 'default' | 'primary' | 'secondary' | 'warning'
 */
export default function EmptyState({ icon = 'default', title, description, action, variant = 'default' }) {
  const Icon = icons[icon] || icons.default;

  const variantStyles = {
    default: {
      bg: 'bg-neutral-50',
      iconBg: 'bg-neutral-100',
      iconColor: 'text-neutral-400',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
    primary: {
      bg: 'bg-primary-50/50',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
    secondary: {
      bg: 'bg-blue-50/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
    warning: {
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-neutral-900',
      descColor: 'text-neutral-600',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-neutral-200 ${style.bg} px-6 py-16 text-center`}>
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${style.iconBg}`}>
        <Icon className={`h-8 w-8 ${style.iconColor}`} strokeWidth={1.5} />
      </div>

      {title && <h3 className={`mb-2 text-lg font-semibold ${style.titleColor}`}>{title}</h3>}

      {description && <p className={`mb-6 max-w-md text-sm ${style.descColor}`}>{description}</p>}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
