import { useEffect, useState } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../../services/adminService';
import { money } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  orderStatusClass,
  orderStatusIndex,
  orderStatusLabel,
  orderStatusStages,
} from '../../utils/orderStatus';
import { toneSolid, toneSoft } from '../../utils/statusStyles';
import { Message } from '../shared';
import { extract } from '../pageHelpers';

const paymentMethodLabel = (method) => {
  if (method === 'payment_on_delivery' || method === 'cash_on_delivery') {
    return 'Payment on delivery';
  }
  return method?.replaceAll('_', ' ') || 'Payment on delivery';
};

const paymentStatusLabel = (status) => (status === 'paid' ? 'Paid' : 'Unpaid');

const orderBadgeClass = (status) => {
  if (status === 'delivered') return toneSolid('success');
  if (status === 'cancelled') return toneSolid('danger');
  if (status === 'out_for_delivery') return toneSolid('info');
  if (status === 'ready') return toneSolid('warning');
  return toneSolid('neutral');
};

const orderSubtotal = (order) => (order.items || []).reduce(
  (sum, item) => sum + (item.price * item.quantity),
  0
);

const hasSubtotalMismatch = (order) => (
  Math.round((orderSubtotal(order) - (order.totalAmount || 0)) * 100) !== 0
);

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const statusOptions = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

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

  const setPayment = async (id, paymentStatus) => {
    try {
      await updatePaymentStatus(id, paymentStatus);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update payment status.'));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-black">Manage orders</h1>
      <p className="mt-2 text-brand-muted">
        Track every customer order, update fulfilment, and confirm payment status.
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
                    className={`grid h-10 w-10 place-items-center rounded-2xl text-xs font-black text-white ${orderBadgeClass(order.status)}`}
                    aria-hidden="true"
                  >
                    #{order._id.slice(-2)}
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
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <select
                  value={order.status}
                  onChange={(e) => setStatus(order._id, e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-brand-border bg-brand-surface p-2 font-bold capitalize outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 sm:w-auto"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
                <select
                  value={order.paymentStatus || 'unpaid'}
                  onChange={(e) => setPayment(order._id, e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-brand-border bg-brand-surface p-2 font-bold capitalize outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 sm:w-auto"
                >
                  {['unpaid', 'paid'].map((paymentStatus) => (
                    <option key={paymentStatus} value={paymentStatus}>
                      {paymentStatus}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_20rem]">
              <div className="rounded-2xl bg-brand-secondary-soft p-4">
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
              <aside className="min-w-0 rounded-2xl bg-brand-secondary-soft p-4 text-sm text-brand-text">
                <p className="font-bold">Items</p>
                <ul className="mt-2 space-y-1">
                  {order.items?.map((item) => (
                    <li
                      key={`${order._id}-${item.menuItem?._id || item.name}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0 truncate">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="shrink-0 font-semibold text-brand-secondary-dark">
                        {money(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-brand-border pt-3">
                  <div className="flex items-center justify-between text-xs text-brand-muted">
                    <span>Calculated subtotal</span>
                    <span className="font-semibold text-brand-secondary-dark">
                      {money(orderSubtotal(order))}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-brand-muted">
                    <span>Recorded total</span>
                    <span className="font-semibold text-brand-secondary-dark">
                      {money(order.totalAmount)}
                    </span>
                  </div>
                  {hasSubtotalMismatch(order) ? (
                    <p className={`alert alert-warning mt-2 text-xs font-semibold ${toneSoft('warning')}`}>
                      Subtotal differs from recorded total.
                    </p>
                  ) : (
                    <p className={`alert alert-success mt-2 text-xs font-semibold ${toneSoft('success')}`}>
                      Totals match.
                    </p>
                  )}
                </div>
                <p className="mt-3 border-t border-brand-border pt-3 text-xs text-brand-muted">
                  Line totals are based on unit price x quantity.
                </p>
              </aside>
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
