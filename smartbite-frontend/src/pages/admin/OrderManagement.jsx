import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/adminService';
import { money } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import { Message } from '../shared';
import { extract } from '../pageHelpers';
export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const load = () =>
    getAllOrders().then(({ data }) => setOrders(extract(data, 'orders')));
  useEffect(() => {
    load().catch(() => setError('Could not load customer orders.'));
  }, []);
  const setStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update order status.'));
    }
  };
  return (
    <>
      <h1 className="text-3xl font-black">Manage orders</h1>
      <p className="mt-2 text-stone-500">
        Track every customer order and move it through fulfilment.
      </p>
      <Message error={error} />
      <div className="mt-7 space-y-3">
        {orders.map((order) => (
          <div
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm"
            key={order._id}
          >
            <div>
              <b>
                #{order._id.slice(-6)} · {order.user?.name || 'Customer'}
              </b>
              <p className="mt-1 text-sm text-stone-500">
                {order.user?.phone || ''} · {money(order.totalAmount)} ·{' '}
                {order.items?.length || 0} items
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) => setStatus(order._id, e.target.value)}
              className="rounded-xl border border-stone-200 p-2 font-bold capitalize"
            >
              {[
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'out_for_delivery',
                'delivered',
                'cancelled',
              ].map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        ))}
        {!orders.length && !error && (
          <p className="rounded-2xl bg-white p-8 text-stone-500">
            No customer orders yet.
          </p>
        )}
      </div>
    </>
  );
}
