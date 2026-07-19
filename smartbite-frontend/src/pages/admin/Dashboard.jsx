import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';
import { money } from '../../utils/format';
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
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total orders', stats.orders ?? stats.totalOrders],
          ['Total revenue', money(stats.revenue ?? stats.totalRevenue)],
          [
            'Pending orders',
            stats.ordersByStatus?.pending ?? stats.pendingOrders,
          ],
          ['Customers', stats.users ?? stats.totalUsers],
        ].map(([name, value]) => (
          <div key={name} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">{name}</p>
            <p className="mt-2 text-3xl font-black text-emerald-800">
              {value ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
