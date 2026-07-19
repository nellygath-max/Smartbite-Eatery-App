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
        <Link to="/menu" className="font-bold text-emerald-700">
          Go to menu
        </Link>
      </section>
    );
  return (
    <section className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="text-4xl font-black">Almost there.</h1>
      <form
        onSubmit={submit}
        className="mt-8 rounded-3xl bg-white p-7 shadow-sm"
      >
        <label className="text-sm font-bold">
          Delivery address
          <textarea
            required
            name="deliveryAddress"
            rows="4"
            placeholder="House number, street, area, city"
            className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-emerald-600"
          />
        </label>
        <div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm">
          <b>Cash on delivery</b>
          <span className="float-right font-black text-emerald-800">
            {money(total)}
          </span>
        </div>
        <button className="mt-6 w-full rounded-xl bg-emerald-700 py-3.5 font-black text-white">
          Confirm order
        </button>
        <Message error={error} />
      </form>
    </section>
  );
}
