import { Link, Navigate, useLocation } from 'react-router-dom';
import { money } from '../utils/format';

export default function PaymentSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <section className="page-shell py-20 text-center">
      <div className="content-card mx-auto max-w-xl p-8 md:p-10">
        <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-brand-status-success/15 text-2xl font-black text-brand-status-success" aria-hidden="true">
          ✓
        </span>
        <h1 className="mt-5 text-3xl font-black text-brand-text">Payment successful</h1>
        <p className="mt-3 text-brand-muted">
          We received your payment of <span className="font-bold text-brand-text">{money(order.totalAmount)}</span> and your order is now being processed.
        </p>
        {order.paymentReference && (
          <p className="mt-4 rounded-xl bg-brand-primary-soft p-3 text-sm text-brand-muted">
            Reference: <span className="font-bold text-brand-text">{order.paymentReference}</span>
          </p>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/orders" className="rounded-xl bg-brand-primary px-5 py-3 font-black text-white transition hover:bg-brand-primary-dark">
            View my orders
          </Link>
          <Link to="/menu" className="rounded-xl border border-brand-border px-5 py-3 font-black text-brand-text transition hover:bg-brand-secondary-soft">
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
