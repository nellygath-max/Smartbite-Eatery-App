import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { imageFor, money } from '../utils/format';

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  if (!items.length)
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-5 text-3xl font-black">Your cart is waiting.</h1>
        <p className="mt-2 text-stone-500">
          Add something wonderful from the kitchen.
        </p>
        <Link
          to="/menu"
          className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
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
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
              key={item._id}
            >
              <img
                className="h-20 w-20 rounded-xl object-cover"
                src={imageFor(item)}
                alt=""
              />
              <div className="flex-1">
                <h2 className="font-black">{item.name}</h2>
                <p className="text-emerald-700">{money(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-stone-100"
                  >
                    −
                  </button>
                  <b>{item.quantity}</b>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-stone-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="ml-auto text-sm font-bold text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-2xl bg-stone-950 p-6 text-white">
          <p className="text-stone-400">Order total</p>
          <p className="mt-2 text-3xl font-black">{money(total)}</p>
          <Link
            to="/checkout"
            className="mt-6 block rounded-xl bg-orange-500 py-3 text-center font-black"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
