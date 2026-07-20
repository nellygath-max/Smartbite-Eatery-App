import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';
import { money } from '../../utils/format';

const StatIcon = ({ children, toneClass }) => (
  <span
    className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass} text-sm font-black text-white shadow-sm`}
    aria-hidden="true"
  >
    {children}
  </span>
);

const OrdersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6h16" />
    <path d="M6 6v14h12V6" />
    <path d="M9 10h6" />
    <path d="M9 14h6" />
  </svg>
);

const RevenueIcon = () => <span className="text-base leading-none">₦</span>;

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.3 4.5 2.4 18a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-7.9-13.5a2 2 0 0 0-3.6 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const CustomersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const statCards = (stats) => [
  {
    name: 'Total orders',
    value: stats.orders ?? stats.totalOrders,
    icon: (
      <StatIcon toneClass="bg-brand-primary">
        <OrdersIcon />
      </StatIcon>
    ),
  },
  {
    name: 'Total revenue',
    value: money(stats.revenue ?? stats.totalRevenue),
    icon: (
      <StatIcon toneClass="bg-brand-secondary">
        <RevenueIcon />
      </StatIcon>
    ),
  },
  {
    name: 'Pending orders',
    value: stats.ordersByStatus?.pending ?? stats.pendingOrders,
    icon: (
      <StatIcon toneClass="bg-brand-status-warning">
        <WarningIcon />
      </StatIcon>
    ),
  },
  {
    name: 'Customers',
    value: stats.users ?? stats.totalUsers,
    icon: (
      <StatIcon toneClass="bg-brand-link">
        <CustomersIcon />
      </StatIcon>
    ),
  },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => {});
  }, []);
  const stats = data?.dashboard || data?.stats || data?.data || {};
  return (
    <>
      <h1 className="text-3xl font-black">Dashboard overview</h1>
      <p className="mt-2 text-brand-muted">
        Monitor your operation at a glance with consistent status cards and quick actions.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards(stats).map(({ name, value, icon }) => (
          <div
            key={name}
            className="rounded-3xl border border-brand-border bg-brand-surface-elevated p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">{name}</p>
                <p className="mt-3 text-3xl font-black text-brand-secondary-dark">
                  {value ?? '—'}
                </p>
              </div>
              {icon}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
