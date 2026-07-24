import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Paystack from '@paystack/inline-js';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import {
  cancelPaystackPayment,
  createOrder,
  verifyPaystackPayment,
} from '../services/orderService';
import { imageFor, money } from '../utils/format';
import { getApiErrorMessage } from '../utils/apiError';
import { Message } from './shared';
export default function Checkout() {
  const { items, total, clearCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [paystackChannel, setPaystackChannel] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const cancelOrder = () => {
    const shouldCancel = window.confirm(
      'Cancel this order and remove all items from your cart?'
    );
    if (!shouldCancel) return;
    clearCart();
    navigate('/menu');
  };

  const cancelPendingPaystackPayment = async (orderId) => {
    try {
      await cancelPaystackPayment(orderId);
    } catch {
      // The payment may already have been completed. It remains safe to verify it.
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setPaymentMessage('');
    setIsSubmitting(true);
    let paystackOrderId;

    const order = {
      items: items.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
      })),
      deliveryAddress: new FormData(e.target).get('deliveryAddress'),
      paymentMethod,
      ...(paymentMethod === 'paystack' ? { paystackChannel } : {}),
    };

    try {
      const { data } = await createOrder(order);

      if (paymentMethod === 'payment_on_delivery') {
        clearCart();
        navigate('/orders');
        return;
      }

      if (!data.accessCode || !data.order?._id) {
        throw new Error('Unable to start the Paystack payment. Please try again.');
      }

      paystackOrderId = data.order._id;
      const popup = new Paystack();
      popup.resumeTransaction(data.accessCode, {
        onSuccess: async (transaction) => {
          setPaymentMessage('Verifying your payment…');
          try {
            const reference = transaction?.reference || transaction?.trxref;
            const { data: verification } = await verifyPaystackPayment(paystackOrderId, reference);
            clearCart();
            navigate('/payment-success', {
              replace: true,
              state: { order: verification.order },
            });
          } catch (err) {
            setError(
              getApiErrorMessage(
                err,
                'Your payment could not be verified yet. Please contact support with your payment reference.'
              )
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel: async () => {
          await cancelPendingPaystackPayment(paystackOrderId);
          setError('Payment cancelled. Your cart is still available.');
          setIsSubmitting(false);
        },
        onError: async (paymentError) => {
          await cancelPendingPaystackPayment(paystackOrderId);
          setError(paymentError?.message || 'Unable to load Paystack. Please try again.');
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      if (paystackOrderId) {
        await cancelPendingPaystackPayment(paystackOrderId);
      }
      setError(getApiErrorMessage(err, 'Unable to place your order.'));
      setIsSubmitting(false);
    }
  };
  if (!items.length)
    return (
      <section className="page-shell py-20 text-center">
        <div className="content-card mx-auto max-w-xl p-10">
          <p className="text-lg font-bold text-brand-text">Your cart is empty.</p>
          <Link to="/menu" className="mt-4 inline-block font-bold text-brand-link hover:underline">
            Go to menu
          </Link>
        </div>
      </section>
    );
  return (
    <section className="page-shell py-14">
      <h1 className="section-title max-w-2xl">Almost there.</h1>
      <div className="mt-6 rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-black">Cart items</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl bg-brand-secondary-soft p-3 sm:flex-row sm:items-center"
            >
              <img
                src={imageFor(item)}
                alt={item.name}
                className="h-16 w-16 rounded-xl bg-brand-surface object-contain p-1"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-brand-text">{item.name}</p>
                <p className="text-sm text-brand-muted">{money(item.price)} each</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-brand-primary-soft font-black text-brand-text"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm font-black">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  disabled={Number.isFinite(Number(item.stock)) && item.quantity >= Number(item.stock)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-brand-primary-soft font-black text-brand-text disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item._id)}
                  className="rounded-lg border border-brand-status-danger/30 px-3 py-1 text-sm font-bold text-brand-status-danger transition hover:bg-brand-status-danger/10"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={submit}
        className="mt-8 content-card p-6 md:p-7"
      >
        <label className="text-sm font-bold">
          Delivery address
          <textarea
            required
            name="deliveryAddress"
            rows="4"
            placeholder="House number, street, area, city"
            className="mt-2 w-full rounded-xl border border-brand-border p-4 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
        </label>
        {paymentMethod === 'paystack' && user?.email && (
          <p className="mt-3 text-sm text-brand-muted">
            Your Paystack receipt will be sent to <span className="font-bold text-brand-text">{user.email}</span>.
          </p>
        )}
        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-brand-text">Payment method</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                paymentMethod === 'paystack'
                  ? 'border-brand-primary bg-brand-primary-soft'
                  : 'border-brand-border bg-brand-surface hover:bg-brand-secondary-soft'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="paystack"
                checked={paymentMethod === 'paystack'}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="sr-only"
              />
              <span className="block font-black text-brand-text">Pay online with Paystack</span>
              <span className="mt-1 block text-sm text-brand-muted">
                Visa, Mastercard, Verve, or bank transfer.
              </span>
            </label>
            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                paymentMethod === 'payment_on_delivery'
                  ? 'border-brand-primary bg-brand-primary-soft'
                  : 'border-brand-border bg-brand-surface hover:bg-brand-secondary-soft'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="payment_on_delivery"
                checked={paymentMethod === 'payment_on_delivery'}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="sr-only"
              />
              <span className="block font-black text-brand-text">Payment on delivery</span>
              <span className="mt-1 block text-sm text-brand-muted">
                Pay when your order arrives.
              </span>
            </label>
          </div>
          {paymentMethod === 'paystack' && (
            <label className="mt-4 block text-sm font-bold text-brand-text" htmlFor="paystack-channel">
              Choose Paystack payment type
              <select
                id="paystack-channel"
                value={paystackChannel}
                onChange={(event) => setPaystackChannel(event.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full cursor-pointer appearance-auto rounded-xl border border-brand-primary bg-brand-surface px-4 py-3 text-brand-text outline-none transition focus:border-brand-primary-dark focus:ring-4 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="card">Card (Visa, Mastercard, Verve)</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </label>
          )}
        </fieldset>
        <div className="mt-5 rounded-xl bg-brand-primary-soft p-4 text-sm">
          <b>Order total</b>
          <span className="float-right font-black text-brand-secondary-dark">
            {money(total)}
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-primary py-3.5 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Processing…'
              : paymentMethod === 'paystack'
                ? `Pay ${money(total)} with Paystack`
                : 'Confirm order'}
          </button>
          <button
            type="button"
            onClick={cancelOrder}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-brand-border bg-brand-surface py-3.5 font-black text-brand-text transition hover:bg-brand-secondary-soft"
          >
            Cancel order
          </button>
        </div>
        {paymentMessage && (
          <p className="alert alert-info">{paymentMessage}</p>
        )}
        <Message error={error} />
      </form>
    </section>
  );
}
