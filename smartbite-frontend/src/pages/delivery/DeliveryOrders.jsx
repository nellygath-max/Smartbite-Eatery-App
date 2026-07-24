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
import { toneSolid } from '../../utils/statusStyles';
import { Message } from '../shared';
import { extract } from '../pageHelpers';

const paymentMethodLabel = (method) => {
  if (method === 'paystack') return 'Paystack';
  if (method === 'payment_on_delivery' || method === 'cash_on_delivery') {
    return 'Payment on delivery';
  }
  return method?.replaceAll('_', ' ') || 'Payment on delivery';
};

const paymentStatusLabel = (status) => (status === 'paid' ? 'Paid' : 'Unpaid');

// Admins and delivery staff can keep the full order progress up to date.
const deliveryStatusOptions = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const deliveryBadgeClass = (status) => {
  if (status === 'delivered') return toneSolid('success');
  if (status === 'cancelled') return toneSolid('danger');
  if (status === 'out_for_delivery') return toneSolid('info');
  if (status === 'ready') return toneSolid('warning');
  return toneSolid('neutral');
};

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    getAllOrders().then(({ data }) => {
      const normalizedOrders = extract(data, 'orders').map((order) => ({
        ...order,
        // Older API responses may not yet include orderStatus. `status` is
        // the field used by the existing client and is kept in sync by the API.
        status: order.status || order.orderStatus || 'pending',
      }));
      setOrders(normalizedOrders);
    });

  useEffect(() => {
    load().catch(() => setError('Could not load delivery orders.'));
  }, []);

  const setStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update delivery status.'));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-black">Delivery orders</h1>
      <p className="mt-2 text-brand-muted">
        Track active deliveries and update customers as each order moves to the door.
      </p>
      <Message error={error} />
      <div className="mt-7 space-y-4">
        {orders.map((order) => (
          <div
            className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm transition hover:shadow-md"
            key={order._id}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-2xl text-xs font-black text-white ${deliveryBadgeClass(order.status)}`}
                    aria-hidden="true"
                  >
                    D
                  </span>
                  <b>
                    #{order._id.slice(-6)} · {order.user?.name || 'Customer'}
                  </b>
                </div>
                <p className="mt-1 text-sm text-brand-muted">
                  {order.user?.phone || ''} · {money(order.totalAmount)} ·{' '}
                  {order.items?.length || 0} items
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  {paymentMethodLabel(order.paymentMethod)} · {paymentStatusLabel(order.paymentStatus)}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  Delivery address: {order.deliveryAddress || 'No address provided'}
                </p>
              </div>
              <select
                value={order.status}
                disabled={order.status === 'cancelled'}
                onChange={(e) => setStatus(order._id, e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-brand-border bg-brand-surface p-2 font-bold capitalize outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {deliveryStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 rounded-2xl bg-brand-secondary-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-brand-text">Delivery progress</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${orderStatusClass(order.status)}`}
                >
                  {orderStatusLabel(order.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
                {orderStatusStages.map((stage, index) => {
                  const activeIndex = orderStatusIndex(order.status);
                  const isCancelled = order.status === 'cancelled';
                  const isComplete = !isCancelled && index <= activeIndex;
                  const isCurrent = index === activeIndex;
                  return (
                    <div
                      key={stage}
                      className={`rounded-2xl border px-3 py-3 text-center text-xs font-bold capitalize transition ${
                        isCancelled && stage === 'cancelled'
                          ? 'border-brand-status-danger bg-brand-status-danger-soft text-brand-status-danger'
                          : isComplete
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
            No delivery orders yet.
          </p>
        )}
      </div>
    </>
  );
}
