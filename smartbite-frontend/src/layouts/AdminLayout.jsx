import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navClass = ({ isActive }) =>
  `admin-sidebar-link rounded-xl px-4 py-3 text-sm font-bold transition ${
    isActive
      ? 'bg-brand-primary text-[#F4EDE6] shadow-lg shadow-brand-primary/20'
      : 'text-[#E6DDD3] hover:bg-white/10 hover:text-[#F4EDE6]'
  }`;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isDeliveryStaff = user?.role === 'delivery_staff';
  const navigation = isDeliveryStaff
    ? [{ label: 'Orders', to: '/delivery/orders' }]
    : [
        { label: 'Dashboard', to: '/admin' },
        { label: 'Categories', to: '/admin/categories' },
        { label: 'Menu', to: '/admin/menu' },
        { label: 'Orders', to: '/admin/orders' },
        { label: 'Users', to: '/admin/users' },
        { label: 'Reviews', to: '/admin/reviews' },
      ];

  const leaveAdmin = async () => {
    await logout();
    navigate('/');
  };

  const onNavItemClick = () => {
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text lg:flex">
      <aside className="admin-sidebar flex w-full flex-col bg-[#2E2A26] px-5 py-6 text-[#F4EDE6] lg:sticky lg:top-0 lg:min-h-screen lg:w-64 lg:flex-none">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="admin-sidebar-brand flex items-center gap-3 text-xl font-black text-[#F4EDE6]">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-primary text-lg shadow-lg shadow-brand-primary/20">
              S
            </span>
            SmartBite
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#E6DDD3] hover:bg-white/10 lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
          >
            {mobileNavOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <p className="mt-2 pl-13 text-xs font-bold uppercase tracking-[0.18em] text-[#D9A98A]">
          {isDeliveryStaff ? 'Delivery Staff' : 'Admin'}
        </p>

        <div id="admin-mobile-nav" className={`${mobileNavOpen ? 'mt-5' : 'hidden'} lg:mt-0 lg:block`}>
          <nav className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:mt-7 lg:flex-col lg:overflow-visible">
            {navigation.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={navClass}
                onClick={onNavItemClick}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/15 pt-5 lg:mt-auto">
            <NavLink
              to={isDeliveryStaff ? '/profile' : '/admin/profile'}
              className={navClass}
              onClick={onNavItemClick}
            >
              {isDeliveryStaff ? 'Profile' : 'Admin Profile'}
            </NavLink>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl p-5 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm">
            <p className="text-sm font-bold text-brand-muted">Admin quick actions</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/" className="rounded-xl border border-brand-border px-4 py-2 text-sm font-bold text-brand-text transition hover:bg-brand-secondary-soft">Home</Link>
              {!isDeliveryStaff && (
                <Link to="/menu" className="rounded-xl border border-brand-border px-4 py-2 text-sm font-bold text-brand-text transition hover:bg-brand-secondary-soft">Customer Menu</Link>
              )}
              <Link to={isDeliveryStaff ? '/delivery/orders' : '/admin/orders'} className="rounded-xl border border-brand-border px-4 py-2 text-sm font-bold text-brand-text transition hover:bg-brand-secondary-soft">Orders</Link>
              <Link to={isDeliveryStaff ? '/profile' : '/admin/profile'} className="rounded-xl border border-brand-border px-4 py-2 text-sm font-bold text-brand-text transition hover:bg-brand-secondary-soft">{isDeliveryStaff ? 'Profile' : 'Admin Profile'}</Link>
              <button
                type="button"
                onClick={leaveAdmin}
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
              >
                Logout
              </button>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
