import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { imageFor, money } from '../utils/format';
import { toneSoft } from '../utils/statusStyles';

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  if (!items.length)
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-5 text-3xl font-black">Your cart is waiting.</h1>
        <p className="mt-2 text-brand-muted">
          Add something wonderful from the kitchen.
        </p>
        <Link
          to="/menu"
          className="mt-6 inline-block rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark"
        >
          Browse menu
        </Link>
      </section>
    );
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-4xl font-black">Your order</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_19rem]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              className="flex flex-col gap-4 rounded-2xl bg-brand-surface p-4 shadow-sm sm:flex-row"
              key={item._id}
            >
              <img
                className="h-20 w-20 rounded-xl bg-brand-secondary-soft object-contain p-1"
                src={imageFor(item)}
                alt=""
              />
              <div className="flex-1">
                <h2 className="font-black">{item.name}</h2>
                <p className="text-brand-secondary">{money(item.price)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-brand-primary-soft"
                  >
                    −
                  </button>
                  <b>{item.quantity}</b>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-brand-primary-soft"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className={`alert alert-danger text-sm font-bold sm:ml-auto ${toneSoft('danger')}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-2xl bg-brand-secondary-dark p-6 text-white">
          <p className="text-brand-secondary-soft">Order total</p>
          <p className="mt-2 text-3xl font-black">{money(total)}</p>
          <Link
            to="/checkout"
            className="mt-6 block rounded-xl bg-brand-primary py-3 text-center font-black text-white transition hover:bg-brand-primary-dark"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
