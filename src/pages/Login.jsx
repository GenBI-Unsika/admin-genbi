import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !pw) {
      setErr('Email dan password wajib diisi.');
      return;
    }
    // TODO: ganti dengan auth backend kamu
    localStorage.setItem('authToken', 'dummy');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-md shadow-md-primary-500/30">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">Masuk</h1>
        <p className="text-neutral-600 mb-6">Silakan login untuk melanjutkan.</p>

        {err && <div className="mb-4 rounded-md border border-secondary-500/30 bg-secondary-50 px-3 py-2 text-secondary-700">{err}</div>}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label-text text-neutral-800" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" className="input w-full focus:border-primary-500 focus:outline-none" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div>
            <label className="label-text text-neutral-800" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" className="input w-full focus:border-primary-500 focus:outline-none" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
          </div>

          <button className="btn btn-primary w-full" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
