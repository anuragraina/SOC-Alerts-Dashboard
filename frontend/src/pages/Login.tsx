import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login as loginRequest } from '../api/client';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Updates page title
  useEffect(() => {
    document.title = 'Sign in · SOC Alerts';
  }, []);

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await loginRequest(email, password);
      setAuth(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm flex flex-col items-center bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          SOC Alerts Dashboard
        </h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 py-2 px-3 cursor-pointer rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
