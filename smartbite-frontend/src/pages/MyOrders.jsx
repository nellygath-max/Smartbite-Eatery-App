import { useEffect, useState } from 'react';
import { getMyOrders } from '../services/orderService';
import { money, shortDate } from '../utils/format';
import { orderStatusClass, orderStatusLabel } from '../utils/orderStatus';
import { extract } from './pageHelpers';
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(extract(data, 'orders')))
      .catch(() => {});
  }, []);
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-4xl font-black">My orders</h1>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article
            key={order._id}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex justify-between gap-4">
              <div>
                <b>Order #{order._id?.slice(-6)}</b>
                <p className="mt-1 text-sm text-stone-500">
                  {shortDate(order.createdAt)} · {order.items?.length} items
                </p>
              </div>
              <span
                className={`h-fit rounded-full px-3 py-1 text-sm font-bold capitalize ${orderStatusClass(order.status)}`}
              >
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <p className="mt-4 font-black text-emerald-800">
              {money(order.totalAmount)}
            </p>
          </article>
        ))}
        {!orders.length && (
          <p className="rounded-2xl bg-stone-100 p-8 text-stone-500">
            No orders yet. Your next delicious meal is waiting.
          </p>
        )}
      </div>
    </section>
  );
}
