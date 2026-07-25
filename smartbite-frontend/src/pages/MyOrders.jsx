import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyOrder, getMyOrders } from '../services/orderService';
import { createReview, getPendingReviewNotifications } from '../services/reviewService';
import { dateTime, money, shortDate } from '../utils/format';
import {
  orderStatusIndex,
  orderStatusClass,
  orderStatusHint,
  orderStatusLabel,
  orderStatusStages,
} from '../utils/orderStatus';
import { extract } from './pageHelpers';
import { getApiErrorMessage } from '../utils/apiError';
import { Message } from './shared';

const paymentMethodLabel = (method) => {
  if (method === 'paystack') return 'Paystack';
  if (method === 'payment_on_delivery' || method === 'cash_on_delivery') {
    return 'Payment on delivery';
  }
  return method?.replaceAll('_', ' ') || 'Payment on delivery';
};

const paymentStatusLabel = (status) => (status === 'paid' ? 'Paid' : 'Unpaid');

const orderTimestamp = (order) => new Date(order.createdAt || order.updatedAt || 0).getTime();

const normalizeOrder = (order) => ({
  ...order,
  // Accept both the current API field and legacy order responses.
  status: String(order.status || order.orderStatus || 'pending').toLowerCase(),
});

const mergeOrders = (currentOrders, incomingOrders) => {
  const byId = new Map();
  [...currentOrders, ...incomingOrders].forEach((order) => {
    if (order?._id) byId.set(order._id, normalizeOrder(order));
  });
  return [...byId.values()].sort((a, b) => orderTimestamp(b) - orderTimestamp(a));
};

function ReviewForm({ orderId, item, onSubmitted }) {
  const [rating, setRating] = useState('5');
  const [review, setReview] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const menuItemId = item.menuItem?._id || item.menuItem;

  const submit = async (event) => {
    event.preventDefault();
    if (!menuItemId) return;
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await createReview({
        orderId,
        menuItem: menuItemId,
        rating: Number(rating),
        review,
      });
      setReview('');
      setRating('5');
      setMessage('Thanks for sharing your review.');
      onSubmitted?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit this review right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!menuItemId) return null;

  return (
    <form onSubmit={submit} className="rounded-2xl border border-brand-border bg-brand-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-black text-brand-text">{item.name}</p>
        <label className="text-sm font-bold text-brand-text">
          Rating
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="ml-2 rounded-lg border border-brand-border bg-white px-3 py-2 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value}/5
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        required
        minLength={3}
        maxLength={500}
        value={review}
        onChange={(event) => setReview(event.target.value)}
        rows="3"
        placeholder="How did it taste?"
        className="mt-3 w-full rounded-xl border border-brand-border p-3 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-xl bg-brand-primary px-4 py-2 text-sm font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
      {message && <p className="mt-2 text-sm font-bold text-brand-status-success">{message}</p>}
      {error && <p className="mt-2 text-sm font-bold text-brand-status-danger">{error}</p>}
    </form>
  );
}

