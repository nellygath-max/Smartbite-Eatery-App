import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../services/orderService';
import { imageFor, money } from '../utils/format';
import { getApiErrorMessage } from '../utils/apiError';
import { Message } from './shared';
export default function Checkout() {
  const { items, total, clearCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const cancelOrder = () => {
    const shouldCancel = window.confirm(
      'Cancel this order and remove all items from your cart?'
    );
    if (!shouldCancel) return;
    clearCart();
    navigate('/menu');
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createOrder({
        items: items.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: total,
        deliveryAddress: new FormData(e.target).get('deliveryAddress'),
        paymentMethod: 'payment_on_delivery',
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to place your order.'));
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
                  className="grid h-8 w-8 place-items-center rounded-lg bg-brand-primary-soft font-black text-brand-text"
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
        <div className="mt-5 rounded-xl bg-brand-primary-soft p-4 text-sm">
          <b>Payment on delivery</b>
          <span className="float-right font-black text-brand-secondary-dark">
            {money(total)}
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="w-full rounded-xl bg-brand-primary py-3.5 font-black text-white transition hover:bg-brand-primary-dark">
            Confirm order
          </button>
          <button
            type="button"
            onClick={cancelOrder}
            className="w-full rounded-xl border border-brand-border bg-brand-surface py-3.5 font-black text-brand-text transition hover:bg-brand-secondary-soft"
          >
            Cancel order
          </button>
        </div>
        <Message error={error} />
      </form>
    </section>
  );
}
