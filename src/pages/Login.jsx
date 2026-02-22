import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAdminGoogle, authAdminLogin } from '../utils/api';
import { waitForGoogleIdentity } from '../utils/googleIdentity.js';

const FORM_STORAGE_KEY = 'admin_login_form_draft';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
        // Biarin error, lagian pesannya jg tetep di layar kok
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Panggil draft yg prnh disimpen (biar datanya ga ilang kalo user apes)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const { email: savedEmail, rememberMe: savedRemember } = JSON.parse(saved);
        if (savedEmail) setEmail(savedEmail);
        if (savedRemember) setRememberMe(savedRemember);
      }
    } catch {
      // Biarin kalo misal kodingannya gagal nge-parse string
    }
  }, []);

  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ email, rememberMe }));
    }
  }, [email, rememberMe]);

  const clearFormDraft = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !pw) {
      const msg = 'Email dan password wajib diisi.';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await authAdminLogin(email, pw);

      if (!rememberMe) {
        clearFormDraft();
      }

      navigate('/dashboard', { replace: true });
    } catch (e2) {
      const msg = e2?.message || 'Login gagal. Periksa email dan password Anda.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10">
        <div className="flex justify-center mb-6">
          <img
            src="/favicon-genbi.webp"
            alt="GenBI Unsika"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">Masuk</h1>
        <p className="text-sm text-center text-neutral-500 mb-6">Silakan login untuk mengakses panel admin.</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@unsika.ac.id"
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={submitting}
              autoComplete="email"
            />
            <p className="mt-2 text-xs text-neutral-500">Khusus admin dengan email @unsika.ac.id / @student.unsika.ac.id.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-neutral-700" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                onClick={() => {
                  toast('Hubungi admin untuk mendapatkan bantuan reset password.', { icon: 'ℹ️' });
                }}
              >
                Lupa password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-4 pr-12 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={submitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
                aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" disabled={submitting} />
            <label htmlFor="rememberMe" className="text-sm text-neutral-600 select-none cursor-pointer">
              Ingat saya
            </label>
          </div>

          <button type="submit" disabled={submitting} className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-neutral-400">atau masuk dengan</span>
            </div>
          </div>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div className="flex justify-center">
              <div>
                <div ref={googleDivRef} />
                {import.meta.env.DEV ? null : null}
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 text-center">Google login belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID).</div>
          )}
        </form>
      </div>
    </div>
  );
}
