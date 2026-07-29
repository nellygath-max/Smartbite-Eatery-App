import { useEffect, useState } from 'react';
import ReviewModal from './ReviewModal';
import { getPendingReviewNotifications } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';

export default function PendingReviewPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    getPendingReviewNotifications()
      .then(({ data }) => setNotifications(data?.notifications || []))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => setNotifications([]));
      return;
    }
    getPendingReviewNotifications()
      .then(({ data }) => setNotifications(data?.notifications || []))
      .catch(() => setNotifications([]));
  }, [user]);

  if (!notifications.length) return null;

  return (
    <>
      <section className="page-shell pb-0">
        <div className="rounded-3xl border border-brand-border bg-brand-primary-soft p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">How was your meal?</h2>
              <p className="mt-1 text-sm text-brand-muted">
                You have {notifications.length} delivered meal{notifications.length === 1 ? '' : 's'} waiting for a review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(notifications[0])}
              className="rounded-xl bg-brand-primary px-5 py-3 font-black text-white transition hover:bg-brand-primary-dark"
            >
              Rate Now
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {notifications.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelected(item)}
                className="rounded-xl bg-brand-surface px-4 py-3 text-left text-sm font-bold text-brand-text transition hover:bg-white"
              >
                {item.message}
              </button>
            ))}
          </div>
        </div>
      </section>
      <ReviewModal notification={selected} onClose={() => setSelected(null)} onSubmitted={load} />
    </>
  );
}
