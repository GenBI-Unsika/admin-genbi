import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAdminGoogle, authAdminLogin } from '../utils/api';
import { waitForGoogleIdentity } from '../utils/googleIdentity.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const googleDivRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    if (!googleDivRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const id = await waitForGoogleIdentity();
        if (cancelled) return;

        id.initialize({
          client_id: clientId,
          callback: async (resp) => {
            try {
              await authAdminGoogle(resp.credential);
              navigate('/dashboard', { replace: true });
            } catch (e2) {
              toast.error(e2?.message || 'Login Google gagal.');
            }
          },
        });

        googleDivRef.current.innerHTML = '';
        id.renderButton(googleDivRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
        });
      } catch {
        // ignore; fallback message stays visible
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !pw) {
      toast.error('Email dan password wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await authAdminLogin(email, pw);
      navigate('/dashboard', { replace: true });
    } catch (e2) {
      toast.error(e2?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-md">
        {/* Brand */}
        <div className="mb-5 flex items-center gap-3">
          <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-10 w-10 p-1 rounded-md border border-neutral-200 object-cover bg-white" />
          <div>
            <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
            <p className="text-sm text-neutral-600">Silakan login untuk melanjutkan.</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-neutral-900 mb-3">Masuk</h1>

        <p className="text-sm text-neutral-600 mb-4">Khusus admin dengan email @unsika.ac.id / @student.unsika.ac.id.</p>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label className="label-text text-neutral-800 mb-1 block" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input w-full border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none"
              placeholder="admin@unsika.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-invalid={false}
            />
          </div>

          <div>
            <label className="label-text text-neutral-800 mb-1 block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                className="input w-full border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none pr-24"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
                required
                aria-invalid={false}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-primary-500 hover:text-primary-600 focus:outline-none"
                aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPw ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>

          <button className="btn w-full bg-primary-500 text-neutral-50 hover:bg-primary-600 disabled:opacity-60 focus:outline-none" type="submit" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <div className="text-xs text-neutral-500">Atau</div>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <div className="w-full flex justify-center">
            <div ref={googleDivRef} />
          </div>
        ) : (
          <div className="text-xs text-neutral-500 text-center">Google login belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID).</div>
        )}
      </div>
    </div>
  );
}
