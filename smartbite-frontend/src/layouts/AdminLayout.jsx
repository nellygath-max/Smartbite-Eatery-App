import { Link, Outlet } from 'react-router-dom';
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-950 px-5 py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="font-black">
            SmartBite <span className="text-orange-400">Admin</span>
          </Link>
          <nav className="flex gap-4 text-sm font-semibold text-stone-300">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/menu">Menu</Link>
            <Link to="/admin/orders">Orders</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