export default function MyOrders() {
  const { state } = useLocation();
  const newOrder = state?.newOrder;
  const newOrderId = state?.newOrderId;
  const [orders, setOrders] = useState(() => (newOrder ? [normalizeOrder(newOrder)] : []));
  const [pendingReviewIds, setPendingReviewIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadPendingReviews = () =>
    getPendingReviewNotifications()
      .then(({ data }) => setPendingReviewIds(
        new Set((data?.notifications || []).map((item) => `${item.orderId}:${item.menuItemId}`))
      ))
      .catch(() => setPendingReviewIds(new Set()));
  const loadOrders = () =>
    getMyOrders()
      .then(({ data }) => {
        setOrders((currentOrders) => mergeOrders(currentOrders, extract(data, 'orders')));
        setError('');
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load your orders. Please refresh and try again.')))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (newOrderId && !newOrder) {
      getMyOrder(newOrderId)
        .then(({ data }) => {
          if (data?.order) {
            setOrders((currentOrders) => mergeOrders(currentOrders, [data.order]));
          }
        })
        .catch(() => {});
    }

    loadOrders();
    loadPendingReviews();

    const intervalId = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [newOrder, newOrderId]);

  const refreshAfterReview = () => {
    loadOrders();
    loadPendingReviews();
  };

  const currentOrder = useMemo(() => {
    if (newOrderId) {
      return orders.find((order) => order._id === newOrderId) || orders[0] || null;
    }
    return orders[0] || null;
  }, [newOrderId, orders]);

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-4xl font-black">My orders</h1>
      <p className="mt-3 text-brand-muted">
        Review your past orders and track the latest status updates here.
      </p>
      <Message error={error} />
      {loading && (
        <p className="mt-8 rounded-2xl bg-brand-secondary-soft p-8 text-brand-muted">
          Loading your orders...
        </p>
      )}

      {!loading && currentOrder && (
        <div className="mt-8 rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">
                Current order status
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Order #{currentOrder._id?.slice(-6)}
              </h2>
              <p className="mt-2 text-brand-muted">
                {orderStatusHint(currentOrder.status)}
              </p>
            </div>
            <span
              className={`h-fit rounded-full px-3 py-1 text-sm font-bold capitalize ${orderStatusClass(currentOrder.status)}`}
            >
              {orderStatusLabel(currentOrder.status)}
            </span>
          </div>
          <p className="mt-4 text-sm font-bold text-brand-primary">
            This section refreshes automatically every 15 seconds.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-brand-secondary-soft p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Total
              </p>
              <p className="mt-1 text-lg font-black text-brand-secondary-dark">
                {money(currentOrder.totalAmount)}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-secondary-soft p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Ordered
              </p>
              <p className="mt-1 text-lg font-black text-brand-secondary-dark">
                {dateTime(currentOrder.createdAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-secondary-soft p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Items
              </p>
              <p className="mt-1 text-lg font-black text-brand-secondary-dark">
                {currentOrder.items?.length || 0}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-brand-secondary-soft p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-brand-text">Order progress</p>
              <p className="text-sm font-bold text-brand-muted">
                Step {orderStatusIndex(currentOrder.status) + 1} of {orderStatusStages.length}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {orderStatusStages.map((stage, index) => {
                const activeIndex = orderStatusIndex(currentOrder.status);
                const isComplete = index <= activeIndex;
                const isCurrent = index === activeIndex;
                return (
                  <div
                    key={stage}
                    className={`min-w-0 flex-1 rounded-2xl border px-3 py-3 text-center text-xs font-bold capitalize transition ${
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
          {currentOrder.status === 'delivered' && (
            <div className="mt-6 border-t border-brand-border pt-5">
              <p className="font-black text-brand-text">How was your meal?</p>
              <p className="mt-1 text-sm text-brand-muted">
                Your order has been delivered. Share your experience with other customers.
              </p>
              <div className="mt-3 grid gap-3">
                {currentOrder.items?.map((item) => {
                  const menuItemId = item.menuItem?._id || item.menuItem;
                  if (!menuItemId) return null;
                  if (!pendingReviewIds.has(`${currentOrder._id}:${menuItemId}`)) {
                    return (
                      <p
                        key={`${currentOrder._id}-current-reviewed-${menuItemId}`}
                        className="rounded-xl bg-brand-status-success-soft px-4 py-3 text-sm font-bold text-brand-status-success"
                      >
                        {item.name} reviewed
                      </p>
                    );
                  }

                  return (
                    <ReviewForm
                      key={`${currentOrder._id}-current-review-${menuItemId}`}
                      orderId={currentOrder._id}
                      item={item}
                      onSubmitted={refreshAfterReview}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article
            key={order._id}
            className="rounded-2xl bg-brand-surface p-6 shadow-sm"
          >
            <div className="flex justify-between gap-4">
              <div>
                <b>Order #{order._id?.slice(-6)}</b>
                <p className="mt-1 text-sm text-brand-muted">
                  {shortDate(order.createdAt)} · {order.items?.length} items
                </p>
              </div>
              <span
                className={`h-fit rounded-full px-3 py-1 text-sm font-bold capitalize ${orderStatusClass(order.status)}`}
              >
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <p className="font-black text-brand-secondary-dark">
                  {money(order.totalAmount)}
                </p>
                <p className="mt-2 text-sm text-brand-muted">
                  {orderStatusHint(order.status)}
                </p>
                <p className="mt-2 text-sm text-brand-muted">
                  Delivery address: {order.deliveryAddress}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  Payment method: {paymentMethodLabel(order.paymentMethod)}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  Payment status: {paymentStatusLabel(order.paymentStatus)}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-secondary-soft p-4 text-sm text-brand-text">
                <p className="font-bold">Items</p>
                <ul className="mt-2 space-y-1">
                  {order.items?.map((item) => (
                    <li key={`${order._id}-${item.menuItem?._id || item.name}`}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {order.status === 'delivered' && (
              <div className="mt-5 border-t border-brand-border pt-5">
                <p className="font-black text-brand-text">How was your meal?</p>
                <p className="mt-1 text-sm text-brand-muted">
                  Share a review for any meal you received in this order.
                </p>
                <div className="mt-3 grid gap-3">
                  {order.items?.map((item) => {
                    const menuItemId = item.menuItem?._id || item.menuItem;
                    if (!menuItemId) return null;
                    if (!pendingReviewIds.has(`${order._id}:${menuItemId}`)) {
                      return (
                        <p
                          key={`${order._id}-reviewed-${menuItemId}`}
                          className="rounded-xl bg-brand-status-success-soft px-4 py-3 text-sm font-bold text-brand-status-success"
                        >
                          {item.name} reviewed
                        </p>
                      );
                    }

                    return (
                      <ReviewForm
                        key={`${order._id}-review-${menuItemId}`}
                        orderId={order._id}
                        item={item}
                        onSubmitted={refreshAfterReview}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        ))}
        {!loading && !orders.length && !error && (
          <p className="rounded-2xl bg-brand-secondary-soft p-8 text-brand-muted">
            No orders yet. Your next delicious meal is waiting.
          </p>
        )}
      </div>
    </section>
  );
}

