import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 bg-slate-50 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
