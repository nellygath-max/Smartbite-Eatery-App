import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/adminService';
import { getMenuItems, restockMenuItem } from '../../services/menuService';
import { money } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import { Message } from '../shared';
import { extract } from '../pageHelpers';

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

const getDashboardSnapshot = async () => {
  const [{ data: dashboardData }, { data: menuData }] = await Promise.all([
    getDashboard(),
    getMenuItems(),
  ]);
  return {
    dashboardData,
    lowStockItems: extract(menuData, 'menuItems').filter((item) => Number(item.stock) <= 5),
  };
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [restockingId, setRestockingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const { dashboardData, lowStockItems: nextLowStockItems } = await getDashboardSnapshot();
    setData(dashboardData);
    setLowStockItems(nextLowStockItems);
  };

  useEffect(() => {
    getDashboardSnapshot()
      .then(({ dashboardData, lowStockItems: nextLowStockItems }) => {
        setData(dashboardData);
        setLowStockItems(nextLowStockItems);
      })
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  const restock = async (event, meal) => {
    event.preventDefault();
    const quantity = Number(new FormData(event.currentTarget).get('quantity'));
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Enter a whole number of meals to add to stock.');
      return;
    }

    setError('');
    setSuccess('');
    setRestockingId(meal._id);
    try {
      await restockMenuItem(meal._id, quantity);
      setSuccess(`${meal.name} restocked by ${quantity}.`);
      await load();
    } catch (restockError) {
      setError(getApiErrorMessage(restockError, 'Unable to add stock for this meal.'));
    } finally {
      setRestockingId('');
    }
  };
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
      <section className="mt-8 rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Stock alerts</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Add stock before a meal sells out. This list shows meals with five or fewer portions left.
            </p>
          </div>
          <Link
            to="/admin/menu"
            className="rounded-xl border border-brand-border px-4 py-2 text-sm font-bold text-brand-text transition hover:bg-brand-secondary-soft"
          >
            Manage all menu stock
          </Link>
        </div>
        <Message error={error} success={success} />
        {lowStockItems.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-brand-secondary-soft text-brand-muted">
                <tr>
                  <th className="rounded-l-xl p-3">Meal</th>
                  <th className="p-3">Current stock</th>
                  <th className="rounded-r-xl p-3 text-right">Add stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((meal) => (
                  <tr className="border-b border-brand-border last:border-0" key={meal._id}>
                    <td className="p-3 font-bold text-brand-text">{meal.name}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${Number(meal.stock) === 0 ? 'bg-brand-status-danger/15 text-brand-status-danger' : 'bg-brand-status-warning/15 text-brand-status-warning'}`}>
                        {meal.stock} left
                      </span>
                    </td>
                    <td className="p-3">
                      <form onSubmit={(event) => restock(event, meal)} className="flex justify-end gap-2">
                        <input
                          required
                          name="quantity"
                          type="number"
                          min="1"
                          defaultValue="1"
                          aria-label={`Number of ${meal.name} portions to add`}
                          className="w-20 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-center outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
                        />
                        <button
                          disabled={restockingId === meal._id}
                          className="rounded-xl bg-brand-primary px-4 py-2 font-bold text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {restockingId === meal._id ? 'Adding...' : 'Add'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-brand-primary-soft px-4 py-4 text-sm font-bold text-brand-secondary-dark">
            All menu items have more than five portions in stock.
          </p>
        )}
      </section>
    </>
  );
}
