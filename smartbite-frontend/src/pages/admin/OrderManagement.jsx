import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/adminService';
import { money } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  orderStatusClass,
  orderStatusIndex,
  orderStatusLabel,
  orderStatusStages,
} from '../../utils/orderStatus';
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
      <p className="mt-2 text-brand-muted">
        Track every customer order and move it through fulfilment.
      </p>
      <Message error={error} />
      <div className="mt-7 space-y-3">
        {orders.map((order) => (
          <div
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-surface p-5 shadow-sm"
            key={order._id}
          >
            <div>
              <b>
                #{order._id.slice(-6)} · {order.user?.name || 'Customer'}
              </b>
              <p className="mt-1 text-sm text-brand-muted">
                {order.user?.phone || ''} · {money(order.totalAmount)} ·{' '}
                {order.items?.length || 0} items
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) => setStatus(order._id, e.target.value)}
              className="rounded-xl border border-brand-border bg-brand-surface p-2 font-bold capitalize outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
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
            <div className="mt-4 w-full rounded-2xl bg-brand-secondary-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-brand-text">Order progress</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${orderStatusClass(order.status)}`}
                >
                  {orderStatusLabel(order.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
                {orderStatusStages.map((stage, index) => {
                  const activeIndex = orderStatusIndex(order.status);
                  const isComplete = index <= activeIndex;
                  const isCurrent = index === activeIndex;
                  return (
                    <div
                      key={stage}
                      className={`rounded-2xl border px-3 py-3 text-center text-xs font-bold capitalize transition ${
                        isComplete
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : 'border-brand-border bg-brand-surface text-brand-muted'
                      } ${isCurrent ? 'shadow-lg shadow-brand-primary/15' : ''}`}
                    >
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[11px] font-black">
                        {index + 1}
                      </div>
                      {stage.replaceAll('_', ' ')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {!orders.length && !error && (
          <p className="rounded-2xl bg-brand-surface p-8 text-brand-muted">
            No customer orders yet.
          </p>
        )}
      </div>
    </>
  );
}
