import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../services/orderService';
import { money } from '../utils/format';
import { getApiErrorMessage } from '../utils/apiError';
import { Message } from './shared';
export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
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
        paymentMethod: 'cash_on_delivery',
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to place your order.'));
    }
  };
  if (!items.length)
    return (
      <section className="p-20 text-center">
        <p>Your cart is empty.</p>
        <Link to="/menu" className="font-bold text-brand-link hover:underline">
          Go to menu
        </Link>
      </section>
    );
  return (
    <section className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="text-4xl font-black">Almost there.</h1>
      <form
        onSubmit={submit}
        className="mt-8 rounded-3xl bg-brand-surface p-7 shadow-sm"
      >
        <label className="text-sm font-bold">
          Delivery address
          <textarea
            required
            name="deliveryAddress"
            rows="4"
            placeholder="House number, street, area, city"
            className="mt-2 w-full rounded-xl border border-brand-border p-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
        </label>
        <div className="mt-5 rounded-xl bg-brand-primary-soft p-4 text-sm">
          <b>Cash on delivery</b>
          <span className="float-right font-black text-brand-secondary-dark">
            {money(total)}
          </span>
        </div>
        <button className="mt-6 w-full rounded-xl bg-brand-primary py-3.5 font-black text-white transition hover:bg-brand-primary-dark">
          Confirm order
        </button>
        <Message error={error} />
      </form>
    </section>
  );
}
