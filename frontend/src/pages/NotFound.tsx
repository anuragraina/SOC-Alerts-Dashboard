import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function NotFound() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    document.title = 'Page not found · SOC Alerts';
  }, []);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
