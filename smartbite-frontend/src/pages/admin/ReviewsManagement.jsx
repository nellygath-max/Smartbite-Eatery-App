import { useEffect, useState } from 'react';
import { getReviews } from '../../services/reviewService';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getReviews()
      .then(({ data }) => {
        if (active) setReviews(data?.reviews || []);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-black">Customer reviews</h1>
      <p className="mt-2 text-brand-muted">
        Monitor feedback and ratings from your customers.
      </p>
      <div className="mt-7 rounded-3xl bg-brand-surface p-8 shadow-sm">
        {loading ? (
          <p className="text-brand-muted">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-brand-muted">No reviews available yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((item) => (
              <li key={item.id} className="rounded-2xl border border-brand-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-brand-secondary-dark">{item.menuItem?.name || 'Menu item'}</p>
                  <p className="text-sm font-bold text-brand-muted">★ {item.rating}/5</p>
                </div>
                <p className="mt-2 text-sm text-brand-muted">By {item.user?.name || 'Customer'}</p>
                <p className="mt-2 leading-7 text-brand-text">{item.review}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
